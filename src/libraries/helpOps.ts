import { Channel, Client, Guild, GuildChannel, GuildMember, Message, MessageEmbed, TextChannel, User, VoiceConnection } from "discord.js";
import { cloneDeep } from "lodash";
import { VideoSearchResult } from "yt-search";
import { GiveRole, GiveRolePrtl } from "../types/classes/GiveRolePrtl";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { Field, ReturnPormise, ReturnPormiseVoice, TimeElapsed, TimeRemaining } from "../types/interfaces/InterfacesPrtl";
import { client_talk, client_write } from "./localizationOps";
import { writeFileSync } from "jsonfile";

export function guildPrtl_to_object(guild_list: GuildPrtl[], guild_id: string): GuildPrtl | undefined {
	return guild_list.find(g => g.id === guild_id);
};

export function create_music_message(channel: TextChannel, thumbnail: string, guild_object: GuildPrtl): void {
	const music_message_emb = create_rich_embed(
		'Music Player',
		'just type and I\'ll play',
		'#0000FF',
		[
			{ emote: 'Duration', role: '-', inline: true },
			{ emote: 'Views', role: '-', inline: true },
			{ emote: 'Uploaded', role: '-', inline: true }
		],
		null,
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
			sent_message.react('⏹');
			sent_message.react('⏭');
			sent_message.react('📜');
			sent_message.react('❌');

			guild_object.music_data.message_id = sent_message.id;
		});
};

export function update_message(guild: Guild, guild_object: GuildPrtl, yts: VideoSearchResult): void {
	const music_message_emb = create_rich_embed(
		yts.title,
		yts.url,
		'#0000FF',
		[
			{ emote: 'Duration', role: yts.timestamp, inline: true },
			{ emote: 'Views', role: yts.views, inline: true },
			{ emote: 'Uploaded', role: yts.ago, inline: true },
		],
		null,
		null,
		true,
		null,
		yts.thumbnail
	);

	const guild_channel: GuildChannel | undefined = guild.channels.cache
		.find(c => c.id === guild_object.music_data.channel_id);
	const channel: TextChannel = <TextChannel>guild_channel;

	if (guild_object.music_data.message_id) {
		if (channel) {
			channel.messages
				.fetch(guild_object.music_data.message_id)
				.then((message: Message) => {
					message.edit(music_message_emb)
						.then((msg: Message) =>
							console.log(`Updated the content of a message to ${msg.content}`)
						)
						.catch(console.error);
				})
				.catch(console.error);
		}
	}
};

export async function join_user_voice(client: Client, message: Message, guild_list: GuildPrtl[],
	join: boolean): Promise<ReturnPormiseVoice> { // localize
	return new Promise((resolve) => {
		if (message.member === null) {
			return resolve({
				result: false,
				value: 'message has no member.',
				voice_connection: undefined
			});
		}

		if (message.guild === null) {
			return resolve({
				result: false,
				value: 'message has no guild.',
				voice_connection: undefined
			});
		}

		const current_voice = message.member.voice.channel;

		if (current_voice === null) {
			return resolve({
				result: false,
				value: 'you are not connected to any channel.',
				voice_connection: undefined
			});
		}

		if (current_voice.guild.id !== message.guild.id) {
			return resolve({
				result: false,
				value: 'your current channel is on another guild.',
				voice_connection: undefined
			});
		}

		if (!message || !message.guild) {
			return resolve({
				result: false,
				value: 'could not find guild of message.',
				voice_connection: undefined
			});
		}

		const current_guild = guild_list.find(g => {
			if (message && message.guild)
				return g.id === message.guild.id;
		});

		if (current_guild === undefined) {
			return resolve({
				result: false,
				value: 'could not find guild of message.',
				voice_connection: undefined
			});
		}

		const portal_list = current_guild.portal_list;

		const controlled_by_portal = portal_list.some(p =>
			p.voice_list.some(v => v.id === current_voice.id)
		);

		if (!controlled_by_portal) {
			return resolve({
				result: false,
				value: 'I can only connect to my channels.',
				voice_connection: undefined
			});
		}

		if (client.voice === null) {
			return resolve({
				result: false,
				value: 'Portal is not connected to any voice channel.',
				voice_connection: undefined
			});
		}

		const existing_voice_connection: VoiceConnection | undefined = client.voice.connections.find(connection =>
			(message && message.member && message.member.voice && message.member.voice.channel)
				? (connection.channel.id === message.member.voice.channel.id)
				: false
		);

		if (existing_voice_connection) {
			existing_voice_connection?.voice?.setSelfDeaf(true);
			return resolve({
				result: true,
				value: 'already in voice channel',
				voice_connection: existing_voice_connection
			});
		} else {
			// let new_voice_connection = null;
			current_voice.join()
				.then(conn => {
					if (join) client_talk(client, guild_list, 'join');
					conn?.voice?.setSelfDeaf(true);

					return resolve({
						result: true,
						value: client_write(message, guild_list, 'join'),
						voice_connection: conn,
					});
				})
				.catch(e => { console.log('ERROR CREATING VOICE CONNECTION TO CHANNEL: ', e); });
		}
	});
};

export function inline_operator(str: string): any {
	switch (str) {
		case '==':
			(a: string, b: string) => a == b;
		case '===':
			(a: string, b: string) => a === b;
		case '!=':
			(a: string, b: string) => a != b;
		case '!==':
			(a: string, b: string) => a !== b;
		case '>':
			(a: string, b: string) => a > b;
		case '<':
			(a: string, b: string) => a < b;
		case '>=':
			(a: string, b: string) => a >= b;
		case '<=':
			(a: string, b: string) => a <= b;
	};
};

export function getJSON(str: string): any | null {
	let data = null;
	try {
		data = JSON.parse(str);
	}
	catch (error) {
		return null;
	}
	return data;
};

export function create_rich_embed(title: string | null | undefined, description: string | null | undefined, colour: string | null | undefined,
	field_array: Field[], thumbnail: string | null | undefined, member: GuildMember | null | undefined, from_bot: boolean | null | undefined,
	url: string | null | undefined, image: string | null | undefined): MessageEmbed {
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
	force: boolean, portal_managed_guilds_path: string, guild_list: GuildPrtl[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => { // , reject) => {
		setTimeout(() => {
			const guild_list_no_voice = cloneDeep(guild_list);
			guild_list_no_voice.forEach(g => g.dispatcher = null);
			console.log('JSON.stringify(guild_list_no_voice) :\n', JSON.stringify(guild_list_no_voice), '\n');

			writeFileSync(portal_managed_guilds_path, guild_list_no_voice);

			// const write_options: WriteFileOptions = {
			// 	encoding: 'utf8'
			// };

			// writeFileSync(
			// 	portal_managed_guilds_path,
			// 	JSON.stringify(guild_list_no_voice),
			// 	write_options
			// );

		}, 1000);
		return resolve({ result: true, value: 'updated portal guild json' });
	});
};

export function is_authorised(guild_object: GuildPrtl, member: GuildMember): boolean {
	if (member.hasPermission('ADMINISTRATOR')) return true;
	if (member.roles.cache !== undefined && member.roles.cache !== null) {
		const has_authorised_role = member.roles.cache.some(role =>
			guild_object.auth_role
				? guild_object.auth_role.some((auth: string) => auth === role.id)
				: false
		);
		if (has_authorised_role) return true;
	}
	if (member.roles.cache !== undefined && member.roles.cache !== null) {
		const is_authorised_member = guild_object.member_list.some(m => {
			if (m.id === member.id)
				if (m.admin)
					return true;
			return false;
		});
		if (is_authorised_member) return true;
	}

	return false;
};

// channel should be removed !
export function message_reply(status: boolean, channel: Channel, message: Message, user: User, str: string, guild_list: GuildPrtl[],
	client: Client, to_delete: boolean = false, emote_pass: string = '✔️', emote_fail: string = '❌'): void {
	if (!message.channel.deleted && str !== null) {
		message.channel
			.send(`${user}, ${str}`)
			.then(msg => { msg.delete({ timeout: 5000 }); })
			.catch(error => console.log(error));
	}
	if (!message.deleted) {
		if (status === true) {
			message
				.react(emote_pass)
				.catch(error => console.log(error));
		}
		else if (status === false) {
			client_talk(client, guild_list, 'fail');
			message
				.react(emote_fail)
				.catch(error => console.log(error));
		}
		if (to_delete) {
			message
				.delete({ timeout: 5000 })
				.catch(error => console.log(error));
		}
	}
};

export function is_url(potential_url: string): boolean {
	const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

	return pattern.test(potential_url);
};

export function pad(num: number): string {
	if (num.toString().length >= 2) {
		return '' + num;
	}
	else {
		return '0' + num;
	}
};

export function time_elapsed(timestamp: Date | number, timeout: number): TimeElapsed {
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

export function time_remaining(timestamp: number, timeout: number): TimeRemaining {
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

export function remove_deleted_guild(guild: Guild, guild_list: GuildPrtl[]): boolean {
	if (!guild_list.some(g => g.id === guild.id)) {
		guild.leave()
			.then(guild => console.log(`left guild ${guild}`))
			.catch(console.error);
		return true;
	}
	return false;
}

export function remove_deleted_channels(guild: Guild, guild_list: GuildPrtl[]): void {
	const guild_object = guild_list.find(g => g.id === guild.id);
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
						.then((message: Message) => {
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

		guild_object.member_list.some((m, index_m) => {
			if (!guild.members.cache.some(m => m.id === m.id)) {
				guild_object.url_list.splice(index_m, 1);
				return true;
			}
			return false;
		});

		if (!guild.channels.cache.some(c => c.id === guild_object.spotify)) {
			guild_object.spotify = null;
		}

		if (!guild.channels.cache.some(c => c.id === guild_object.music_data.channel_id)) {
			guild_object.music_data.channel_id = undefined;
			guild_object.music_data.message_id = undefined;
			guild_object.music_data.votes = undefined;
		}

		if (!guild.channels.cache.some(c => c.id === guild_object.announcement)) {
			guild_object.announcement = null;
		}
	}
}

export function remove_empty_voice_channels(guild: Guild, guild_list: GuildPrtl[]): void {
	guild.channels.cache.forEach(channel => {
		if (!channel.members.size) {
			const deleted = guild_list.some(g =>
				g.portal_list.some(p =>
					p.voice_list.some((v, index) => {
						if (v.id === channel.id) {
							console.log(`Deleting channel: ${channel.name} (${channel.id}) from ${channel.guild.name}`);
							if (channel.deletable) {
								channel
									.delete()
									.then(g => {
										p.voice_list.splice(index, 1);
										console.log('...done');
									})
									.catch(console.error);
							}
							return true;
						}
						return false
					})
				)
			);

			if (!deleted)
				console.log('failed to delete channel');
		}
	});
};