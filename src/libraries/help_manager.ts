import { Client, Message, Guild, DMChannel, GuildMember, User, MessageEmbed, Channel, TextChannel } from "discord.js";
import { writeFileSync, writeFile } from "file-system";
import { cloneDeep } from "lodash";

import { client_talk, client_write } from "./localization_manager";
import { RolePortal } from "../types/classes/RolePrtl";

export function create_role_message(channel: DMChannel, role_list: any, title: string, desc: string,
	colour: string, role_emb: any, role_map: any) {
	const role_message_emb: MessageEmbed = create_rich_embed(title, desc, colour, role_emb, null, null, null, null, null);
	channel
		.send(role_message_emb)
		.then(sent_message => {
			for (let i = 0; i < role_map.length; i++) {
				sent_message.react(role_map[i].give);
				sent_message.react(role_map[i].strip);
			}
			role_list[sent_message.id] = new RolePortal(role_map);
		})
		.catch(error => console.log(error));
};

export function create_music_message(channel: TextChannel, thumbnail: string, guild_object: any) {
	const music_message_emb = this.create_rich_embed(
		'Music Player',
		'just type and I\'ll play',
		'#0000FF',
		[
			{ emote: 'Duration', role: '-', inline: true },
			{ emote: 'Views', role: '-', inline: true },
			{ emote: 'Uploaded', role: '-', inline: true },
		],
		false,
		false,
		true,
		false,
		thumbnail,
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

export function update_message(guild: any, guild_object: any, yts: any) {
	const music_message_emb = this.create_rich_embed(
		yts.title,
		yts.url,
		'#0000FF',
		[
			{ emote: 'Duration', role: yts.timestamp, inline: true },
			{ emote: 'Views', role: yts.views, inline: true },
			{ emote: 'Uploaded', role: yts.ago, inline: true },
		],
		false,
		false,
		true,
		false,
		yts.thumbnail,
	);
	const channel = guild_object.channels.cache.get(guild.music_data.channel_id);

	if (channel) {
		channel.messages.channel.messages
			.fetch(guild.music_data.message_id)
			.then(message => {
				message.edit(music_message_emb)
					.then(msg => console.log(`Updated the content of a message to ${msg.content}`))
					.catch(console.error);
			})
			.catch(console.error);
	}
};

export async function join_user_voice(client: Client, message: Message, portal_guilds: any, join: boolean): Promise<{ result: boolean, value: string }> { // localize
	return new Promise((resolve) => {
		const current_voice = message.member.voice.channel;

		if (current_voice === null) {
			return resolve({ result: false, value: 'you are not connected to any channel.' });
		}

		if (current_voice.guild.id !== message.guild.id) {
			return resolve({ result: false, value: 'your current channel is on another guild.' });
		}

		const portal_list = portal_guilds[message.guild.id].portal_list;
		let included_in_voice_list = false;

		for (const key in portal_list) {
			if (portal_list[key].voice_list[current_voice.id]) { included_in_voice_list = true; }
		}

		if (!included_in_voice_list) {
			console.log('I can only connect to my channels.');
			return resolve({ result: false, value: 'I can only connect to my channels.' });
		}

		const existing_voice_connection = client.voice.connections.find(connection =>
			connection.channel.id === message.member.voice.channel.id
		);

		if (existing_voice_connection) {
			return resolve({
				result: true,
				value: 'already in voice channel',
				voice_connection: existing_voice_connection,
			});
		} else {
			// let new_voice_connection = null;
			current_voice.join()
				.then(conn => {
					if (join) client_talk(client, portal_guilds, 'join');

					return resolve({
						result: true,
						value: client_write(message, portal_guilds, 'join'),
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

export function create_rich_embed(title: string | null, description: string | null, colour: string | null, field_array: any,
	thumbnail: string | null, member: GuildMember | null, from_bot: boolean | null, url: string | null, image: string | null): MessageEmbed {
	const portal_icon_url: string = 'https://raw.githubusercontent.com/keybraker/keybraker' +
		'.github.io/master/assets/img/logo.png';
	const keybraker_url: string = 'https://github.com/keybraker';

	const rich_message: MessageEmbed = new MessageEmbed()
		.setTimestamp();
	// .setAuthor('Portal', portal_icon_url, keybraker_url)

	if (title) {
		rich_message
			.setTitle(title);
	}
	if (url) {
		rich_message
			.setURL(url);
	}
	if (colour) {
		rich_message
			.setColor(colour);
	}
	if (description) {
		rich_message
			.setDescription(description);
	}
	if (from_bot) {
		rich_message
			.setFooter('Portal bot by Keybraker', portal_icon_url);
	}
	if (member) {
		rich_message
			.setAuthor(member.displayName, member.user.avatarURL());
	}
	if (thumbnail) {
		rich_message
			.setThumbnail(thumbnail);
	}
	if (image) {
		rich_message
			.setImage(image);
	}

	if (field_array) {
		field_array.forEach(row => {
			rich_message
				.addField(
					(row.emote === '' || row.emote === null || row.emote === false)
						? '\u200b'
						: '`' + row.emote + '`',
					(row.role === '' || row.role === null || row.role === false)
						? '\u200b'
						: row.role,
					row.inline,
				);
		});
	}
	else {
		rich_message.addField('\u200b', '\u200b');
	}

	return rich_message;
};

export function empty_channel_remover(current_guild: Guild, portal_guilds: any, portal_managed_guilds_path: string) {
	current_guild.channels.cache.forEach(channel => {
		if (portal_guilds[current_guild.id]) {
			for (const portal_channel in portal_guilds[current_guild.id].portal_list) {
				if (portal_guilds[current_guild.id].portal_list[portal_channel].voice_list[channel.id]) {
					if (!channel.members.size) {
						console.log('Deleting channel: ', channel.name, 'from ', channel.guild.name);
						// guld_mngr.delete_channel(channel);
						if (channel.deletable) {
							channel
								.delete()
								.then(g => console.log(`Deleted channel with id: ${g}`))
								.catch(console.error);
						}
						return true;
					}
				}
				return false;
			}
		}
		else {
			current_guild.leave()
				.then(guild => console.log(`Left guild ${guild}`))
				.catch(console.error);
		}
	});

	this.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds);
};

export async function update_portal_managed_guilds(force: boolean, portal_managed_guilds_path: string, portal_guilds: any) {
	return new Promise((resolve) => { // , reject) => {
		setTimeout(() => {
			const portal_guilds_no_voice = cloneDeep(portal_guilds);
			for (const guild_id in portal_guilds_no_voice) {
				portal_guilds_no_voice[guild_id].dispatcher = null;
			}

			if (force) {
				writeFileSync(
					portal_managed_guilds_path,
					JSON.stringify(portal_guilds_no_voice),
					'utf8',
				);
			}
			else {
				writeFile(
					portal_managed_guilds_path,
					JSON.stringify(portal_guilds_no_voice),
					'utf8',
				);
			}
		}, 1000);
		return resolve({ result: true, value: '*updated portal guild json.*' });
	});
};

export function is_authorized(auth_role: any, member: GuildMember) {
	return !member.hasPermission('ADMINISTRATOR')
		? member.roles.cache !== undefined && member.roles.cache !== null
			? member.roles.cache.some(role =>
				auth_role
					? auth_role.some(auth => auth === role.id)
					: false)
			: false
		: true;
};

// channel should be removed !
export function message_reply(status: boolean, channel: Channel, message: Message, user: User, str: string, portal_guilds: any,
	client: Client, to_delete: boolean = false, emote_pass: string = '✔️', emote_fail: string = '❌') {
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
			client_talk(client, portal_guilds, 'fail');
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

export function is_url(potential_url: string) {
	const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

	return pattern.test(potential_url);
};

export function pad(num: number) {
	if (num.toString().length >= 2) {
		return num;
	}
	else {
		return '0' + num;
	}
};

export function time_elapsed(timestamp: number, timeout: number) {
	const time_elapsed = Date.now() - timestamp;
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

export function time_remaining(timestamp: number, timeout: number) {
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
