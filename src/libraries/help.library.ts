import { Client, Guild, GuildChannel, GuildMember, Message, MessageEmbed, PermissionString, TextChannel, User, VoiceConnection } from "discord.js";
import moment from "moment";
import { createLogger, format } from "winston";
import { VideoSearchResult } from "yt-search";
import config from '../config.json';
import { GuildPrtl, MusicData } from "../types/classes/GuildPrtl.class";
import { Field, TimeElapsed } from "../types/classes/TypesPrtl.interface";
import { client_talk } from "./localisation.library";
import { fetch_guild, fetch_guild_list, set_music_data } from "./mongo.library";

export const logger = createLogger({
	format: format.combine(
		format.timestamp({
			format: 'DD-MM-YY HH:mm:ss'
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json()
	),
	defaultMeta: { service: 'portal' },
	// you can also add a mongo transport to store logs
	// in the database (there is a performance penalty)
	transports: []
});

export function get_json(
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
): Promise<string> {
	return new Promise((resolve, reject) => {
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
				// sent_message.react('➖');
				// sent_message.react('➕');
				sent_message.react('📌');
				sent_message.react('📄');
				sent_message.react('⬇️');
				sent_message.react('🧹');
				sent_message.react('🚪');

				const music_data = new MusicData(
					channel.id,
					sent_message.id,
					guild_object.music_data.message_lyrics_id
						? guild_object.music_data.message_lyrics_id
						: 'null',
					[],
					false
				);

				set_music_data(guild_object.id, music_data);
				return resolve(sent_message.id);
			})
			.catch(() => {
				return reject('failed to send message to channel');
			});
	});
};

export function create_lyrics_message(
	channel: TextChannel, guild_object: GuildPrtl, message_id: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		const music_lyrics_message_emb = create_rich_embed(
			'Lyrics 📄',
			'',
			'#e60026',
			null,
			null,
			null,
			false,
			null,
			null
		);

		channel
			.send(music_lyrics_message_emb)
			.then(sent_message_lyrics => {
				const music_data = new MusicData(
					channel.id,
					message_id,
					sent_message_lyrics.id,
					[],
					false
				);

				set_music_data(guild_object.id, music_data);
				return resolve(sent_message_lyrics.id);
			})
			.catch(() => {
				return reject('failed to send message to channel');
			});
	});
};

export function update_music_message(
	guild: Guild, guild_object: GuildPrtl, yts: VideoSearchResult | undefined,
	status: string, animated = true
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const guild_channel: GuildChannel | undefined = guild.channels.cache
			.find(c => c.id === guild_object.music_data.channel_id);

		if (!guild_channel) {
			return reject(`could not fetch channel`);
		}

		const channel: TextChannel = <TextChannel>guild_channel;

		if (!channel || !guild_object.music_data.message_id) {
			return reject(`could not find channel`);
		}

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

		if (guild_object.music_data.message_id) {
			if (channel) {
				channel.messages
					.fetch(guild_object.music_data.message_id)
					.then((message: Message) => {
						message
							.edit(music_message_emb)
							.then(() => {
								return resolve(true);
							})
							.catch(e => {
								return reject(`failed to edit messages / ${e}`);
							});
					})
					.catch(e => {
						return reject(`failed to fetch messages / ${e}`);
					});
			}
		}
	});
};

export function update_music_lyrics_message(
	guild: Guild, guild_object: GuildPrtl, lyrics: string, url?: string
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const guild_channel: GuildChannel | undefined = guild.channels.cache
			.find(c => c.id === guild_object.music_data.channel_id);

		if (!guild_channel) {
			return reject(`could not fetch channel`);
		}

		const channel: TextChannel = <TextChannel>guild_channel;

		if (!channel || !guild_object.music_data.message_id) {
			return reject(`could not find channel`);
		}

		const music_message_emb = create_rich_embed(
			`Lyrics 📄 ${url ? `at ${url}` : ''}`,
			max_string(lyrics, 2000),
			'#e60026',
			null,
			null,
			null,
			false,
			null,
			null
		);

		if (guild_object.music_data.message_lyrics_id) {
			if (channel) {
				channel.messages
					.fetch(guild_object.music_data.message_lyrics_id)
					.then((message: Message) => {
						message.edit(music_message_emb)
							.then(() => {
								return resolve(true);
							})
							.catch(e => {
								return reject(`failed to edit messages / ${e}`);
							});
					})
					.catch(e => {
						return reject(`failed to fetch messages / ${e}`);
					});
			}
		}
	});
};

export async function join_by_reaction(
	client: Client, guild_object: GuildPrtl, user: User, announce_entrance: boolean
): Promise<VoiceConnection> {
	return new Promise((resolve, reject) => {
		if (!user.presence) {
			return reject('no user presence');
		}

		if (!user.presence.member) {
			return reject('no user presence member');
		}

		if (!user.presence.member.voice) {
			return reject('you must be connected to a voice channel');
		}

		if (!user.presence.member.voice.channel) {
			return reject('you must be connected to a voice channel');
		}

		const voice_connection_in_guild = client.voice?.connections
			.find(connection => connection.channel.guild.id === user.presence.member?.voice.channel?.guild.id);

		if (voice_connection_in_guild &&
			voice_connection_in_guild.channel.id === user.presence.member.voice.channel?.id
		) {
			voice_connection_in_guild?.voice?.setSelfDeaf(true);

			return resolve(voice_connection_in_guild);
		} else if (!voice_connection_in_guild || (voice_connection_in_guild &&
			!voice_connection_in_guild.channel.members.some(m => !m.user.bot))
		) {
			const current_voice = user.presence.member?.voice.channel;

			if (!current_voice) {
				return reject(`could not find your voice channel`);
			}

			current_voice.join()
				.then(response => {
					if (announce_entrance) {
						client_talk(client, guild_object, 'join');
					}

					response.voice?.setDeaf(true); // setSelfDeaf(true);

					return resolve(response);
				})
				.catch(e => {
					return reject(`failed to join voice channel / ${e}`);
				});
		}
	});
}

export async function join_user_voice(
	client: Client, message: Message, guild_object: GuildPrtl, join: boolean = false
): Promise<VoiceConnection> {
	return new Promise((resolve, reject) => {
		if (!message.member) {
			return reject('message has no member');
		}

		if (!message.guild) {
			return reject('message has no guild');
		}

		if (!guild_object) {
			return reject('could not find guild of message');
		}

		if (!client.voice) {
			return reject('could not fetch portal\'s voice connections');
		}

		const voice_connection_in_guild = client.voice.connections
			.find(connection => connection.channel.guild.id === message.guild?.id);

		if (
			voice_connection_in_guild &&
			voice_connection_in_guild.channel.id === message.member.voice.channel?.id
		) {
			voice_connection_in_guild?.voice?.setSelfDeaf(true);
			return resolve(voice_connection_in_guild);
		} else if (
			!voice_connection_in_guild || (voice_connection_in_guild &&
				!voice_connection_in_guild.channel.members.some(m => !m.user.bot))
		) {
			const current_voice = message.member.voice.channel;

			if (!current_voice) {
				return reject('you are not connected to any channel');
			}

			if (current_voice.guild.id !== message.guild.id) {
				return reject('your current channel is on another guild');
			}

			current_voice.join()
				.then(response => {
					if (join) {
						client_talk(client, guild_object, 'join');
					}

					response.voice?.setSelfDeaf(true);

					return resolve(response,);
				})
				.catch(e => {
					return reject(`error while joining voice connection / ${e}`);
				});
		}
	});
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
	const portal_icon_url: string = 'https://raw.githubusercontent.com/keybraker' +
		'/Portal/master/src/assets/img/portal_logo_spinr.gif';

	const rich_message: MessageEmbed = new MessageEmbed();

	if (title) rich_message.setTitle(title);
	if (url) rich_message.setURL(url);
	if (colour) rich_message.setColor(colour);
	if (description) rich_message.setDescription(description);
	if (from_bot) rich_message.setFooter('Portal', custom_gif ? custom_gif : portal_icon_url).setTimestamp();
	if (thumbnail) rich_message.setThumbnail(thumbnail);
	if (image) rich_message.setImage(image);
	if (author) rich_message.setAuthor(author.name, author.icon);
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
	if (member && !author) {
		const url = member.user.avatarURL() !== null
			? member.user.avatarURL()
			: undefined;

		rich_message.setAuthor(member.displayName, url !== null ? url : undefined, undefined);
	}

	return rich_message;
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
		return member.roles.cache.some(r =>
			r.name.toLocaleLowerCase() === 'p.admin');
	}

	return false;
};

export function is_dj(
	member: GuildMember
): boolean {
	if (member.roles.cache) {
		return member.roles.cache.some(r =>
			r.name.toLocaleLowerCase() === 'p.dj');
	}

	return false;
};

export function is_ignored(
	member: GuildMember
): boolean {
	return member.roles.cache.some(r =>
		r.name.toLocaleLowerCase() === 'p.ignore');
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
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (message && !message.channel.deleted && str !== null) {
			message.channel
				.send(`${user}, ${str}`)
				.then(sent_message => {
					if (sent_message.deletable) {
						sent_message
							.delete({ timeout: config.delete_msg_after * 1000 })
							.catch(e => {
								return reject(`failed to delete message / ${e}`);
							});
					}
				})
				.catch(e => {
					return reject(`failed to send message / ${e}`);
				});
		}

		if (message && !message.deleted) {
			if (status === true) {
				message
					.react(emote_pass)
					.catch(e => {
						return reject(`failed to react to message / ${e}`);
					});
			}
			else if (status === false) {
				message
					.react(emote_fail)
					.catch(e => {
						return reject(`failed to react to message / ${e}`);
					});
			}

			if (message && to_delete && message.deletable) {
				message
					.delete({ timeout: 7500 })
					.catch(e => {
						return reject(`failed to delete message / ${e}`);
					});
			}

			return resolve(true);
		}
	});
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
	return num.toString().length >= 2
		? '' + num
		: '0' + num;
};

export function time_elapsed(
	timestamp: Date | number, timeout: number
): TimeElapsed {
	const timeout_time = timeout * 60 * 1000;
	const el = moment
		.duration(moment()
			.diff(moment(typeof timestamp === 'number'
				? timestamp
				: timestamp.getTime())));

	const timeout_min = moment(timeout_time).minutes();
	const timeout_sec = moment(timeout_time).seconds();
	const remaining_hrs = el.hours();
	const remaining_min = el.minutes();
	const remaining_sec = el.seconds();

	return { timeout_min, timeout_sec, remaining_hrs, remaining_min, remaining_sec };
};

// must get updated
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

// must get updated
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
													logger.log({
														level: 'info', type: 'none', message: `deleted empty channel: ${channel.name} ` +
															`(${channel.id}) from ${channel.guild.name}`
													});
												})
												.catch(e => {
													logger.log({ level: 'error', type: 'none', message: `failed to send message / ${e}` });
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