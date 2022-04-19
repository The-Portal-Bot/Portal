/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import {
	CategoryChannel, CategoryChannelResolvable, Collection, CollectorFilter, Guild,
	GuildChannelCreateOptions,
	GuildMember, Message, MessageCollector, OverwriteResolvable, Role, TextChannel, VoiceBasedChannel, VoiceChannel, VoiceState
} from "discord.js";
import { ChannelTypes } from "discord.js/typings/enums";
import moment from "moment";
import voca from 'voca';
import { PortalChannelTypes } from "../data/enums/PortalChannel.enum";
import { GuildPrtl } from '../types/classes/GuildPrtl.class';
import { PortalChannelPrtl } from '../types/classes/PortalChannelPrtl.class';
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";
import { VoiceChannelPrtl } from '../types/classes/VoiceChannelPrtl.class';
import { attribute_prefix, get_attribute, is_attribute } from '../types/interfaces/Attribute.interface';
import { get_pipe, is_pipe, pipe_prefix } from '../types/interfaces/Pipe.interface';
import { get_variable, is_variable, variable_prefix } from '../types/interfaces/Variable.interface';
import { create_lyrics_message, create_music_message, get_json, logger, max_string } from './help.library';
import { insert_voice } from "./mongo.library";

function inline_operator(
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

export function get_options(
	guild: Guild, topic: string, can_write: boolean = true, parent?: CategoryChannelResolvable
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
		type: ChannelTypes.GUILD_TEXT,
		nsfw: false
	} as GuildChannelCreateOptions;
}

//

export function included_in_portal_guilds(guild_id: string, guild_list: GuildPrtl[]): boolean {
	return guild_list ? guild_list.some(g => g.id === guild_id) : false;
}

export function included_in_portal_list(channel_id: string, portal_list: PortalChannelPrtl[]): boolean {
	return portal_list ? portal_list.some(p => p.id === channel_id) : false;
}

export function included_in_voice_list(channel_id: string, portal_list: PortalChannelPrtl[]): boolean {
	return portal_list ? portal_list.some(p => p.voice_list.some(v => v.id === channel_id)) : false;
}

export function included_in_ignore_list(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object.ignore_list ? guild_object.ignore_list.some(i => i === channel_id) : false;
}

export function is_url_only_channel(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object.url_list ? guild_object.url_list.some(u => u === channel_id) : false;
}

export function is_music_channel(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object ? guild_object.music_data.channel_id === channel_id : false;
}

export function is_announcement_channel(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object ? guild_object.announcement === channel_id : false;
}

//

export function get_role(guild: Guild | null, role_name_or_name: string): Role | undefined {
	return guild?.roles.cache.find(cached_role =>
		cached_role.id === role_name_or_name || cached_role.name === role_name_or_name
	);
}

//

export async function create_channel(
	guild: Guild, channel_name: string, channel_options: GuildChannelCreateOptions,
	channel_category: string | null
): Promise<string> {
	const newGuildChannel = await guild.channels.create(channel_name, channel_options);

	if (!newGuildChannel) {
		return Promise.reject(new Error('failed to create new channel'));
	}

	if (typeof channel_category === "string") { // create category
		const newGuildCategoryChannel = await guild.channels
			.create(channel_name, { type: ChannelTypes.GUILD_CATEGORY });

		if (!newGuildCategoryChannel) {
			return Promise.reject(new Error('failed to create new category channel'));
		}

		newGuildChannel
			.setParent(newGuildCategoryChannel)
			.catch(e => Promise.reject(`failed to set parent to channel / ${e}`));
	}

	return newGuildChannel.id;
}

function createVoiceOptions(
	state: VoiceState, portalObject: PortalChannelPrtl
): GuildChannelCreateOptions {
	let permission_overwrites = null;
	if (portalObject.allowed_roles) {
		permission_overwrites = portalObject.allowed_roles
			.map(id => <OverwriteResolvable>{
				id: id,
				allow: ['CONNECT']
			});

		if (!portalObject.allowed_roles.some(id => id === state.guild.roles.everyone.id)) {
			permission_overwrites.push({
				id: state.guild.roles.everyone.id,
				deny: ['CONNECT']
			});
		}

		if (state.member) {
			permission_overwrites.push({
				id: state.member.id,
				allow: ['CONNECT']
			});
		}
	}

	return {
		type: ChannelTypes.GUILD_VOICE,
		bitrate: 96000,
		userLimit: portalObject.user_limit_portal,
		parent: state.channel?.parent
			? state.channel?.parent
			: undefined,
		permissionOverwrites: permission_overwrites
	} as GuildChannelCreateOptions;
}

export async function create_voice_channel(
	state: VoiceState, portalObject: PortalChannelPrtl
): Promise<string | boolean> {
	if (!state) {
		return Promise.reject(`there is no state`);
	} else if (!state.channel) {
		return Promise.reject(`state has no channel`);
	} else if (!state.member) {
		return Promise.reject(`state has no member`);
	}

	let voice_options: GuildChannelCreateOptions = createVoiceOptions(state, portalObject);

	const newGuildVoiceChannel = await state.guild.channels.create('loading..', voice_options);
	if (!newGuildVoiceChannel) {
		return false;
	}

	const newVoice = new VoiceChannelPrtl(
		newGuildVoiceChannel.id, state.member.id, portalObject.render, portalObject.regex_voice, portalObject.no_bots,
		portalObject.locale, portalObject.ann_announce, portalObject.ann_user
	);

	insert_voice(state.member.guild.id, portalObject.id, newVoice)
		.catch(e => {
			return Promise.reject(`failed to store voice channel / ${e}`);
		});

	await state.member.voice.setChannel(newGuildVoiceChannel as VoiceBasedChannel);

	return `created channel and moved member to new voice`;
}

export async function create_music_channel(
	guild: Guild, music_channel: string, music_category: string | CategoryChannel | null, guild_object: GuildPrtl
): Promise<boolean> {
	let newMusicCategoryGuildChannel: CategoryChannel | undefined;
	if (music_category && typeof music_category === 'string') { // with category		
		newMusicCategoryGuildChannel = await guild.channels
			.create(music_category, { type: ChannelTypes.GUILD_CATEGORY })
			.catch(e => {
				return Promise.reject(`faild to create music category / ${e}`);
			});
	}
	else if (music_category) { // with category object given
		newMusicCategoryGuildChannel = music_category as CategoryChannel;
	}

	const newMusicGuildChannel = await guild.channels
		.create(
			`${music_channel}`,
			{
				parent: newMusicCategoryGuildChannel,
				type: ChannelTypes.GUILD_TEXT,
				topic: 'play:▶️, pause:⏸, skip:⏭, pin last:📌, lyrics:📄, queue text:⬇️, clear queue:🧹, leave:🚪' // , vol dwn ➖, vol up ➕
			},
		)
		.catch(e => {
			return Promise.reject(`failed to create focus channel / ${e}`);
		});

	if (!newMusicGuildChannel) {
		return false;
	}

	guild_object.music_data.channel_id = newMusicGuildChannel.id;

	const musicMessageId = await create_music_message(newMusicGuildChannel, guild_object)
		.catch(e => {
			return Promise.reject(`failed to send music message / ${e}`);
		});

	if (!musicMessageId) {
		return false;
	}

	logger.log({ level: 'info', type: 'none', message: `send music message ${musicMessageId}` });
	create_lyrics_message(newMusicGuildChannel, guild_object, musicMessageId)
		.catch(e => {
			return Promise.reject(`failed to send music lyrics message / ${e}`);
		});

	return true;
}

async function moveMembersBack(
	oldChannel: VoiceBasedChannel, member: GuildMember, member_found: GuildMember
): Promise<string> {
	if (!oldChannel.deletable) {
		Promise.reject('could not move to original voice channel because it was deleted');
	}

	const setUserBackToOriginalChannel = await member.voice.setChannel(oldChannel)
		.catch(e => Promise.reject(`focus did not end properly / ${e}`));

	if (!setUserBackToOriginalChannel) {
		return Promise.reject(`did not move requester back to original channel`);
	}

	const setUserFocusBackToOriginalChannel = await member_found.voice.setChannel(oldChannel)
		.catch(e => Promise.reject(`focus did not end properly / ${e}`));

	if (!setUserFocusBackToOriginalChannel) {
		return Promise.reject(`did not move requested back to original channel`);
	}

	return 'focus ended properly';
}

export async function create_focus_channel(
	guild: Guild, member: GuildMember, member_found: GuildMember,
	focus_time: number, portalObject: PortalChannelPrtl
): Promise<string> {
	if (!member.voice.channel) {
		return Promise.reject(`member is not in a voice channel`);
	}

	const voice_options: GuildChannelCreateOptions = {
		type: ChannelTypes.GUILD_VOICE,
		bitrate: 96000,
		userLimit: 2
	};

	const chatroom_name = `${focus_time === 0
		? 'Private Room'
		: `PR-${focus_time}' $hour:$minute/${moment()
			.add(focus_time, focus_time === 1 ? "minute" : "minutes")
			.format('hh:mm')}`
		}`;

	const newVoiceChannel = await guild.channels
		.create(chatroom_name, voice_options)
		.catch(e => Promise.reject(`failed to create focus channel / ${e}`));

	if (!newVoiceChannel) {
		return Promise.reject(`failed to create new voice channel`);
	}

	member.voice.setChannel(newVoiceChannel as VoiceBasedChannel)
		.catch(e => Promise.reject(`failed to set member to new channel / ${e}`));
	member_found.voice.setChannel(newVoiceChannel as VoiceBasedChannel)
		.catch(e => Promise.reject(`failed to set member to new channel / ${e}`));

	insert_voice(guild.id, portalObject.id, new VoiceChannelPrtl(
		newVoiceChannel.id, member.id, portalObject.render, chatroom_name, portalObject.no_bots,
		portalObject.locale, portalObject.ann_announce, portalObject.ann_user
	))
		.catch(e => Promise.reject(`failed to store voice channel / ${e}`));

	if (focus_time === 0) {
		return 'private room successfully created';
	}

	return focus_time === 0
		? 'private room successfully created'
		: 'focus channel successfully created';
}

//

export async function delete_channel(
	type: PortalChannelTypes, channel_to_delete: VoiceChannel | TextChannel,
	message: Message | null, isPortal = false
): Promise<boolean> {
	if (isPortal && channel_to_delete.deletable) {
		const channelDeleted = await channel_to_delete
			.delete()
			.catch(e => {
				return Promise.reject(`failed to delete channel / ${e}`);
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
			return Promise.reject(`failed to send message / ${e}`);
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
						return Promise.reject(`failed to delete message / ${e}`);
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
								return Promise.reject(`failed to delete message / ${e}`);
							}),
						5000
					);
				})
				.catch(e => {
					return Promise.reject(`failed to send message / ${e}`);
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
											return Promise.reject(`failed to delete message / ${e}`);
										}),
									5000
								);
							})
							.catch(e => {
								return Promise.reject(`failed to send message / ${e}`);
							});
					})
					.catch(e => {
						return Promise.reject(`failed to delete channel / ${e}`);
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
									return Promise.reject(`failed to delete message / ${e}`);
								}),
							5000
						);
					})
					.catch(e => {
						return Promise.reject(`failed to send message / ${e}`);
					});
			}
		}
	});

	return true;
}

//

export async function generate_channel_name(
	voice_channel: VoiceChannel, portal_list: PortalChannelPrtl[],
	guild_object: GuildPrtl, guild: Guild
): Promise<boolean> {
	for (let i = 0; i < portal_list.length; i++) {
		for (let j = 0; j < portal_list[i].voice_list.length; j++) {
			if (portal_list[i].voice_list[j].id === voice_channel.id) {
				// I choose not to fetch the voice regex from database
				// if it changed users can create a new one instead of
				// me creating an database spam 
				let regex = portal_list[i].voice_list[j].regex;
				if (portal_list[i].regex_overwrite) {
					const member = voice_channel.members
						.find(m => m.id === portal_list[i].voice_list[j].creator_id);

					if (member) {
						const member_object = guild_object.member_list
							.find(m => m.id === member.id);

						if (member_object?.regex && member_object.regex !== 'null') {
							regex = member_object.regex;
						}
					}
				}

				const new_name = portal_list[i].voice_list[j].render
					? regex_interpreter(
						regex,
						voice_channel,
						portal_list[i].voice_list[j],
						portal_list,
						guild_object,
						guild,
						portal_list[i].voice_list[j].creator_id
					)
					: regex;

				if (new_name.length >= 1) {
					const capped_new_name = max_string(new_name, 99);
					if (voice_channel.name !== capped_new_name) {
						await voice_channel
							.edit({ name: capped_new_name })
							.catch(e => {
								return Promise.reject(`failed to eddit voice channel / ${e}`);
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
	regex: string, voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
	portal_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild, member_id: string
): string {
	let last_space_index = 0;
	let last_vatiable_end_index = 0;
	let last_attribute_end_index = 0;

	let last_variable = '';
	let last_attribute = '';
	let new_channel_name = '';

	for (let i = 0; i < regex.length; i++) {
		if (regex[i] === variable_prefix) {
			const vrbl = is_variable(regex.substring(i));

			if (vrbl.length !== 0) {
				const return_value: string | number = <string>get_variable( // maybe make any ?
					voice_channel, voice_object, portal_list, guild_object, guild, vrbl
				);

				if (return_value !== null) {
					last_variable = return_value;
					new_channel_name += return_value;
					i += voca.chars(vrbl).length;
					last_vatiable_end_index = i;
				}
				else {
					new_channel_name += regex[i];
				}
			}
			else {
				new_channel_name += regex[i];
			}
		}
		else if (regex[i] === attribute_prefix) {
			const attr = is_attribute(regex.substring(i));

			if (attr.length !== 0) {
				// const member_object = guild_object.member_list.find(m => m.id === member_id);

				const return_value = get_attribute(
					voice_channel, voice_object, portal_list, guild_object, guild, attr //, member_object
					// voice_channel, voice_object, p, guild_object, attr, member_object
				);


				if (return_value !== null) {
					last_attribute = `${return_value}`;
					new_channel_name += return_value;
					i += voca.chars(attr).length;
					last_attribute_end_index = i;
				}
				else {
					new_channel_name += regex[i];
				}
			}
			else {
				new_channel_name += regex[i];
			}
		}
		else if (regex[i] === pipe_prefix) {
			const pipe = is_pipe(regex.substring(i));

			if (pipe.length !== 0) {
				if (last_vatiable_end_index + 1 === i) {
					const return_value = get_pipe(last_variable, pipe);

					if (return_value !== null) {
						new_channel_name = new_channel_name.substring(0,
							voca.chars(new_channel_name).length - voca.chars(last_variable).length);
						new_channel_name += return_value;
						i += voca.chars(pipe).length;
					}
					else {
						new_channel_name += regex[i];
					}
				}
				else if (last_attribute_end_index + 1 === i) {
					const return_value = get_pipe(last_attribute, pipe);

					if (return_value !== null) {
						new_channel_name = new_channel_name.substring(0,
							voca.chars(new_channel_name).length - voca.chars(last_attribute).length);
						new_channel_name += return_value;
						i += voca.chars(pipe).length;
					}
					else {
						new_channel_name += regex[i];
					}
				}
				else {
					const return_value = get_pipe(new_channel_name.substring(last_space_index, new_channel_name.length), pipe);

					if (return_value !== null) {
						const str_for_pipe = return_value;
						new_channel_name = new_channel_name.substring(0, last_space_index);
						new_channel_name += str_for_pipe;
						i += voca.chars(pipe).length;
					}
					else {
						new_channel_name += regex[i];
					}
				}
			}
			else {
				new_channel_name += regex[i];
			}
		}
		else if (regex[i] === '{' && (regex[i + 1] !== undefined && regex[i + 1] === '{')) {

			try {
				// did not put into structure_list due to many unnecessary function calls
				let is_valid = false;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const statement = get_json(regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1));

				if (!statement) return 'error';

				if (Object.prototype.hasOwnProperty.call(statement, 'if')) {
					if (Object.prototype.hasOwnProperty.call(statement, 'is')) {
						if (Object.prototype.hasOwnProperty.call(statement, 'with')) {
							if (Object.prototype.hasOwnProperty.call(statement, 'yes')) {
								if (Object.prototype.hasOwnProperty.call(statement, 'no')) {
									is_valid = true;
								}
							}
						}
					}
				}

				if (!is_valid) {
					new_channel_name += regex[i];
					if (regex[i] === ' ') { last_space_index = i + 1; }
				}
				else {
					if (statement.is === "==" || statement.is === "===" || statement.is === "!=" || statement.is === "!==" ||
						statement.is === ">" || statement.is === "<" || statement.is === ">=" || statement.is === "<=") {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						if (inline_operator(statement.is)(
							regex_interpreter(statement.if, voice_channel, voice_object, portal_list, guild_object, guild, member_id),
							regex_interpreter(statement.with, voice_channel, voice_object, portal_list, guild_object, guild, member_id)
						)) {
							const value = regex_interpreter(statement.yes, voice_channel, voice_object, portal_list, guild_object, guild, member_id);
							if (value !== '--') {
								new_channel_name += value;
							}
						}
						else {
							const value = regex_interpreter(statement.no, voice_channel, voice_object, portal_list, guild_object, guild, member_id);
							if (value !== '--') {
								new_channel_name += value;
							}
						}
						i += regex.substring(i + 1).indexOf('}}') + 2;
					} else {
						return 'error';
					}
				}
			}
			catch (e) {
				logger.log({ level: 'info', type: 'none', message: `failed to parse json / ${e}` });
				new_channel_name += regex[i];
			}

		}
		else {
			new_channel_name += regex[i];
			if (regex[i] === ' ') { last_space_index = i + 1; }
		}
	}

	if (new_channel_name === '') {
		return '';
	}

	return new_channel_name;
}