import ytdl from 'discord-ytdl-core';
import { Client, Guild, Message, VoiceConnection } from "discord.js";
import yts from 'yt-search';
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { join_user_voice, update_message } from './helpOps';


// const ytdl = require('ytdl-core');

export async function start(client: Client, message: Message, search_term: string, guild_list: GuildPrtl[]): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!search_term || search_term === '') {
			return resolve({ result: false, value: 'cannot search for nothing.' });
		}
		if (!message.member) {
			return resolve({ result: false, value: 'member has left the guild.' });
		}
		if (!message.member.voice.channel) {
			return resolve({ result: false, value: 'you are not connected to any channel.' });
		}

		const guild_id = message.member.voice.channel.guild.id;
		const guild = guild_list.find(guild => guild.id === guild_id);

		if (guild === undefined) {
			return resolve({ result: false, value: 'could not find your guild.' });
		}

		const current_dispatcher = guild.dispatcher;
		const current_music_queue = guild.music_queue;

		if (current_dispatcher !== null && current_dispatcher !== undefined) {
			yts(search_term)
				.then(yts_attempt => {
					if (yts_attempt) {
						current_music_queue.push(yts_attempt.videos[0]);
					}
					else {
						return resolve({ result: false, value: 'could not find youtube video' });
					}
				})
				.catch(error => console.log(error));
			return resolve({ result: false, value: 'already playing song, your song has been added in list.' });
		}

		join_user_voice(client, message, guild_list, false)
			.then(join_attempt => {
				if (join_attempt.result === true) {
					yts(search_term)
						.then(yts_attempt => {
							if (yts_attempt && yts_attempt.videos.length > 0) {
								const stream = ytdl(yts_attempt.videos[0].url, {
									filter: 'audioonly',
									opusEncoded: false,
									fmt: 'mp3',
									highWaterMark: 2048,
								});
								// guild.dispatcher = join_attempt.voice_connection.play(stream);
								if (message.member && message.member.voice && message.member.voice.channel) {
									const curr_guild = client.guilds.cache.find(guild => guild.id === message.guild?.id);
									if (curr_guild !== undefined)
										update_message(curr_guild, message.member.voice.channel.guild, yts_attempt.videos[0]);

									guild.dispatcher.on('finish', () => {
										if (message.guild) {
											skip(guild_id, guild_list, client, message.guild);
											guild.music_data.votes = [];
										}
									});

									return resolve({ result: false, value: 'playing video' });
								} else {
									return resolve({ result: false, value: 'could not find user' });
								}

							}
							else {
								return resolve({ result: false, value: 'could not find youtube video' });
							}
						})
						.catch(error => console.log(error));
				}
				else {
					console.log(join_attempt.value);
					return resolve({ result: false, value: join_attempt.value });
				}
			})
			.catch(error => console.log(error));
	});
};

export async function play(guild_id: string, guild_list: GuildPrtl[], client: Client, guild: Guild): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_guild = guild_list.find(guild => guild.id === guild_id);

		if (current_guild === undefined) {
			return resolve({ result: false, value: 'could not find your guild.' });
		}

		let current_dispatcher = current_guild.dispatcher;

		if (current_dispatcher !== null && current_dispatcher !== undefined) {
			if (current_dispatcher.paused) {
				current_dispatcher.resume();

				current_dispatcher.on('finish', () => {
					skip(guild_id, guild_list, client, guild);
					current_guild.music_data.votes = [];
				});

				return resolve({ result: false, value: 'song has been resumed.' });
			}
		}
		else if (current_dispatcher === null) {
			const next_yts_video = current_guild.music_queue.shift();
			if (next_yts_video) {
				if (client.voice) {
					const voice_connection = client.voice.connections.find((connection: VoiceConnection) => !!connection.channel.id);

					if (voice_connection) {
						current_dispatcher = voice_connection
							.play(ytdl(next_yts_video.url, { filter: 'audioonly' }));

						update_message(guild, current_guild, next_yts_video);

						const stream = ytdl(next_yts_video.url, {
							filter: 'audioonly',
							opusEncoded: false,
							fmt: 'mp3',
						});

						current_dispatcher = voice_connection.play(stream);
						update_message(guild, current_guild, next_yts_video);
						current_dispatcher.on('finish', () => {
							skip(guild_id, guild_list, client, guild);
							current_guild.music_data.votes = [];
						});
					}
				}
			}
			return resolve({ result: false, value: 'next video playing.' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now.' });
		}
	});
};

export async function pause(guild_id: string, guild_list: GuildPrtl[]): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_guild = guild_list.find(guild => guild.id === guild_id);

		if (current_guild === undefined) {
			return resolve({ result: false, value: 'could not find your guild.' });
		}

		let current_dispatcher = current_guild.dispatcher;

		if (current_dispatcher !== null && current_dispatcher !== undefined) {
			if (!current_dispatcher.paused) {
				current_dispatcher.pause();
			}
			return resolve({ result: false, value: 'song has been paused.' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now.' });
		}
	});
};

export async function stop(guild_id: string, guild_list: GuildPrtl[], guild: Guild): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_guild = guild_list.find(guild => guild.id === guild_id);

		if (current_guild === undefined) {
			return resolve({ result: false, value: 'could not find your guild.' });
		}

		let current_dispatcher = current_guild.dispatcher;

		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';
		update_message(
			guild,
			current_guild,
			{
				title: 'Music Player',
				url: 'just type and I\'ll play',
				timestamp: '-',
				views: '-',
				ago: '-',
				thumbnail: portal_icon_url,
			});

		if (current_dispatcher !== null && current_dispatcher !== undefined) {
			if (!current_dispatcher.paused) {
				current_dispatcher.pause();
			}
			current_guild.dispatcher = null;
			return resolve({ result: false, value: 'song has been stopped.' });
		}
		else {
			current_guild.dispatcher = null;
			return resolve({ result: false, value: 'nothing playing write now.' });
		}
	});
};

export async function skip(guild_id: string, guild_list: GuildPrtl[], client: Client, guild: Guild): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_guild = guild_list.find(guild => guild.id === guild_id);

		if (current_guild === undefined) {
			return resolve({ result: false, value: 'could not find your guild.' });
		}

		const current_dispatcher = current_guild.dispatcher;
		const current_music_queue = current_guild.music_queue;

		if (current_dispatcher !== null && current_dispatcher !== undefined) {
			if (current_music_queue.length > 0) {
				const next_yts_video = current_guild.music_queue.shift();
				if (next_yts_video) {
					if (client.voice) {
						const voice_connection = client.voice.connections.find((connection: VoiceConnection) => !!connection.channel.id);
						if (voice_connection) {
							current_guild.dispatcher = voice_connection
								.play(ytdl(next_yts_video.url, { filter: 'audioonly' }));

							update_message(guild, current_guild, next_yts_video);

							const stream = ytdl(next_yts_video.url, {
								filter: 'audioonly',
								opusEncoded: false,
								fmt: 'mp3',
							});

							current_guild.dispatcher = voice_connection.play(stream);
							update_message(guild, current_guild, next_yts_video);
							current_guild.dispatcher.on('finish', () => {
								skip(guild_id, guild_list, client, guild);
								current_guild.music_data.votes = [];
							});
						}
					}
				}
			}
			else {
				const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
					'.github.io/master/assets/img/logo.png';
				update_message(
					guild,
					current_guild,
					{
						title: 'Music Player',
						url: 'just type and I\'ll play',
						timestamp: '-',
						views: '-',
						ago: '-',
						thumbnail: portal_icon_url,
					});
				if (!current_dispatcher.paused) {
					current_dispatcher.pause();
				}
				current_guild.dispatcher = null;
				return resolve({ result: false, value: 'music list is empty' });
			}

			return resolve({ result: false, value: 'song has been skipped.' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now.' });
		}
	});
};
