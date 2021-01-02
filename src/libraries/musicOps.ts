import { Client, Message, VoiceConnection } from "discord.js";
import { join_user_voice, update_message } from './helpOps';
import { ReturnPormise } from "../types/classes/ReturnPormise";

import yts from 'yt-search';
import ytdl from 'discord-ytdl-core';
// const ytdl = require('ytdl-core');

export async function start(client: Client, message: Message, search_term: string, portal_guilds: any): Promise<ReturnPormise> {
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
		const current_dispatcher = portal_guilds[guild_id].dispatcher;
		const current_music_queue = portal_guilds[guild_id].music_queue;

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

		join_user_voice(client, message, portal_guilds, false)
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
								// portal_guilds[guild_id].dispatcher = join_attempt.voice_connection.play(stream);
								if (message.member && message.member.voice && message.member.voice.channel) {
									update_message(portal_guilds[guild_id], message.member.voice.channel.guild, yts_attempt.videos[0]);

									portal_guilds[guild_id].dispatcher.on('finish', () => {
										skip(guild_id, portal_guilds, client, message.guild);
										portal_guilds[guild_id].music_data.votes = [];
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

export async function play(guild_id: string, portal_guilds: any, client: Client, guild_object: any): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_dispatcher = portal_guilds[guild_id].dispatcher;

		if (current_dispatcher !== null && current_dispatcher !== undefined) {
			if (current_dispatcher.paused) {
				current_dispatcher.resume();

				portal_guilds[guild_id].dispatcher.on('finish', () => {
					skip(guild_id, portal_guilds, client, guild_object);
					portal_guilds[guild_id].music_data.votes = [];
				});

				return resolve({ result: false, value: 'song has been resumed.' });
			}
		}
		else if (current_dispatcher === null) {
			const next_yts_video = portal_guilds[guild_id].music_queue.shift();
			if (client.voice) {
				const voice_connection = client.voice.connections.find((connection: VoiceConnection) => !!connection.channel.id);

				if (voice_connection) {
					portal_guilds[guild_id].dispatcher = voice_connection
						.play(ytdl(next_yts_video.url, { filter: 'audioonly' }));

					update_message(portal_guilds[guild_id], guild_object, next_yts_video);

					const stream = ytdl(next_yts_video.url, {
						filter: 'audioonly',
						opusEncoded: false,
						fmt: 'mp3',
					});

					portal_guilds[guild_id].dispatcher = voice_connection.play(stream);
					update_message(portal_guilds[guild_id], guild_object, next_yts_video);
					portal_guilds[guild_id].dispatcher.on('finish', () => {
						skip(guild_id, portal_guilds, client, guild_object);
						portal_guilds[guild_id].music_data.votes = [];
					});
				}
			}

			return resolve({ result: false, value: 'next video playing.' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now.' });
		}
	});
};

export async function pause(guild_id: string, portal_guilds: any): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_dispatcher = portal_guilds[guild_id].dispatcher;

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

export async function stop(guild_id: string, portal_guilds: any, guild_object: any): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_dispatcher = portal_guilds[guild_id].dispatcher;

		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';
		update_message(
			portal_guilds[guild_id],
			guild_object,
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
			portal_guilds[guild_id].dispatcher = null;
			return resolve({ result: false, value: 'song has been stopped.' });
		}
		else {
			portal_guilds[guild_id].dispatcher = null;
			return resolve({ result: false, value: 'nothing playing write now.' });
		}
	});
};

export async function skip(guild_id: string, portal_guilds: any, client: Client, guild_object: any): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const current_dispatcher = portal_guilds[guild_id].dispatcher;
		const current_music_queue = portal_guilds[guild_id].music_queue;

		if (current_dispatcher !== null && current_dispatcher !== undefined) {
			if (current_music_queue.length > 0) {
				const next_yts_video = portal_guilds[guild_id].music_queue.shift();
				if (client.voice) {
					const voice_connection = client.voice.connections.find((connection: VoiceConnection) => !!connection.channel.id);

					if (voice_connection) {
						portal_guilds[guild_id].dispatcher = voice_connection
							.play(ytdl(next_yts_video.url, { filter: 'audioonly' }));

						update_message(portal_guilds[guild_id], guild_object, next_yts_video);

						const stream = ytdl(next_yts_video.url, {
							filter: 'audioonly',
							opusEncoded: false,
							fmt: 'mp3',
						});

						portal_guilds[guild_id].dispatcher = voice_connection.play(stream);
						update_message(portal_guilds[guild_id], guild_object, next_yts_video);
						portal_guilds[guild_id].dispatcher.on('finish', () => {
							skip(guild_id, portal_guilds, client, guild_object);
							portal_guilds[guild_id].music_data.votes = [];
						});
					}
				}
			}
			else {
				const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
					'.github.io/master/assets/img/logo.png';
				update_message(portal_guilds[guild_id],
					guild_object,
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
				portal_guilds[guild_id].dispatcher = null;
				return resolve({ result: false, value: 'music list is empty' });
			}

			return resolve({ result: false, value: 'song has been skipped.' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now.' });
		}
	});
};
