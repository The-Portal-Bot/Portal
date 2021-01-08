import {
	CategoryChannel, Client, Collection, CollectorFilter, Guild, GuildChannel,
	GuildCreateChannelOptions, GuildMember, Message, MessageCollector, TextChannel,
	VoiceChannel, VoiceState, Role
} from "discord.js";
import voca from 'voca';
import { VideoSearchResult } from "yt-search";
import { GuildPrtl, MusicData } from '../types/classes/GuildPrtl';
import { MemberPrtl } from '../types/classes/MemberPrtl';
import { PortalChannelPrtl } from '../types/classes/PortalChannelPrtl';
import { VoiceChannelPrtl } from '../types/classes/VoiceChannelPrtl';
import { attribute_prefix, get_attribute, is_attribute } from '../types/interfaces/Attribute';
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { get_pipe, is_pipe, pipe_prefix } from '../types/interfaces/Pipe';
import { get_variable, is_variable, variable_prefix } from '../types/interfaces/Variable';
import { create_music_message, getJSON, inline_operator } from './helpOps';
import { stop } from './musicOps';

export function getOptions(guild: Guild, topic: string, can_write: boolean): GuildCreateChannelOptions {
	if (can_write)
		return {
			topic: `by Portal, ${topic}`,
			type: 'text',
			nsfw: false
		};
	else
		return {
			permissionOverwrites: [
				{
					id: guild.id,
					deny: ['SEND_MESSAGES'],
				}
			],
			topic: `by Portal, ${topic}`,
			type: 'text',
			nsfw: false
		};
};

export function included_in_portal_guilds(guild_id: string, guild_list: GuildPrtl[]): boolean {
	return guild_list.some(g => g.id === guild_id);
};

export function included_in_portal_list(channel_id: string, portal_list: PortalChannelPrtl[]): boolean {
	return portal_list.some(p => p.id === channel_id);
};

export function included_in_voice_list(channel_id: string, portal_list: PortalChannelPrtl[]): boolean {
	return portal_list.some(p => p.voice_list.some(v => v.id === channel_id));
};

export function included_in_url_list(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object.url_list.some(u => u === channel_id);
};

export function is_spotify_channel(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object.spotify === channel_id;
};

export function is_music_channel(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object.music_data.channel_id === channel_id;
};

export function is_announcement_channel(channel_id: string, guild_object: GuildPrtl): boolean {
	return guild_object.announcement === channel_id;
};

//

export function get_role(guild: Guild, role_name_or_name: string): Role | undefined {
	return guild.roles.cache.find(cached_role =>
		cached_role.id === role_name_or_name || cached_role.name === role_name_or_name
	);
};

export function get_role_name(role_id: string, i: number, message: Message) {
	const role = message?.guild?.roles.cache.find(r => r.id === role_id);
	return role ? `${i + 1}. ${role.name}` : `${i + 1}. undefined`;
};

//

export async function create_channel(guild: Guild, channel_name: string, channel_options: GuildCreateChannelOptions,
	channel_category: string | CategoryChannel | null): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		console.log('channel_name :>> ', channel_name);
		guild.channels
			.create(channel_name, channel_options)
			.then(new_channel => {
				if (channel_category === null) { // does not want category
					return resolve({ result: true, value: new_channel.id });
				} else {
					if (typeof channel_category === "string") { // create category
						guild.channels
							.create(channel_category, { type: 'category' })
							.then(category => {
								new_channel.setParent(category);
								return resolve({ result: true, value: new_channel.id });
							})
							.catch(error => {
								return resolve({ result: false, value: `CH/CR/000: ${error}` });
							});
					} else {
						new_channel.setParent(channel_category);
						return resolve({ result: true, value: new_channel.id });
					}
				}
			})
			.catch(error => {
				return resolve({ result: false, value: `CH/CR/001: ${error}` });
			});
	});
}

export function create_portal_channel(guild: Guild, portal_channel: string,
	portal_category: string | CategoryChannel | null, portal_object: any,
	guild_object: GuildPrtl, creator_id: string): void {

	const voice_name = guild_object.premium
		? 'G$#-P$member_count | $status_list'
		: 'Channel $#'

	if (portal_category && typeof portal_category === 'string') { // with category
		guild.channels
			.create(portal_channel, { type: 'voice', bitrate: 64000, userLimit: 1 })
			.then(channel => {
				portal_object.push(new PortalChannelPrtl(
					channel.id,
					creator_id,
					portal_channel,
					voice_name,
					[],
					false,
					2,
					0,
					0,
					guild_object.locale,
					true,
					true,
					0
				));
				guild.channels
					.create(portal_category, { type: 'category' })
					.then(cat_channel => channel.setParent(cat_channel))
					.catch(console.error);
			})
			.catch(console.error);
	}
	else if (portal_category) { // with category given
		guild.channels
			.create(portal_channel, { type: 'voice', bitrate: 64000, userLimit: 1, parent: portal_category })
			.then(channel => {
				channel.setParent(portal_category);
				portal_object.push(new PortalChannelPrtl(
					channel.id,
					creator_id,
					portal_channel,
					voice_name,
					[],
					false,
					2,
					0,
					0,
					guild_object.locale,
					true,
					true,
					0
				));
			})
			.catch(console.error);
	}
	else { // without category
		guild.channels
			.create(portal_channel, { type: 'voice', bitrate: 64000, userLimit: 1 })
			.then(channel => {
				portal_object.push(new PortalChannelPrtl(
					channel.id,
					creator_id,
					portal_channel,
					voice_name,
					[],
					false,
					2,
					0,
					0,
					guild_object.locale,
					true,
					true,
					0
				));
			})
			.catch(console.error);
	}
};

export function create_voice_channel(state: VoiceState, portal_object: PortalChannelPrtl,
	portal_channel: GuildChannel, creator_id: string): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (state && state.channel) {
			const voice_options: GuildCreateChannelOptions = {
				type: 'voice',
				bitrate: 96000,
				userLimit: portal_object.user_limit_portal,
				parent: state.channel.parent ? state.channel.parent : undefined
			};

			state.channel.guild.channels
				.create('loading...', voice_options)
				.then(channel => {
					if (state.member) {
						portal_object.voice_list.push(new VoiceChannelPrtl(
							channel.id, creator_id, portal_object.regex_voice, false, 0, 0,
							portal_object.locale, portal_object.ann_announce, portal_object.ann_user
						));
						state.member.voice.setChannel(channel);
						return resolve({ result: true, value: `created channel and moved member to new voice` });
					} else {
						return resolve({ result: false, value: `VC/CR/000: could not fetch member` });
					}
				})
				.catch(error => {
					return resolve({ result: false, value: `VC/CR/001: ${error}` });
				});
		}
	});
}

export async function create_music_channel(guild: Guild, music_channel: string,
	music_category: string | CategoryChannel | null, guild_object: GuildPrtl): Promise<void> {
	const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
		'.github.io/master/assets/img/logo.png';
	return new Promise((resolve) => {
		if (music_category && typeof music_category === 'string') { // with category
			guild.channels
				.create(
					`${music_channel}`,
					{
						type: 'text',
						topic: 'Portal Music, play:▶️, pause:⏸, stop:⏹, skip:⏭, list:📜, clear list:❌',
					},
				)
				.then((channel: TextChannel) => {
					guild_object.music_data.channel_id = channel.id;
					guild.channels
						.create(music_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(error => resolve(error));
					create_music_message(channel, portal_icon_url, guild_object);
				})
				.catch(error => resolve(error));
		}
		else if (music_category) { // with category object given
			guild.channels
				.create(
					`${music_channel}`,
					{
						type: 'text',
						topic: 'Portal Music, play:▶️, pause:⏸, stop:⏹, skip:⏭, list:📜, clear list:❌',
						parent: music_category
					},
				)
				.then(channel => {
					channel.setParent(music_category);
					guild_object.music_data.channel_id = channel.id;
					create_music_message(channel, portal_icon_url, guild_object);
				})
				.catch(error => resolve(error));
		}
		else { // without category
			guild.channels
				.create(
					`${music_channel}`,
					{
						type: 'text',
						topic: 'Portal Music, play:▶️, pause:⏸, stop:⏹, skip:⏭, list:📜, clear list:❌',
					},
				)
				.then(channel => {
					guild_object.music_data.channel_id = channel.id;
					create_music_message(channel, portal_icon_url, guild_object);
				})
				.catch(error => resolve(error));
		}
	});
};

export async function create_focus_channel(guild: Guild, member: GuildMember,
	member_found: GuildMember, focus_time: number): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const return_value = { result: false, value: '*you can run "./help focus" for help.*' };
		const oldChannel: VoiceChannel | null = member.voice.channel;
		let newChannel: VoiceChannel | null;

		if (!oldChannel) {
			return resolve(return_value);
		}

		guild.channels.create(
			`${member.displayName}&${member_found.displayName}`, {
			type: 'voice',
			bitrate: 64000,
			userLimit: 2,
		})
			.then(channel => {
				newChannel = channel;
				member.voice.setChannel(channel);
				member_found.voice.setChannel(channel);

				return_value.result = true;
				return_value.value = 'users have been moved.';
			})
			.catch(console.error);

		setTimeout(() => {
			if (!oldChannel.deleted) {
				member.voice.setChannel(oldChannel)
					.then(() => {
						member_found.voice.setChannel(oldChannel)
							.then(() => {
								if (newChannel && newChannel.deletable) {
									newChannel.delete().catch(console.error);
									return_value.result = true;
									return_value.value = 'focus ended properly.';
									return resolve(return_value);
								}
							}).catch(console.error);
					}).catch(console.error);

			}
			else {
				return_value.result = false;
				return_value.value = 'could not move to original channel because it was deleted.';
				return resolve(return_value);
			}
		}, focus_time * 60 * 1000);
	});
};

export function create_member_list(guild_id: string, client: Client): any {
	const member_list: MemberPrtl[] = [];
	const guild: Guild | undefined = client.guilds.cache.find((cached_guild: Guild) => cached_guild.id === guild_id);
	if (guild === undefined) {
		return undefined;
	}
	console.log('new guild :>> ', guild);
	console.log('new guild.members.cache :>> ', guild.members.cache);

	guild.members.cache.forEach(member => {
		if (client.user && !member.user.bot) {
			if (member.id !== client.user.id) {
				member_list.push(new MemberPrtl(member.id, 1, 0, 0, 0, null, false));
			}
		}
	});

	return member_list;
};

export function insert_guild(guild_id: string, guild_list: GuildPrtl[], client: Client): void {
	const portal_list: PortalChannelPrtl[] = [];
	const member_list = create_member_list(guild_id, client);
	const url_list: string[] = [];
	const role_list: any = {};
	const ranks: any = {};
	const auth_role: string[] = [];
	const spotify: string = '';
	const music_data: MusicData = { channel_id: undefined, message_id: undefined, votes: [] };
	const music_queue: VideoSearchResult[] = [];
	const dispatcher: any = null;
	const announcement: string = '';
	const locale: string = 'en';
	const announce: boolean = true;
	const level_speed: string = 'normal';
	const premium: boolean = false;

	guild_list.push(new GuildPrtl(guild_id, portal_list, member_list, url_list, role_list, ranks, auth_role,
		spotify, music_data, music_queue, dispatcher, announcement, locale, announce, level_speed, premium));
};

//

export function delete_guild(guild_id: string, guild_list: GuildPrtl[]): void {
	guild_list.some((g, index) => {
		if (g.id === guild_id)
			guild_list.splice(index, 1)

	});
};

export function delete_channel(channel_to_delete: VoiceChannel | TextChannel,
	message: Message | null, isPortal: boolean = false): void {
	if (!isPortal && message !== null) {
		const author = message.author;
		const channel_to_delete_name = channel_to_delete.name;
		let channel_deleted = false;

		message.channel
			.send(`${message.author}, do you wish to delete old music channel **"${channel_to_delete}"** (yes / no) ?`)
			.then((question_msg: Message) => {
				const filter: CollectorFilter = m => m.author.id === author.id;
				const collector: MessageCollector = message.channel.createMessageCollector(filter, { time: 10000 });

				collector.on('collect', (m: Message) => {
					if (m.content === 'yes') {
						if (channel_to_delete.deletable) {
							channel_to_delete
								.delete()
								.then(g => console.log(`Deleted channel with id: ${g}`))
								.catch(console.error);

							m.channel.send(`Deleted channel **"${channel_to_delete_name}"**.`)
								.then(msg => { msg.delete({ timeout: 5000 }); })
								.catch(error => console.log(error));

							channel_deleted = true;
						}
						else {
							message.channel.send(`Channel **"${channel_to_delete}"** is not deletable.`)
								.then(msg => { msg.delete({ timeout: 5000 }); })
								.catch(error => console.log(error));
						}
						collector.stop();
					}
					else if (m.content === 'no') {
						collector.stop();
					}
				});

				collector.on('end', (collected: Collection<string, Message>) => {
					collected.forEach((reply_message: Message) => {
						if (reply_message.deletable) {
							reply_message
								.delete()
								.catch(console.error);
						}
					});

					if (!channel_deleted) {
						message.channel.send(`Channel **"${channel_to_delete}"** will not be deleted.`)
							.then(msg => { msg.delete({ timeout: 5000 }); })
							.catch(error => console.log(error));
					}
					question_msg.delete({ timeout: 5000 });
				});
			})
			.catch(error => console.log(error));
	}
	else if (channel_to_delete.deletable) {
		channel_to_delete
			.delete()
			.then(g => console.log(`Deleted channel with id: ${g}`))
			.catch(console.error);
	}
};

export function channel_deleted_update_state(channel_to_remove: GuildChannel, guild_list: GuildPrtl[]): number {
	const TypesOfChannel = { Unknown: 0, Portal: 1, Voice: 2, Url: 3, Spotify: 4, Announcement: 5, Music: 6 };
	const current_guild = guild_list.find(g => g.id === channel_to_remove.guild.id);

	if (!current_guild) {
		return -1;
	}

	let type_of_channel = TypesOfChannel.Unknown;

	current_guild.portal_list.some((p, index) => {
		if (p.id === channel_to_remove.id) {
			current_guild.portal_list.splice(index, 1);
			type_of_channel = TypesOfChannel.Portal;
			return true;
		}
		return p.voice_list.some((v, index_v) => {
			if (v.id === channel_to_remove.id) {
				p.voice_list.splice(index_v, 1);
				type_of_channel = TypesOfChannel.Voice;
				return true;
			}
		});
	});

	for (let i = 0; i < current_guild.url_list.length; i++) {
		console.log(`${current_guild.url_list[i]} === ${channel_to_remove.id}`);
		if (current_guild.url_list[i] === channel_to_remove.id) {
			current_guild.url_list.splice(i, 1);
			type_of_channel = TypesOfChannel.Url;
			break;
		}
	}
	if (current_guild.spotify === channel_to_remove.id) {
		current_guild.spotify = null;
		type_of_channel = TypesOfChannel.Spotify;
	}
	if (current_guild.announcement === channel_to_remove.id) {
		current_guild.announcement = null;
		type_of_channel = TypesOfChannel.Announcement;
	}
	if (current_guild.music_data.channel_id === channel_to_remove.id) {
		stop(channel_to_remove.guild.id, guild_list, channel_to_remove.guild);
		current_guild.music_data.channel_id = undefined;
		current_guild.music_data.message_id = undefined;
		current_guild.music_data.votes = [];
		current_guild.dispatcher = undefined;
		type_of_channel = TypesOfChannel.Music;
	}

	return type_of_channel;
};

//

export function generate_channel_name(voice_channel: VoiceChannel, portal_list: PortalChannelPrtl[],
	guild_object: GuildPrtl, guild: Guild): number {
	let return_value: number = 0;
	portal_list.some(p => {
		p.voice_list.some(v => {
			if (v.id === voice_channel.id) {
				const new_name = regex_interpreter(
					v.regex,
					voice_channel,
					v,
					portal_list,
					guild_object,
					guild,
				);

				if (new_name.length >= 1) {
					if (voice_channel.name !== new_name.substring(0, 99)) {
						voice_channel.edit({ name: new_name.substring(0, 99) })
							.then(newChannel => console.log(`Voice's new name from promise is ${newChannel.name}`))
							.catch(console.log);
						return_value = 1;
					}
					else {
						return_value = 2;
					}
				}
				else {
					return_value = 3;
				}
			}
		});
	});

	return return_value;
};

export function regex_interpreter(regex: string, voice_channel: VoiceChannel, voice_object: any,
	portal_list: PortalChannelPrtl[], guild_object: GuildPrtl, guild: Guild): string {

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
				const return_value = get_variable(voice_channel, voice_object, portal_list, guild_object, guild, vrbl);

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
				const portal_object = portal_list.find(p => p.voice_list.some(v => v.id === voice_channel.id));
				if (portal_object) { // tsiakkas elegxos oti paizei kala an den to brei
					const return_value = get_attribute(voice_channel, voice_object, portal_object, guild_object, attr);

					if (return_value !== null) {
						last_attribute = return_value;
						new_channel_name += return_value;
						i += voca.chars(attr).length;
						last_attribute_end_index = i;
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
				const statement = getJSON(regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1));
				if (!statement) {
					return 'error';
				}
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
						if (inline_operator(statement.is)(
							regex_interpreter(statement.if, voice_channel, voice_object, portal_list, guild_object, guild),
							regex_interpreter(statement.with, voice_channel, voice_object, portal_list, guild_object, guild))
						) {
							const value = regex_interpreter(statement.yes, voice_channel, voice_object, portal_list, guild_object, guild);
							if (value !== '--') {
								new_channel_name += value;
							}
						}
						else {
							const value = regex_interpreter(statement.no, voice_channel, voice_object, portal_list, guild_object, guild);
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
			catch (error) {
				console.log('ERROR: in JSON parse: ', error);
				new_channel_name += regex[i];
			}

		}
		else {
			new_channel_name += regex[i];
			if (regex[i] === ' ') { last_space_index = i + 1; }
		}
	}

	if (new_channel_name === '') { return '.'; }
	return new_channel_name;
};