import { DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Client, Collection, ColorResolvable, Guild, GuildBasedChannel, GuildChannel, GuildMember, Message, MessageEmbed, PermissionResolvable, PermissionString, TextBasedChannel, TextChannel, User, VoiceChannel } from "discord.js";
import moment from "moment";
import { createLogger, format } from "winston";
import { VideoSearchResult } from "yt-search";
import { GuildPrtl, MusicData } from "../types/classes/GuildPrtl.class";
import { Field, TimeElapsed } from "../types/classes/TypesPrtl.interface";
import { createDiscordJSAdapter } from "./adapter.library";
// import { client_talk } from "./localisation.library";
import { fetch_guild, fetch_guild_list, set_music_data } from "./mongo.library";

const idle_thumbnail = 'https://raw.githubusercontent.com/keybraker/' +
	'Portal/master/src/assets/img/empty_queue.png';

const deletedMessages = new WeakSet<Message>();
const deletedChannel = new WeakSet<GuildBasedChannel | TextBasedChannel>();
const deletedGuild = new WeakSet<Guild>();

export function isMessageDeleted(message: Message) {
	return deletedMessages.has(message);
}

export function markMessageAsDeleted(message: Message) {
	deletedMessages.add(message);
}

export function isChannelDeleted(channel: GuildBasedChannel | TextBasedChannel) {
	return deletedChannel.has(channel);
}

export function markChannelAsDeleted(channel: GuildBasedChannel) {
	deletedChannel.add(channel);
}

export function isGuildDeleted(guild: Guild) {
	return deletedGuild.has(guild);
}

export function markGuildAsDeleted(guild: Guild) {
	deletedGuild.add(guild);
}

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


export async function ask_for_approval(
	message: Message, requester: GuildMember, question: string
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		message.channel
			.send(question)
			.then(question_msg => {
				let accepted = false;
				const filter = (m: Message) => m.author.id === requester.user.id;
				const collector = message.channel
					.createMessageCollector({ filter, time: 10000 });

				collector.on('collect', (m: Message) => {
					if (m.content === 'yes') {
						accepted = true;
						collector.stop();
					}
					else if (m.content === 'no') {
						collector.stop();
					}
				});

				collector.on('end', collected => {
					for (const reply_message of collected.values()) {
						if (reply_message.deletable) {
							reply_message
								.delete()
								.catch((e: any) => {
									return reject(e);
								});
						}
					}

					if (question_msg.deletable) {
						question_msg.delete()
							.catch((e: any) => {
								return reject(`failed to delete messages / ${e}`);
							});
					}

					return resolve(accepted);
				});
			})
			.catch(e => {
				return reject(e);
			});
	});
}

export function get_json(
	str: string
): any | unknown {
	let data = null;

	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		data = JSON.parse(str);
	}
	catch (error) {
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return data;
}

export function max_string(
	abstract: string, max: number
): string {
	return abstract.length < max
		? abstract
		: abstract.substring(0, max - 3) + '...';
}

export function get_key_from_enum(
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	value: string, enumeration: any
): string | number | undefined {
	for (const e in enumeration) {
		if (e === value) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
			return enumeration[e];
		}
	}

	return undefined;
}

export function create_music_message(
	channel: TextChannel, guild_object: GuildPrtl
): Promise<string> {
	return new Promise((resolve, reject) => {
		const music_message_emb = create_rich_embed(
			'Music Player',
			'Type and Portal will play it !',
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
			.send({ embeds: [music_message_emb] })
			.then(sent_message => {
				sent_message.react('▶️')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});
				sent_message.react('⏸')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});
				sent_message.react('⏭')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});
				sent_message.react('📌')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});
				sent_message.react('📄')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});
				sent_message.react('⬇️')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});
				sent_message.react('🧹')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});
				sent_message.react('🚪')
					.catch((e: any) => {
						return reject(`failed to set remote / ${e}`);
					});

				const music_data = new MusicData(
					channel.id,
					sent_message.id,
					guild_object.music_data.message_lyrics_id
						? guild_object.music_data.message_lyrics_id
						: 'null',
					[],
					false
				);

				set_music_data(guild_object.id, music_data)
					.catch((e: any) => {
						return reject(`failed to set music data / ${e}`);
					});

				return resolve(sent_message.id);
			})
			.catch(() => {
				return reject('failed to send message to channel');
			});
	});
}

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
			.send({ embeds: [music_lyrics_message_emb] })
			.then(sent_message_lyrics => {
				const music_data = new MusicData(
					channel.id,
					message_id,
					sent_message_lyrics.id,
					[],
					false
				);

				set_music_data(guild_object.id, music_data)
					.catch((e: any) => {
						return reject(`failed to set music data / ${e}`);
					});

				return resolve(sent_message_lyrics.id);
			})
			.catch(e => {
				return reject(`failed to send message to channel / ${e}`);
			});
	});
}

export function update_music_message(
	guild: Guild, guild_object: GuildPrtl, yts: VideoSearchResult | undefined,
	status: string, animated = true
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const guild_channel: GuildBasedChannel | undefined = guild.channels.cache
			.find(c => c.id === guild_object.music_data.channel_id);

		if (!guild_channel) {
			return reject(`could not fetch channel`);
		}

		const channel: TextChannel = <TextChannel>guild_channel;

		if (!channel || !guild_object.music_data.message_id) {
			return reject(`could not find channel`);
		}

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
				// { emote: null, role: null, inline: true },
				{ emote: 'Queue', role: music_queue, inline: false },
				// { emote: null, role: null, inline: true },
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
							.edit({ embeds: [music_message_emb] })
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
}

export function update_music_lyrics_message(
	guild: Guild, guild_object: GuildPrtl, lyrics: string, url?: string
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const guild_channel: GuildBasedChannel | undefined = guild.channels.cache
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
						message.edit({ embeds: [music_message_emb] })
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
}

export async function join_by_reaction(
	guild: Guild, client: Client, guild_object: GuildPrtl, user: User, announce_entrance: boolean
): Promise<VoiceConnection> {
	const guildMembers = await guild.members.fetch();

	if (!guildMembers) {
		return Promise.reject(`could not fetch members`);
	}

	const member = guildMembers.find(m => !m.user?.bot && m.id === user.id);

	if (!member) {
		return Promise.reject(`could not find member`);
	}

	if (!member.voice) {
		return Promise.reject('you must be connected to a voice channel');
	}

	if (!member.voice.channel) {
		return Promise.reject('you must be connected to a voice channel');
	}

	let voiceConnection = await getVoiceConnection(member.voice.channel.id);
	if (voiceConnection && member.voice.channel.guild.me?.voice.channelId === member.voice.channel?.id) {
		member.voice.channel.guild.me?.voice.setDeaf();
	} else {
		voiceConnection = joinVoiceChannel({
			channelId: member.voice.channel.id,
			guildId: member.voice.channel.guild.id,
			adapterCreator: createDiscordJSAdapter(member.voice.channel as VoiceChannel),
		});

		if (!voiceConnection) {
			return Promise.reject('could not join voice channel');
		}

		member.voice.channel.guild.me?.voice.setDeaf();
	}

	return voiceConnection;
}

export async function join_user_voice(
	client: Client, message: Message, guild_object: GuildPrtl, join = false
): Promise<VoiceConnection> {
	if (!message.member) {
		return Promise.reject('user could not be fetched for message');
	}

	if (!message.member.voice) {
		return Promise.reject('voice could not be fetched for member');
	}

	if (!message.member.voice.channel) {
		return Promise.reject('you aren\'t in a channel');
	}

	if (!message.guild) {
		return Promise.reject('guild could not be fetched for message');
	}

	if (!message.guild.voiceAdapterCreator) {
		return Promise.reject('voiceAdapterCreator could not be fetched for guild');
	}

	if (!guild_object) {
		return Promise.reject('could not find guild of message');
	}

	if (!client.voice) {
		return Promise.reject('could not fetch portal\'s voice connections');
	}

	let voiceConnection = await getVoiceConnection(message.member.voice.channel.id);
	if (voiceConnection && message.guild.me?.voice.channelId === message.member.voice.channel?.id) {
		message.guild.me?.voice.setDeaf();
	} else {
		voiceConnection = await joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			adapterCreator: createDiscordJSAdapter(message.member.voice.channel as VoiceChannel),
		});

		if (!voiceConnection) {
			return Promise.reject('could not join voice channel');
		}

		message.guild.me?.voice.setDeaf();
	}

	return voiceConnection;
}

export function create_rich_embed(
	title: string | null | undefined,
	description: string | null | undefined,
	colour: ColorResolvable | null | undefined,
	field_array: Field[] | null,
	thumbnail: string | null | undefined,
	member: GuildMember | null | undefined,
	from_bot: boolean | null | undefined,
	url: string | null | undefined,
	image: string | null | undefined,
	custom_gif?: string,
	author?: { name: string, icon: string },
	footer?: string,
): MessageEmbed {
	const portal_icon_url: string = 'https://raw.githubusercontent.com/keybraker' +
		'/Portal/master/src/assets/img/portal_logo_spinr.gif';

	const rich_message: MessageEmbed = new MessageEmbed();

	if (title) rich_message.setTitle(title);
	if (url) rich_message.setURL(url);
	if (colour) rich_message.setColor(colour);
	if (description) rich_message.setDescription(description);
	if (footer) rich_message.setFooter({ text: footer });
	if (from_bot) rich_message.setFooter({
		text: footer
			? footer
			: 'Portal',
		iconURL: custom_gif
			? custom_gif
			: portal_icon_url
	}).setTimestamp();
	if (thumbnail) rich_message.setThumbnail(thumbnail);
	if (image) rich_message.setImage(image);
	if (author) rich_message.setAuthor({
		name: author.name,
		iconURL: author.icon
		// url: 'https://discord.js.org'
	});
	if (field_array) {
		field_array.forEach(row => {
			rich_message
				.addField(
					row.emote === '' || !row.emote
						? `\u200b`
						: `__${row.emote}__`,
					row.role === '' || !row.role
						? `\u200b`
						: `${row.role}`,
					row.inline
				);
		});
	}
	if (member && !author) {
		const url = member.user.avatarURL()
			? member.user.avatarURL()
			: undefined;

		rich_message.setAuthor(
			member.displayName,
			url
				? url
				: undefined,
			undefined
		);
	}

	return rich_message;
}

export function is_authorised(
	member: GuildMember
): boolean {
	const administrator: PermissionResolvable = 'ADMINISTRATOR';

	if (member.permissions.has(administrator, true)) {
		return true;
	}

	if (member.roles.cache) {
		return member.roles.cache.some(r =>
			r.name.toLowerCase() === 'p.admin');
	}

	return false;
}

export function is_dj(
	member: GuildMember
): boolean {
	if (member.roles.cache) {
		return member.roles.cache.some(r =>
			r.name.toLowerCase() === 'p.dj');
	}

	return false;
}

export function is_ignored(
	member: GuildMember
): boolean {
	return member.roles.cache.some(r =>
		r.name.toLowerCase() === 'p.ignore');
}

export function is_mod(
	member: GuildMember | null
): boolean {
	if (member && member.roles.cache) {
		return member.roles.cache.some(r =>
			r.name.toLowerCase() === 'p.mod');
	}

	return false;
}

export function is_whitelist(
	member: GuildMember | null
): boolean {
	if (member && member.roles.cache) {
		return member.roles.cache.some(r =>
			r.name.toLowerCase() === 'p.whitelist');
	}

	return false;
}

export function message_help(
	type: string, argument: string, info = ''
): string {
	if (info !== '') info += '\n';
	return `${info} get help by typing \`./help ${argument}\`\n` +
		`*https://portal-bot.xyz/docs/${type}/detailed/${argument}*`;
}

export async function message_reply(
	status: boolean,
	message: Message,
	reply_string: string,
	delete_source = false,
	delete_reply = false,
	emote_pass = '✔️',
	emote_fail = '❌'
): Promise<boolean> {
	if (!message) {
		return Promise.reject(`failed to find message`);
	}

	if (!isChannelDeleted(message.channel) && reply_string !== null && reply_string !== '') {
		const sentMessage = await message.reply(reply_string)
			.catch(e => { return Promise.reject(`failed to send message / ${e}`); });

		if (!sentMessage) {
			return Promise.reject(`failed to send message`);
		}

		if (delete_reply) {
			const delay = (process.env.DELETE_DELAY as unknown as number) * 1000;
			setTimeout(() => {
				if (!isMessageDeleted(sentMessage)) {
					sentMessage.delete()
						.catch(e => { return Promise.reject(`failed to delete message / ${e}`) })
				}
			}, delay);

		}
	}

	if (delete_source) {
		const rection = await message.react(status ? emote_pass : emote_fail)
			.catch(e => { return Promise.reject(`failed to react to message / ${e}`); });

		if (!rection) {
			return Promise.reject(`failed to react to message`);
		}

		const delay = (process.env.DELETE_DELAY as unknown as number) * 1000;
		setTimeout(() => {
			if (!isMessageDeleted(message)) {
				message.delete()
					.catch((e: any) => { return Promise.reject(`failed to delete message / ${e}`); });
			}
		}, delay);

		return true;
	}

	return false;
}

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
}

export function pad(
	num: number
): string {
	return num.toString().length >= 2
		? `${num}`
		: `0${num}`;
}

export function time_elapsed(
	timestamp: Date | number, timeout: number
): TimeElapsed {
	const timeout_time = timeout * 60 * 1000;
	const el = moment
		.duration(moment()
			.diff(
				moment(typeof timestamp === 'number'
					? timestamp
					: timestamp.getTime()
				)
			)
		);

	const timeout_min = moment(timeout_time).minutes();
	const timeout_sec = moment(timeout_time).seconds();
	const remaining_hrs = el.hours();
	const remaining_min = el.minutes();
	const remaining_sec = el.seconds();

	return { timeout_min, timeout_sec, remaining_hrs, remaining_min, remaining_sec }
}

// must get updated
export function remove_deleted_channels(
	guild: Guild
): Promise<boolean> {
	return new Promise((resolve) => {
		fetch_guild(guild.id)
			.then(guild_object => {
				if (guild_object) {
					guild_object.portal_list.forEach((p, index_p) => {
						if (!guild.channels.cache.some(c => c.id === p.id)) {
							guild_object.portal_list.splice(index_p, 1);
						}
						p.voice_list.forEach((v, index_v) => {
							if (!guild.channels.cache.some(c => c.id === v.id)) {
								p.voice_list.splice(index_v, 1);
							}
						});
					});

					guild_object.url_list.some((u_id, index_u) => {
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
									.then(() => {
										// clear from emotes leave only those from portal
										found = true;
									})
									.catch(() => {
										guild_object.role_list.splice(index_r, 1);
									});

								return found;
							}

							return false;
						});
					});

					guild_object.member_list.forEach((m, index_m) => {
						if (!guild.members.cache.some(m => m.id === m.id)) {
							guild_object.url_list.splice(index_m, 1);
						}
					});

					if (!guild.channels.cache.some(c => c.id === guild_object.music_data.channel_id)) {
						guild_object.music_data.channel_id = undefined;
						guild_object.music_data.message_id = undefined;
						guild_object.music_data.votes = undefined;
					}

					if (!guild.channels.cache.some(c => c.id === guild_object.announcement)) {
						guild_object.announcement = null;
					}

					return resolve(true);
				}

				return resolve(false);
			})
			.catch(() => {
				return resolve(false);
			});
	});
}

// must get updated
export async function remove_empty_voice_channels(
	guild: Guild
): Promise<boolean> {
	const guild_list = await fetch_guild_list();
	if (!guild_list) {
		return false;
	}

	if (guild_list?.length === 0) {
		return true;
	}

	guild.channels.cache.forEach(channel => {
		guild_list.some(g =>
			g.portal_list.some(p =>
				p.voice_list.some((v, index) => {
					if (v.id === channel.id && (<Collection<string, GuildMember>>channel.members).size === 0) {
						channel
							.delete()
							.then(() => {
								p.voice_list.splice(index, 1);
								logger.log({
									level: 'info', type: 'none', message: `deleted empty channel: ${channel.name} ` +
										`(${channel.id}) from ${channel.guild.name}`
								});
							})
							.catch(e => {
								logger.log({ level: 'error', type: 'none', message: `failed to send message / ${e}` });
							});
						return true;
					}
					return false
				})
			)
		);
	});

	return true;
}