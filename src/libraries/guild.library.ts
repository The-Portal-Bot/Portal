import {
	CategoryChannel, CategoryChannelResolvable, ChannelType, Collection, Guild,
	GuildChannelCreateOptions,
	GuildMember,
	Message, MessageCollector, OverwriteResolvable, PermissionsBitField, Role, TextChannel, VoiceBasedChannel, VoiceChannel, VoiceState
} from "discord.js";
import moment from "moment";
import voca from 'voca';
import { PortalChannelTypes } from "../data/enums/PortalChannel.enum";
import { PGuild } from '../types/classes/PGuild.class';
import { PChannel } from '../types/classes/PPortalChannel.class';
import { PVoiceChannel } from '../types/classes/PVoiceChannel.class';
import { ATTRIBUTE_PREFIX as attributePrefix, getAttribute, isAttribute } from '../types/interfaces/Attribute.interface';
import { get_pipe, is_pipe, pipe_prefix } from '../types/interfaces/Pipe.interface';
import { get_variable, is_variable, variable_prefix } from '../types/interfaces/Variable.interface';
import { createMusicLyricsMessage, createMusicMessage, getJsonFromString, logger, maxString } from './help.library';
import { insert_voice } from "./mongo.library";

function inlineOperator(
	str: string
): any {
	switch (str) {
		case '==':
			return (a: string, b: string) => a == b;
		case '===':
			return (a: string, b: string) => a === b;
		case '!=':
			return (a: string, b: string) => a != b;
		case '!==':
			return (a: string, b: string) => a !== b;
		case '>':
			return (a: string, b: string) => a > b;
		case '<':
			return (a: string, b: string) => a < b;
		case '>=':
			return (a: string, b: string) => a >= b;
		case '<=':
			return (a: string, b: string) => a <= b;
	}
}

export function getOptions(
	guild: Guild, topic: string, can_write: boolean = true,
	parent?: CategoryChannelResolvable, type: ChannelType = ChannelType.GuildText
): GuildChannelCreateOptions {
	return {
		parent: parent,
		permissionOverwrites: can_write
			? [{
				id: guild.id,
				deny: ['SEND_MESSAGES'],
			}]
			: [],
		topic: `by Portal, ${topic}`,
		type: type,
		nsfw: false
	} as GuildChannelCreateOptions;
}

export function includedInPortalGuilds(guild_id: string, guild_list: PGuild[]): boolean {
	return guild_list ? guild_list.some(g => g.id === guild_id) : false;
}

export function includedInpChannels(channel_id: string, pChannels: PChannel[]): boolean {
	return pChannels ? pChannels.some(p => p.id === channel_id) : false;
}

export function includedInVoiceList(channel_id: string, pChannels: PChannel[]): boolean {
	return pChannels ? pChannels.some(p => p.voice_list.some(v => v.id === channel_id)) : false;
}

export function includedInIgnoreList(channel_id: string, pGuild: PGuild): boolean {
	return pGuild.ignore_list ? pGuild.ignore_list.some(i => i === channel_id) : false;
}

export function isUrlOnlyChannel(channel_id: string, pGuild: PGuild): boolean {
	return pGuild.url_list ? pGuild.url_list.some(u => u === channel_id) : false;
}

export function isMusicChannel(channel_id: string, pGuild: PGuild): boolean {
	return pGuild ? pGuild.music_data.channel_id === channel_id : false;
}

export function isAnnouncementChannel(channel_id: string, pGuild: PGuild): boolean {
	return pGuild ? pGuild.announcement === channel_id : false;
}

export function getRole(guild: Guild | null, roleIdOrName: string): Role | undefined {
	return guild?.roles.cache.find(cached_role =>
		cached_role.id === roleIdOrName || cached_role.name === roleIdOrName
	);
}

export async function createChannel(
	guild: Guild, channelName: string, channelOptions: GuildChannelCreateOptions,
	channelCategory: string | null
): Promise<string> {
	const newGuildChannel = await guild.channels.create({ ...channelOptions, name: channelName });

	if (!newGuildChannel) {
		return Promise.reject(new Error('failed to create new channel'));
	}

	if (typeof channelCategory === "string") { // create category
		const newGuildCategoryChannel = await guild.channels
			.create({ name: channelName, type: ChannelType.GuildCategory }); // channelName

		if (!newGuildCategoryChannel) {
			return Promise.reject(new Error('failed to create new category channel'));
		}

		newGuildChannel
			.setParent(newGuildCategoryChannel)
			.catch(e => { return Promise.reject(`failed to set parent to channel: ${e}`); });
	}

	return newGuildChannel.id;
}

function createVoiceOptions(
	state: VoiceState, portalObject: PChannel
): GuildChannelCreateOptions {
	let permissionOverwrites = null;
	if (portalObject.allowed_roles) {
		permissionOverwrites = portalObject.allowed_roles
			.map(id => <OverwriteResolvable>{
				id,
				allow: PermissionsBitField.Flags.Connect, // ['CONNECT']
			});

		if (!portalObject.allowed_roles.some(id => id === state.guild.roles.everyone.id)) {
			permissionOverwrites.push({
				id: state.guild.roles.everyone.id,
				deny: PermissionsBitField.Flags.Connect, // ['CONNECT']
			});
		}

		if (state.member) {
			permissionOverwrites.push({
				id: state.member.id,
				allow: PermissionsBitField.Flags.Connect, // ['CONNECT']
			});
		}
	}

	return {
		type: ChannelType.GuildVoice,
		bitrate: 96000,
		userLimit: portalObject.user_limit_portal,
		parent: state.channel?.parent
			? state.channel?.parent
			: undefined,
		permissionOverwrites: permissionOverwrites
	} as GuildChannelCreateOptions;
}

export async function create_voiceChannel(
	state: VoiceState, portalObject: PChannel
): Promise<string | boolean> {
	if (!state) {
		return Promise.reject(`there is no state`);
	} else if (!state.channel) {
		return Promise.reject(`state has no channel`);
	} else if (!state.member) {
		return Promise.reject(`state has no member`);
	}

	let voice_options: GuildChannelCreateOptions = createVoiceOptions(state, portalObject);

	const newGuildVoiceChannel = await state.guild.channels.create({ ...voice_options, name: 'loading..' });
	if (!newGuildVoiceChannel) {
		return false;
	}

	const newVoice = new PVoiceChannel(
		newGuildVoiceChannel.id, state.member.id, portalObject.render, portalObject.regex_voice, portalObject.no_bots,
		portalObject.locale, portalObject.ann_announce, portalObject.ann_user
	);

	insert_voice(state.member.guild.id, portalObject.id, newVoice)
		.catch(e => {
			return Promise.reject(`failed to store voice channel: ${e}`);
		});

	await state.member.voice.setChannel(newGuildVoiceChannel as unknown as VoiceBasedChannel); // as VoiceBasedChannel)

	return `created channel and moved member to new voice`;
}

export async function create_music_channel(
	guild: Guild, music_channel: string, music_category: string | CategoryChannel | null, pGuild: PGuild
): Promise<boolean> {
	let newMusicCategoryGuildChannel: CategoryChannel | undefined;
	if (music_category && typeof music_category === 'string') { // with category		
		newMusicCategoryGuildChannel = await guild.channels
			.create({ name: music_category, type: ChannelType.GuildCategory })
			.catch(e => {
				return Promise.reject(`failed to create music category: ${e}`);
			});
	}
	else if (music_category) { // with category object given
		newMusicCategoryGuildChannel = music_category as CategoryChannel;
	}

	const newMusicGuildChannel = await guild.channels
		.create(

			{
				name: `${music_channel}`,
				parent: newMusicCategoryGuildChannel,
				type: ChannelType.GuildText,
				topic: 'play:▶️, pause:⏸, skip:⏭, pin last:📌, lyrics:📄, queue text:⬇️, clear queue:🧹, leave:🚪' // , vol dwn ➖, vol up ➕
			},
		)
		.catch(e => {
			return Promise.reject(`failed to create focus channel: ${e}`);
		});

	if (!newMusicGuildChannel) {
		return false;
	}

	pGuild.music_data.channel_id = newMusicGuildChannel.id;

	const musicMessageId = await createMusicMessage(newMusicGuildChannel, pGuild)
		.catch(e => {
			return Promise.reject(`failed to send music message: ${e}`);
		});

	if (!musicMessageId) {
		return false;
	}

	logger.log({ level: 'info', type: 'none', message: `send music message ${musicMessageId}` });
	createMusicLyricsMessage(newMusicGuildChannel, pGuild, musicMessageId)
		.catch(e => {
			return Promise.reject(`failed to send music lyrics message: ${e}`);
		});

	return true;
}

export async function moveMembersBack(
	oldChannel: VoiceBasedChannel, member: GuildMember, member_found: GuildMember
): Promise<string> {
	if (!oldChannel.deletable) {
		return Promise.reject('could not move to original voice channel because it was deleted');
	}

	const setUserBackToOriginalChannel = await member.voice.setChannel(oldChannel)
		.catch(e => { return Promise.reject(`focus did not end properly: ${e}`); });

	if (!setUserBackToOriginalChannel) {
		return Promise.reject(`did not move requester back to original channel`);
	}

	const setUserFocusBackToOriginalChannel = await member_found.voice.setChannel(oldChannel)
		.catch(e => { return Promise.reject(`focus did not end properly: ${e}`); });

	if (!setUserFocusBackToOriginalChannel) {
		return Promise.reject(`did not move requested back to original channel`);
	}

	return 'focus ended properly';
}

export async function create_focus_channel(
	guild: Guild, member: GuildMember, member_found: GuildMember,
	focus_time: number, portalObject: PChannel
): Promise<string> {
	if (!member.voice.channel) {
		return Promise.reject(`member is not in a voice channel`);
	}

	const chatRoomName = `${focus_time === 0
		? 'Private Room'
		: `PR-${focus_time}' $hour:$minute/${moment()
			.add(focus_time, focus_time === 1 ? "minute" : "minutes")
			.format('hh:mm')}`
		}`;

	const voiceOptions: GuildChannelCreateOptions = {
		name: chatRoomName,
		type: ChannelType.GuildVoice,
		bitrate: 96000,
		userLimit: 2,

	};

	const newVoiceChannel = await guild.channels
		.create(voiceOptions)
		.catch(e => { return Promise.reject(`failed to create focus channel: ${e}`); });

	if (!newVoiceChannel) {
		return Promise.reject(`failed to create new voice channel`);
	}

	member.voice.setChannel(newVoiceChannel as unknown as VoiceBasedChannel) // as VoiceBasedChannel)
		.catch(e => { return Promise.reject(`failed to set member to new channel: ${e}`); });

	member_found.voice.setChannel(newVoiceChannel as unknown as VoiceBasedChannel) // as VoiceBasedChannel)
		.catch(e => { return Promise.reject(`failed to set member to new channel: ${e}`); });


	insert_voice(guild.id, portalObject.id, new PVoiceChannel(
		newVoiceChannel.id, member.id, portalObject.render, chatRoomName, portalObject.no_bots,
		portalObject.locale, portalObject.ann_announce, portalObject.ann_user
	))
		.catch(e => { return Promise.reject(`failed to store voice channel: ${e}`); });

	if (focus_time === 0) {
		return 'private room successfully created';
	}

	return focus_time === 0
		? 'private room successfully created'
		: 'focus channel successfully created';
}

export async function delete_channel(
	type: PortalChannelTypes, channel_to_delete: VoiceChannel | TextChannel,
	message: Message | null, isPortal = false
): Promise<boolean> {
	if (isPortal && channel_to_delete.deletable) {
		const channelDeleted = await channel_to_delete
			.delete()
			.catch(e => {
				return Promise.reject(`failed to delete channel: ${e}`);
			});

		return !!channelDeleted;
	}

	if (!message) {
		return Promise.reject(`message is undefined`);
	}

	const author = message.author;
	const channel_to_delete_name = channel_to_delete.name;
	let replied_with_yes = false;

	const messageQuestion = await message.channel
		.send(
			`${message.author}, do you wish to delete old ` +
			`${PortalChannelTypes[type].toString()} channel **${channel_to_delete}** (yes / no) ?`
		)
		.catch(e => {
			return Promise.reject(`failed to send message: ${e}`);
		});


	const filter = (m: Message) => (m.author.id === author.id);
	const collector: MessageCollector = message.channel
		.createMessageCollector({ filter, time: 10000 });

	collector.on('collect', (m: Message) => {
		if (m.content === 'yes' || m.content === 'no') {
			replied_with_yes = m.content === 'yes' ? true : false;
			collector.stop();
		}
	});

	collector.on('end', (collected: Collection<string, Message>) => {
		collected.forEach((reply_message: Message) => {
			if (reply_message.deletable) {
				reply_message
					.delete()
					.catch(e => {
						return Promise.reject(`failed to delete message: ${e}`);
					});
			}
		});

		if (!replied_with_yes) {
			messageQuestion
				.edit(`channel **"${channel_to_delete}"** will not be deleted`)
				.then(msg => {
					setTimeout(() =>
						msg
							.delete()
							.catch(e => {
								return Promise.reject(`failed to delete message: ${e}`);
							}),
						5000
					);
				})
				.catch(e => {
					return Promise.reject(`failed to send message: ${e}`);
				});
		} else {
			if (channel_to_delete.deletable) {
				channel_to_delete
					.delete()
					.then(() => {
						messageQuestion
							.edit(`channel **"${channel_to_delete_name}"** deleted`)
							.then(edit_message => {
								setTimeout(() =>
									edit_message
										.delete()
										.then(() => {
											return true;
										})
										.catch(e => {
											return Promise.reject(`failed to delete message: ${e}`);
										}),
									5000
								);
							})
							.catch(e => {
								return Promise.reject(`failed to send message: ${e}`);
							});
					})
					.catch(e => {
						return Promise.reject(`failed to delete channel: ${e}`);
					});
			}
			else {
				messageQuestion
					.edit(`channel **"${channel_to_delete}"** is not deletable`)
					.then(edit_message => {
						setTimeout(() =>
							edit_message
								.delete()
								.then(() => {
									return true;
								})
								.catch(e => {
									return Promise.reject(`failed to delete message: ${e}`);
								}),
							5000
						);
					})
					.catch(e => {
						return Promise.reject(`failed to send message: ${e}`);
					});
			}
		}
	});

	return true;
}

export async function generate_channelName(
	voiceChannel: VoiceChannel, pChannels: PChannel[],
	pGuild: PGuild, guild: Guild
): Promise<boolean> {
	for (let i = 0; i < pChannels.length; i++) {
		for (let j = 0; j < pChannels[i].voice_list.length; j++) {
			if (pChannels[i].voice_list[j].id === voiceChannel.id) {
				// I choose not to fetch the voice regex from database
				// if it changed users can create a new one instead of
				// me creating an database spam 
				let regex = pChannels[i].voice_list[j].regex;
				if (pChannels[i].regex_overwrite) {
					const member = voiceChannel.members
						.find(m => m.id === pChannels[i].voice_list[j].creator_id);

					if (member) {
						const member_object = pGuild.member_list
							.find(m => m.id === member.id);

						if (member_object?.regex && member_object.regex !== 'null') {
							regex = member_object.regex;
						}
					}
				}

				const new_name = pChannels[i].voice_list[j].render
					? regex_interpreter(
						regex,
						voiceChannel,
						pChannels[i].voice_list[j],
						pChannels,
						pGuild,
						guild,
						pChannels[i].voice_list[j].creator_id
					)
					: regex;

				if (new_name.length >= 1) {
					const capped_new_name = maxString(new_name, 99);
					if (voiceChannel.name !== capped_new_name) {
						await voiceChannel
							.edit({ name: capped_new_name })
							.catch(e => {
								return Promise.reject(`failed to edit voice channel: ${e}`);
							});

						return true;
					}
					else {
						return false;
					}
				}
				else {
					return true;
				}
			}
		}
	}

	return true;
}

export function regex_interpreter(
	regex: string, voiceChannel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
	pChannels: PChannel[] | undefined | null, pGuild: PGuild, guild: Guild, member_id: string
): string {
	let lastSpaceIndex = 0;
	let lastVariableEndIndex = 0;
	let lastAttributeEndIndex = 0;

	let lastVariable = '';
	let lastAttribute = '';
	let newChannelName = '';

	for (let i = 0; i < regex.length; i++) {
		if (regex[i] === variable_prefix) {
			const variable = is_variable(regex.substring(i));

			if (variable.length !== 0) {
				const returnValue: string | number = <string>get_variable( // maybe make any ?
					voiceChannel, voice_object, pChannels, pGuild, guild, variable
				);

				if (returnValue !== null) {
					lastVariable = returnValue;
					newChannelName += returnValue;
					i += voca.chars(variable).length;
					lastVariableEndIndex = i;
				}
				else {
					newChannelName += regex[i];
				}
			}
			else {
				newChannelName += regex[i];
			}
		}
		else if (regex[i] === attributePrefix) {
			const attr = isAttribute(regex.substring(i));

			if (attr.length !== 0) {
				// const member_object = pGuild.member_list.find(m => m.id === member_id);

				const returnValue = getAttribute(
					voiceChannel, voice_object, pChannels, pGuild, guild, attr //, member_object
					// voiceChannel, voice_object, p, pGuild, attr, member_object
				);


				if (returnValue !== null) {
					lastAttribute = `${returnValue}`;
					newChannelName += returnValue;
					i += voca.chars(attr).length;
					lastAttributeEndIndex = i;
				}
				else {
					newChannelName += regex[i];
				}
			}
			else {
				newChannelName += regex[i];
			}
		}
		else if (regex[i] === pipe_prefix) {
			const pipe = is_pipe(regex.substring(i));

			if (pipe.length !== 0) {
				if (lastVariableEndIndex + 1 === i) {
					const returnValue = get_pipe(lastVariable, pipe);

					if (returnValue !== null) {
						newChannelName = newChannelName.substring(0,
							voca.chars(newChannelName).length - voca.chars(lastVariable).length);
						newChannelName += returnValue;
						i += voca.chars(pipe).length;
					}
					else {
						newChannelName += regex[i];
					}
				}
				else if (lastAttributeEndIndex + 1 === i) {
					const returnValue = get_pipe(lastAttribute, pipe);

					if (returnValue !== null) {
						newChannelName = newChannelName.substring(0,
							voca.chars(newChannelName).length - voca.chars(lastAttribute).length);
						newChannelName += returnValue;
						i += voca.chars(pipe).length;
					}
					else {
						newChannelName += regex[i];
					}
				}
				else {
					const returnValue = get_pipe(newChannelName.substring(lastSpaceIndex, newChannelName.length), pipe);

					if (returnValue !== null) {
						const str_for_pipe = returnValue;
						newChannelName = newChannelName.substring(0, lastSpaceIndex);
						newChannelName += str_for_pipe;
						i += voca.chars(pipe).length;
					}
					else {
						newChannelName += regex[i];
					}
				}
			}
			else {
				newChannelName += regex[i];
			}
		}
		else if (regex[i] === '{' && (regex[i + 1] !== undefined && regex[i + 1] === '{')) {
			try {
				// did not put into structure_list due to many unnecessary function calls
				let isValid = false;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const statement = getJsonFromString(regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1));

				if (!statement) return 'error';

				if (Object.prototype.hasOwnProperty.call(statement, 'if')) {
					if (Object.prototype.hasOwnProperty.call(statement, 'is')) {
						if (Object.prototype.hasOwnProperty.call(statement, 'with')) {
							if (Object.prototype.hasOwnProperty.call(statement, 'yes')) {
								if (Object.prototype.hasOwnProperty.call(statement, 'no')) {
									isValid = true;
								}
							}
						}
					}
				}

				if (!isValid) {
					newChannelName += regex[i];
					if (regex[i] === ' ') { lastSpaceIndex = i + 1; }
				}
				else {
					if (statement.is === "==" || statement.is === "===" || statement.is === "!=" || statement.is === "!==" ||
						statement.is === ">" || statement.is === "<" || statement.is === ">=" || statement.is === "<=") {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						if (inlineOperator(statement.is)(
							regex_interpreter(statement.if, voiceChannel, voice_object, pChannels, pGuild, guild, member_id),
							regex_interpreter(statement.with, voiceChannel, voice_object, pChannels, pGuild, guild, member_id)
						)) {
							const value = regex_interpreter(statement.yes, voiceChannel, voice_object, pChannels, pGuild, guild, member_id);
							if (value !== '--') {
								newChannelName += value;
							}
						}
						else {
							const value = regex_interpreter(statement.no, voiceChannel, voice_object, pChannels, pGuild, guild, member_id);
							if (value !== '--') {
								newChannelName += value;
							}
						}
						i += regex.substring(i + 1).indexOf('}}') + 2;
					} else {
						return 'error';
					}
				}
			}
			catch (e) {
				logger.log({ level: 'info', type: 'none', message: `failed to parse json: ${e}` });
				newChannelName += regex[i];
			}

		}
		else {
			newChannelName += regex[i];
			if (regex[i] === ' ') { lastSpaceIndex = i + 1; }
		}
	}

	if (newChannelName === '') {
		return '';
	}

	return newChannelName;
}