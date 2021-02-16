import {
	Channel, Client, Guild, GuildChannel, GuildMember, Message,
	MessageEmbed, PermissionString, TextChannel, User
} from "discord.js";
import { writeFileSync } from "jsonfile";
import { cloneDeep } from "lodash";
import { VideoSearchResult } from "yt-search";
import config from '../config.json';
import { GuildPrtl, MusicData } from "../types/classes/GuildPrtl";
import {
	Field, ReturnPormise, ReturnPormiseVoice, TimeElapsed,
	TimeRemaining
} from "../types/interfaces/InterfacesPrtl";
import { client_talk, client_write } from "./localisationOps";
import { fetch_guild, fetch_guild_list, set_music_data } from "./mongoOps";

export function create_music_message(
	channel: TextChannel, thumbnail: string, guild_object: GuildPrtl
): void {
	const music_message_emb = create_rich_embed(
		'Music Player',
		'Type and Portal will play',
		'#0000FF',
		[
			{ emote: 'Duration', role: '-', inline: true },
			{ emote: 'Views', role: '-', inline: true },
			{ emote: 'Uploaded', role: '-', inline: true },
			{ emote: 'Queue', role: '-', inline: false },
			{ emote: 'Latest Action', role: '-', inline: false }
		],
		thumbnail,
		null,
		true,
		null,
		thumbnail
	);

	channel
		.send(music_message_emb)
		.then(sent_message => {
			sent_message.react('▶️');
			sent_message.react('⏸');
			// sent_message.react('⏹');
			sent_message.react('⏭');
			sent_message.react('🧹');
			sent_message.react('🚪');

			const music_data = new MusicData(channel.id, sent_message.id, []);
			set_music_data(guild_object.id, music_data);
		});
};

export function update_music_message(
	guild: Guild, guild_object: GuildPrtl, yts: VideoSearchResult, status: string
): Promise<boolean> {
	return new Promise((resolve) => {
		const portal_icon_url = 'https://raw.githubusercontent.com/' +
			'keybraker/keybraker.github.io/master/assets/img/logo.png';

		const music_queue = guild_object.music_queue.length > 1
			? guild_object.music_queue.map((v, i) => {
				if (i !== 0) {
					return (`${i}. **${v.title}**`);
				}
			}).filter(v => !!v).join('\n')
			: 'empty';

		const music_message_emb = create_rich_embed(
			yts.title,
			yts.url,
			'#0000FF',
			[
				{ emote: 'Duration', role: yts.timestamp, inline: true },
				{ emote: 'Views', role: yts.views === 0 ? '-' : yts.views, inline: true },
				{ emote: 'Uploaded', role: yts.ago, inline: true },
				{ emote: 'Queue', role: music_queue, inline: false },
				{ emote: 'Latest Action', role: '`' + status + '`', inline: false }
			],
			portal_icon_url,
			null,
			true,
			null,
			yts.thumbnail
		);

		const guild_channel: GuildChannel | undefined = guild.channels.cache
			.find(c => c.id === guild_object.music_data.channel_id);

		if (!guild_channel) {
			return resolve(false);
		}

		const channel: TextChannel = <TextChannel>guild_channel;

		if (!channel) {
			return resolve(false);
		}

		if (!guild_object.music_data.message_id) {
			return resolve(false);
		}

		if (guild_object.music_data.message_id) {
			if (channel) {
				channel.messages
					.fetch(guild_object.music_data.message_id)
					.then((message: Message) => {
						message.edit(music_message_emb)
							.then(() => {
								return resolve(true);
							})
							.catch(() => {
								return resolve(false);
							});
					})
					.catch(() => {
						return resolve(false);
					});
			}
		}
	});
};

export async function join_by_reaction(
	client: Client, guild_object: GuildPrtl, user: User, join: boolean
): Promise<ReturnPormiseVoice> { // localize
	return new Promise((resolve) => {
		if (!user.presence) {
			return resolve({
				result: false,
				value: 'no user presence',
				voice_connection: undefined
			});
		}

		if (!user.presence.member) {
			return resolve({
				result: false,
				value: 'no user presence member',
				voice_connection: undefined
			});
		}

		if (!user.presence.member.voice) {
			return resolve({
				result: false,
				value: 'you must be connected to a voice channel',
				voice_connection: undefined
			});
		}

		if (!user.presence.member.voice.channel) {
			return resolve({
				result: false,
				value: 'you must be connected to a voice channel',
				voice_connection: undefined
			});
		}

		const current_voice = user.presence.member?.voice.channel;

		const voice_connection_in_guild = client.voice?.connections
			.find(connection => connection.channel.guild.id === user.presence.member?.voice.channel?.guild.id);

		if (voice_connection_in_guild) {
			if (voice_connection_in_guild.channel.id === user.presence.member?.voice.channel?.id) {
				voice_connection_in_guild?.voice?.setSelfDeaf(true);
				return resolve({
					result: true,
					value: 'already in voice channel',
					voice_connection: voice_connection_in_guild
				});
			} else {
				return resolve({
					result: false,
					value: 'playing music in another channel',
					voice_connection: voice_connection_in_guild
				});
			}
		} else {
			current_voice.join()
				.then(response => {
					if (join) {
						client_talk(client, guild_object, 'join');
					}

					response.voice?.setDeaf(true); // setSelfDeaf(true);

					return resolve({
						result: true,
						value: 'join',
						voice_connection: response,
					});
				})
				.catch(e => {
					console.log('ERROR CREATING VOICE CONNECTION TO CHANNEL: ', e);

					return resolve({
						result: false,
						value: 'failed to join voice channel',
						voice_connection: undefined,
					});
				});
		}
	});
}

export async function join_user_voice(
	client: Client, message: Message, guild_object: GuildPrtl, join: boolean
): Promise<ReturnPormiseVoice> {
	return new Promise((resolve) => {
		if (!message.member) {
			return resolve({
				result: false,
				value: 'message has no member',
				voice_connection: undefined
			});
		}

		if (!message.guild) {
			return resolve({
				result: false,
				value: 'message has no guild',
				voice_connection: undefined
			});
		}

		const current_voice = message.member.voice.channel;

		if (!current_voice) {
			return resolve({
				result: false,
				value: 'you are not connected to any channel',
				voice_connection: undefined
			});
		}

		if (current_voice.guild.id !== message.guild.id) {
			return resolve({
				result: false,
				value: 'your current channel is on another guild',
				voice_connection: undefined
			});
		}

		if (!guild_object) {
			return resolve({
				result: false,
				value: 'could not find guild of message',
				voice_connection: undefined
			});
		}

		// const portal_list = guild_object.portal_list;

		// const controlled_by_portal = portal_list.some(p =>
		// 	p.voice_list.some(v => v.id === current_voice.id)
		// );

		// if (!controlled_by_portal) {
		// 	return resolve({
		// 		result: false,
		// 		value: 'I can only connect to my channels',
		// 		voice_connection: undefined
		// 	});
		// }

		if (!client.voice) {
			return resolve({
				result: false,
				value: 'could not fetch portal\'s voice connections',
				voice_connection: undefined
			});
		}

		const voice_connection_in_guild = client.voice.connections
			.find(connection => connection.channel.guild.id === message.guild?.id);

		if (voice_connection_in_guild) {
			if (voice_connection_in_guild.channel.id === message.member?.voice.channel?.id) {
				voice_connection_in_guild?.voice?.setSelfDeaf(true);
				return resolve({
					result: true,
					value: 'already in voice channel',
					voice_connection: voice_connection_in_guild
				});
			} else {
				return resolve({
					result: false,
					value: 'playing music in another channel',
					voice_connection: voice_connection_in_guild
				});
			}
		} else {
			current_voice.join()
				.then(response => {
					if (join) {
						client_talk(client, guild_object, 'join');
					}

					response.voice?.setSelfDeaf(true);

					return resolve({
						result: true,
						value: client_write(message, guild_object, 'join'),
						voice_connection: response,
					});
				})
				.catch(e => {
					console.log('ERROR CREATING VOICE CONNECTION TO CHANNEL: ', e);

					return resolve({
						result: false,
						value: 'failed to join voice channel',
						voice_connection: undefined,
					});
				});
		}
	});
};

export function getJSON(
	str: string
): any | null {
	let data = null;
	try {
		data = JSON.parse(str);
	}
	catch (error) {
		return null;
	}
	return data;
};

export function create_rich_embed(
	title: string | null | undefined, description: string | null | undefined, colour: string | null | undefined,
	field_array: Field[], thumbnail: string | null | undefined, member: GuildMember | null | undefined, from_bot: boolean | null | undefined,
	url: string | null | undefined, image: string | null | undefined
): MessageEmbed {
	const portal_icon_url: string = 'https://raw.githubusercontent.com/keybraker/keybraker' +
		'.github.io/master/assets/img/logo.png';
	const keybraker_url: string = 'https://github.com/keybraker';

	const rich_message: MessageEmbed = new MessageEmbed()
		.setTimestamp();
	// .setAuthor('Portal', portal_icon_url, keybraker_url)

	if (title) rich_message.setTitle(title);
	if (url) rich_message.setURL(url);
	if (colour) rich_message.setColor(colour);
	if (description) rich_message.setDescription(description);
	if (from_bot) rich_message.setFooter('Portal bot by Keybraker', portal_icon_url);
	if (thumbnail) rich_message.setThumbnail(thumbnail);
	if (image) rich_message.setImage(image);
	if (member) {
		const url = member.user.avatarURL() !== null
			? member.user.avatarURL()
			: undefined;
		rich_message
			.setAuthor(member.displayName, url !== null ? url : undefined, undefined);
	}
	if (field_array) {
		field_array.forEach(row => {
			rich_message
				.addField(
					(row.emote === '' || row.emote === null || row.emote === false)
						? '\u200b'
						: '__' + row.emote + '__',
					(row.role === '' || row.role === null || row.role === false)
						? '\u200b'
						: '' + row.role + '',
					row.inline,
				);
		});
	}
	else {
		rich_message.addField('\u200b', '\u200b');
	}

	return rich_message;
};

export async function update_portal_managed_guilds(
	portal_managed_guilds_path: string, guild_list: GuildPrtl[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => { // , reject) => {
		setTimeout(() => {
			const guild_list_no_voice = cloneDeep(guild_list);
			writeFileSync(portal_managed_guilds_path, guild_list_no_voice);
		}, 1000);
		return resolve({ result: true, value: '> saved guild_list.json\n' });
	});
};

export function is_authorised(
	guild_object: GuildPrtl, member: GuildMember
): boolean {
	const administrator: PermissionString = 'ADMINISTRATOR';
	const options: { checkAdmin: boolean, checkOwner: boolean } = { checkAdmin: true, checkOwner: true };

	if (member.hasPermission(administrator, options)) return true;

	if (member.roles.cache) {
		const has_authorised_role = member.roles.cache.some(role =>
			guild_object.auth_role
				? guild_object.auth_role.some((auth: string) => auth === role.id)
				: false
		);
		if (has_authorised_role) return true;
	}

	const member_object = guild_object.member_list.find(m => m.id === member.id);
	return !!member_object && member_object.admin;
};

export function message_reply(
	status: boolean, channel: Channel, message: Message, user: User, str: string,
	guild_object: GuildPrtl | undefined, client: Client, to_delete: boolean = config.delete_msg,
	emote_pass: string = '✔️', emote_fail: string = '❌'
): void {
	if (!message.channel.deleted && str !== null) {
		message.channel
			.send(`${user}, ${str}`)
			.then(msg => {
				if (msg.deletable)
					msg.delete({
						timeout: config.delete_msg_after * 1000
					})
						.catch(console.log)
			})
			.catch(console.log);
	}
	if (!message.deleted) {
		if (status === true) {
			message
				.react(emote_pass)
				.catch(console.log);
		}
		else if (status === false && guild_object) {
			client_talk(client, guild_object, 'fail');
			message
				.react(emote_fail)
				.catch(console.log);
		}

		if (to_delete && message.deletable) {
			message
				.delete({ timeout: 5000 })
				.catch(console.log);
		}
	}
};

export function is_url(
	potential_url: string
): boolean {
	const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

	return pattern.test(potential_url);
};

export function pad(
	num: number
): string {
	if (num.toString().length >= 2) {
		return '' + num;
	}
	else {
		return '0' + num;
	}
};

export function time_elapsed(
	timestamp: Date | number, timeout: number
): TimeElapsed {
	const time_elapsed = Date.now() - (typeof timestamp === 'number' ? timestamp : timestamp.getTime());
	const timeout_time = timeout * 60 * 1000;

	const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0
		? Math.round((timeout_time / 1000 / 60))
		: 0;
	const timeout_sec = Math.round((timeout_time / 1000) % 60);

	const remaining_hrs = Math.round(
		(time_elapsed / 1000 / 60 / 60)) > 0
		? Math.round((time_elapsed / 1000 / 60 / 60))
		: 0;
	const remaining_min = Math.round(
		(time_elapsed / 1000 / 60) - 1) > 0
		? Math.round((time_elapsed / 1000 / 60) - 1)
		: 0;
	const remaining_sec = Math.round(
		(time_elapsed / 1000) % 60) > 0
		? Math.round((time_elapsed / 1000) % 60)
		: 0;

	return { timeout_min, timeout_sec, remaining_hrs, remaining_min, remaining_sec };
};

export function time_remaining(
	timestamp: number, timeout: number
): TimeRemaining {
	const time_elapsed = Date.now() - timestamp;
	const timeout_time = timeout * 60 * 1000;
	const time_remaining = timeout_time - time_elapsed;

	const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0
		? Math.round((timeout_time / 1000 / 60))
		: 0;
	const timeout_sec = Math.round((timeout_time / 1000) % 60)
		? Math.round((timeout_time / 1000) % 60)
		: 0;
	const remaining_min = Math.round((time_remaining / 1000 / 60) - 1) > 0
		? Math.round((time_remaining / 1000 / 60) - 1)
		: 0;

	const remaining_sec = Math.round((time_remaining / 1000) % 60);

	return { timeout_min, timeout_sec, remaining_min, remaining_sec };
};

// needs update 
export function remove_deleted_channels(
	guild: Guild
): Promise<boolean> {
	let removed_channel = false;
	return new Promise((resolve) => {
		fetch_guild(guild.id)
			.then(guild_object => {
				if (guild_object) {
					guild_object.portal_list.forEach((p, index_p) => {
						if (!guild.channels.cache.some(c => c.id === p.id)) {
							guild_object.portal_list.splice(index_p, 1);
							removed_channel = true;
						}
						p.voice_list.forEach((v, index_v) => {
							if (!guild.channels.cache.some(c => c.id === v.id)) {
								p.voice_list.splice(index_v, 1);
								removed_channel = true;
							}
						});
					});

					removed_channel = guild_object.url_list.some((u_id, index_u) => {
						if (!guild.channels.cache.some(c => c.id === u_id)) {
							guild_object.url_list.splice(index_u, 1);
							return true;
						}
						return false;
					});

					guild_object.role_list.forEach((r, index_r) => {
						!guild.channels.cache.some(c => {
							if (c instanceof TextChannel) {
								let found = false;
								c.messages
									.fetch(r.message_id)
									.then((message: Message) => {
										// clear from emotes leave only those from portal
										found = true;
									})
									.catch(() => {
										guild_object.role_list.splice(index_r, 1);
									});
								removed_channel = found;
								return found;
							}
							return false;
						});
					});

					guild_object.member_list.forEach((m, index_m) => {
						if (!guild.members.cache.some(m => m.id === m.id)) {
							guild_object.url_list.splice(index_m, 1);
							removed_channel = true;
						}
					});

					if (!guild.channels.cache.some(c => c.id === guild_object.spotify)) {
						removed_channel = true;
						guild_object.spotify = null;
					}

					if (!guild.channels.cache.some(c => c.id === guild_object.music_data.channel_id)) {
						removed_channel = true;
						guild_object.music_data.channel_id = undefined;
						guild_object.music_data.message_id = undefined;
						guild_object.music_data.votes = undefined;
					}

					if (!guild.channels.cache.some(c => c.id === guild_object.announcement)) {
						removed_channel = true;
						guild_object.announcement = null;
					}

					return resolve(true);
				}
				return resolve(false);
			})
	});
}

export function remove_empty_voice_channels(
	guild: Guild
): Promise<boolean> {
	return new Promise((resolve) => {
		fetch_guild_list()
			.then(guild_list => {
				if (guild_list) {
					guild.channels.cache.forEach(channel => {
						guild_list.some(g =>
							g.portal_list.some(p =>
								p.voice_list.some((v, index) => {
									if (v.id === channel.id && channel.members.size === 0) {
										if (channel.deletable) {
											channel
												.delete()
												.then(g => {
													p.voice_list.splice(index, 1);
													console.log(`deleted empty channel: ${channel.name} ` +
														`(${channel.id}) from ${channel.guild.name}`);
												})
												.catch(console.log);
										}
										return true;
									}
									return false
								})
							)
						);
					});
					return resolve(true);
				}
				return resolve(false);
			})
			.catch();
	});
};