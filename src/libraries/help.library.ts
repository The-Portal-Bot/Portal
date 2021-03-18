import { Client, Guild, GuildChannel, GuildMember, Message, MessageEmbed, PermissionString, TextChannel, User } from "discord.js";
import { writeFileSync } from "jsonfile";
import { cloneDeep } from "lodash";
import winston, { createLogger, format, Logger, transports } from "winston";
import { VideoSearchResult } from "yt-search";
import config from '../config.json';
import { GuildPrtl, MusicData } from "../types/classes/GuildPrtl.class";
import { Field, ReturnPormise, ReturnPormiseVoice, TimeElapsed, TimeRemaining } from "../types/classes/TypesPrtl.interface";
import { client_talk, client_write } from "./localisation.library";
import { fetch_guild, fetch_guild_list, set_music_data } from "./mongo.library";

const logger = createLogger({
	format: format.combine(
		format.timestamp({
			format: 'DD-MM-YY HH:mm:ss'
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json()
	),
	defaultMeta: { service: 'portal' },
	// you can also add a mongo transport to store logs in the database (there is a performance penalty)
	transports: []
});

export function get_logger(): winston.Logger {
	return logger;
}

export function max_string(
	abstract: string, max: number
): string {
	return abstract.length < max
		? abstract
		: abstract.substring(0, max - 3) + '...';
}

export function get_key_from_enum(
	value: string, enumeration: any
): string | number | undefined {
	for (let e in enumeration) {
		if (e === value) {
			return enumeration[e];
		}
	}

	return undefined;
}

export function create_music_message(
	channel: TextChannel, guild_object: GuildPrtl
): void {
	const idle_thumbnail = 'https://raw.githubusercontent.com/keybraker/' +
		'Portal/master/src/assets/img/music_empty.png';

	const music_message_emb = create_rich_embed(
		'Music Player',
		'Type and Portal will play',
		'#e60026',
		[
			{ emote: 'Duration', role: '-', inline: true },
			{ emote: 'Views', role: '-', inline: true },
			{ emote: 'Pinned', role: guild_object.music_data.pinned ? 'yes' : 'no', inline: true },
			{ emote: 'Queue', role: 'empty', inline: false },
			{ emote: 'Latest Action', role: '```music message created```', inline: false }
		],
		null,
		null,
		true,
		null,
		idle_thumbnail,
		'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.png'
	);

	channel
		.send(music_message_emb)
		.then(sent_message => {
			sent_message.react('▶️');
			sent_message.react('⏸');
			sent_message.react('⏭');
			sent_message.react('➖');
			sent_message.react('➕');
			sent_message.react('📌');
			sent_message.react('🧹');
			sent_message.react('🚪');

			const music_data = new MusicData(channel.id, sent_message.id, [], false);
			set_music_data(guild_object.id, music_data);
		});
};

export function update_music_message(
	guild: Guild, guild_object: GuildPrtl, yts: VideoSearchResult | undefined,
	status: string, animated = true
): Promise<boolean> {
	return new Promise((resolve) => {
		const idle_thumbnail = 'https://raw.githubusercontent.com/keybraker/' +
			'Portal/master/src/assets/img/music_empty.png';

		const music_queue = guild_object.music_queue ?
			guild_object.music_queue.length > 1
				? guild_object.music_queue
					.map((v, i) => {
						if (i !== 0 && i < 6) {
							return (`${i}. ${max_string(v.title, 61)}`);
						} else if (i === 6) {
							return `_...${guild_object.music_queue.length - 6} more_`;
						}
					})
					.filter(v => !!v)
					.join('\n')
				: 'empty'
			: 'empty';

		const music_message_emb = create_rich_embed(
			yts ? yts.title : 'Music Player',
			yts ? yts.url : 'Type and Portal will play it !',
			'#e60026',
			[
				{ emote: 'Duration', role: yts ? yts.timestamp : '-', inline: true },
				{ emote: 'Views', role: (yts ? yts.timestamp : 0) === 0 ? '-' : yts ? yts.views : '-', inline: true },
				{ emote: 'Pinned', role: guild_object.music_data.pinned ? 'yes' : 'no', inline: true },
				{ emote: 'Queue', role: music_queue, inline: false },
				{ emote: 'Latest Action', role: '```' + status + '```', inline: false }
			],
			null,
			null,
			true,
			null,
			yts ? yts.thumbnail : idle_thumbnail,
			animated
				? 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.gif'
				: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.png'
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
	client: Client, guild_object: GuildPrtl, user: User, announce_entrance: boolean
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

		const voice_connection_in_guild = client.voice?.connections
			.find(connection => connection.channel.guild.id === user.presence.member?.voice.channel?.guild.id);

		if (voice_connection_in_guild &&
			voice_connection_in_guild.channel.id === user.presence.member.voice.channel?.id
		) {
			voice_connection_in_guild?.voice?.setSelfDeaf(true);
			return resolve({
				result: true,
				value: 'already in voice channel',
				voice_connection: voice_connection_in_guild
			});
		} else if (!voice_connection_in_guild ||
			(voice_connection_in_guild && !voice_connection_in_guild.channel.members.some(m => !m.user.bot))
		) {
			const current_voice = user.presence.member?.voice.channel;

			if (!current_voice) {
				return resolve({
					result: false,
					value: `could not find your voice channel`,
					voice_connection: undefined,
				});
			}

			current_voice.join()
				.then(response => {
					if (announce_entrance) {
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
					return resolve({
						result: false,
						value: `failed to join voice channel (${e})`,
						voice_connection: undefined,
					});
				});
		}
	});
}

export async function join_user_voice(
	client: Client, message: Message, guild_object: GuildPrtl, join: boolean = false
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

		if (!guild_object) {
			return resolve({
				result: false,
				value: 'could not find guild of message',
				voice_connection: undefined
			});
		}

		if (!client.voice) {
			return resolve({
				result: false,
				value: 'could not fetch portal\'s voice connections',
				voice_connection: undefined
			});
		}

		const voice_connection_in_guild = client.voice.connections
			.find(connection => connection.channel.guild.id === message.guild?.id);

		if (
			voice_connection_in_guild &&
			voice_connection_in_guild.channel.id === message.member.voice.channel?.id
		) {
			voice_connection_in_guild?.voice?.setSelfDeaf(true);
			return resolve({
				result: true,
				value: 'already in voice channel',
				voice_connection: voice_connection_in_guild
			});
		} else if (
			!voice_connection_in_guild ||
			(voice_connection_in_guild && !voice_connection_in_guild.channel.members.some(m => !m.user.bot))
		) {
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
					return resolve({
						result: false,
						value: `error while joining voice connection (${e})`,
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
	title: string | null | undefined,
	description: string | null | undefined,
	colour: string | null | undefined,
	field_array: Field[] | null,
	thumbnail: string | null | undefined,
	member: GuildMember | null | undefined,
	from_bot: boolean | null | undefined,
	url: string | null | undefined,
	image: string | null | undefined,
	custom_gif?: string,
	author?: { name: string, icon: string }
): MessageEmbed {
	const portal_icon_url: string = 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/portal_logo_spinr.gif';

	const rich_message: MessageEmbed = new MessageEmbed();

	if (title) rich_message.setTitle(title);
	if (url) rich_message.setURL(url);
	if (colour) rich_message.setColor(colour);
	if (description) rich_message.setDescription(description);
	if (from_bot) rich_message.setFooter('Portal', custom_gif ? custom_gif : portal_icon_url).setTimestamp();
	if (thumbnail) rich_message.setThumbnail(thumbnail);
	if (image) rich_message.setImage(image);
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
	if (member) {
		const url = member.user.avatarURL() !== null
			? member.user.avatarURL()
			: undefined;
		rich_message
			.setAuthor(member.displayName, url !== null ? url : undefined, undefined);
	}
	if (author) rich_message.setAuthor(author.name, author.icon);

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
	member: GuildMember
): boolean {
	const administrator: PermissionString = 'ADMINISTRATOR';
	const options: { checkAdmin: boolean, checkOwner: boolean } = { checkAdmin: true, checkOwner: true };

	if (member.hasPermission(administrator, options)) {
		return true;
	}

	if (member.roles.cache) {
		return member.roles.cache.some(r => r.name.toLocaleLowerCase() === 'p.admin');
	}

	return false;
};

export function is_dj(
	member: GuildMember
): boolean {
	if (member.roles.cache) {
		return member.roles.cache.some(r => r.name.toLocaleLowerCase() === 'p.dj');
	}

	return false;
};

export function is_ignored(
	member: GuildMember
): boolean {
	if (member.roles.cache) {
		return member.roles.cache.some(r => r.name.toLocaleLowerCase() === 'p.ignore');
	}

	return false;
};


export function message_help(
	type: string, argument: string, info: string = ``
): string {
	return `${(info === ``) ? `` : `` + `${info}\n`}` +
		`get help by typing \`./help ${argument}\`\n` +
		`*https://portal-bot.xyz/docs/${type}/detailed/${argument}*`;
}

export function message_reply(
	status: boolean, message: Message, user: User, str: string,
	to_delete: boolean = config.delete_msg,
	emote_pass: string = '✔️', emote_fail: string = '❌'
): void {
	if (message && !message.channel.deleted && str !== null) {
		message.channel
			.send(`${user}, ${str}`)
			.then(msg => {
				if (msg.deletable) {
					msg
						.delete({ timeout: config.delete_msg_after * 1000 })
						.catch(e => {
							get_logger().log({ level: 'error', type: 'none', message: `failed to delete message / ${e}` });
						});
				}
			})
			.catch(e => {
				get_logger().log({ level: 'error', type: 'none', message: `failed to send message / ${e}` });
			});
	}

	if (message && !message.deleted) {
		if (status === true) {
			message
				.react(emote_pass)
				.catch(e => {
					get_logger().log({ level: 'error', type: 'none', message: `failed to react to message / ${e}` });
				});
		}
		else if (status === false) {
			message
				.react(emote_fail)
				.catch(e => {
					get_logger().log({ level: 'error', type: 'none', message: `failed to react to message / ${e}` });
				});
		}

		if (message && to_delete && message.deletable) {
			message
				.delete({ timeout: 5000 })
				.catch(e => {
					get_logger().log({ level: 'error', type: 'none', message: `failed to delete message / ${e}` });
				});
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
													get_logger().log({
														level: 'info', type: 'none', message: `deleted empty channel: ${channel.name} ` +
															`(${channel.id}) from ${channel.guild.name}`
													});
												})
												.catch(e => {
													get_logger().log({ level: 'error', type: 'none', message: `failed to send message / ${e}` });
												});
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