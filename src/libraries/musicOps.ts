import ytdl from 'discord-ytdl-core';
import { Client, Guild, Message, StreamDispatcher, VoiceConnection } from "discord.js";
import yts from 'yt-search';
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { join_user_voice, update_music_message } from './helpOps';
import { insert_music_video } from './mongoOps';
// const ytdl = require('ytdl-core');

export async function start(
	client: Client, message: Message, search_term: string, guild_object: GuildPrtl, dispatchers: { id: string, dispatcher: StreamDispatcher }[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!search_term || search_term === '')
			return resolve({ result: false, value: 'cannot search for nothing' });
		if (!message.member)
			return resolve({ result: false, value: 'member has left the guild' });
		if (!message.member.voice.channel)
			return resolve({ result: false, value: 'you are not connected to any channel' });

		const guild_id = message.member.voice.channel.guild.id;

		const guild = client.guilds.cache.find(g => g.id === guild_id);
		if (!guild) return resolve({ result: false, value: 'could fetch guild from client' });

		const portal_voice_connection = client.voice?.connections
			.find((connection: VoiceConnection) => {
				return message.guild ? connection.channel.guild.id === message.guild.id : false;
			});

		const dispatcher_object = dispatchers.find(d => d.id === guild_object.id)
		let dispatcher = dispatcher_object ? dispatcher_object.dispatcher : undefined;

		if (dispatcher) {
			yts(search_term)
				.then(yts_attempt => {
					if (yts_attempt) {
						if (portal_voice_connection && portal_voice_connection.speaking) {
							insert_music_video(guild_id, yts_attempt.videos[0])
								.then(r => { return resolve({ result: r, value: r 
									? 'already playing song, your song has been added in list'
									: 'already playing song, could not push video to queue' }) })
								.catch(e => { return resolve({ result: false, value: 'already playing song, could not push video to queue' }) });

							// guild_object.music_queue.push(yts_attempt.videos[0]); //fix tsiakkas
							// update_music_message(guild, guild_object, guild_object.music_queue[0]);
						} else {
							if (message && message.guild) {
								play(guild_object, client, message, message.guild, dispatchers)
									.then(response => { return resolve(response); })
									.catch(error => { return resolve({ result: false, value: error }); });
							} else {
								return resolve({ result: false, value: 'could not fetch message' });
							}
						}
					}
					else {
						return resolve({ result: false, value: 'could not find youtube video' });
					}
				})
				.catch(error => { return resolve({ result: false, value: error }) });
		} else {
			join_user_voice(client, message, guild_object, false)
				.then(join_attempt => {
					if (join_attempt.result) {
						yts(search_term)
							.then(yts_attempt => {
								if (yts_attempt && yts_attempt.videos.length > 0) {
									const stream = ytdl(yts_attempt.videos[0].url, {
										filter: 'audioonly',
										opusEncoded: false,
										fmt: 'mp3',
										highWaterMark: 2048,
									});

									insert_music_video(guild_id, yts_attempt.videos[0])
										.then(r => { return resolve({ result: r, value: r ? 'queued video' : 'could not push video to queue' }) })
										.catch(e => { return resolve({ result: false, value: 'could not fetch message' }) });

									// guild_object.music_queue.push(yts_attempt.videos[0]);

									if (join_attempt.voice_connection) {
										dispatcher = join_attempt.voice_connection.play(stream);
										dispatchers.push({ id: guild_object.id, dispatcher: dispatcher });
										if (dispatcher) {
											if (message.member && message.member.voice && message.member.voice.channel) {
												const guild = client.guilds.cache.find(g => g.id === message.guild?.id);
												if (guild !== undefined)
													update_music_message(guild, guild_object, yts_attempt.videos[0]);

												dispatcher.on('finish', () => {
													if (message.guild) {
														skip(guild_object, client, message, message.guild, dispatcher);
														guild_object.music_data.votes = [];
													}
												});

												return resolve({ result: false, value: 'playing video' });
											} else {
												return resolve({ result: false, value: 'could not find user' });
											}
										} else {
											return resolve({ result: false, value: 'could not find user' });
										}
									} else {
										return resolve({ result: false, value: 'failed to join voice_channel' });
									}
								}
								else {
									return resolve({ result: false, value: 'could not fetch StreamDispatcher' });
								}
							})
							.catch(error => console.log(error));
					} else {
						return resolve({ result: false, value: join_attempt.value });
					}
				})
				.catch(error => {
					return resolve({ result: false, value: error });
				});
		}
	});
};

export async function play(
	guild_object: GuildPrtl, client: Client, message: Message, guild: Guild, dispatchers: { id: string, dispatcher: StreamDispatcher }[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!client.voice)
			return resolve({ result: false, value: 'portal is not connected to a channel' });
		if (!message.guild)
			return resolve({ result: false, value: 'could not fetch guild of message' });

		const guild_id = message.guild.id;
		const voice_connection = client.voice.connections
			.find((connection: VoiceConnection) => connection.channel.guild.id === guild_id);

		if (!voice_connection)
			return resolve({ result: false, value: 'portal is not connected to your channel' });

		const dispatcher_object = dispatchers.find(d => d.id === guild_object.id)
		let dispatcher = dispatcher_object ? dispatcher_object.dispatcher : undefined;

		if (dispatcher) {
			if (dispatcher.paused) {
				dispatcher.resume();

				dispatcher.on('finish', () => {
					skip(guild_object, client, message, guild, dispatcher);
					guild_object.music_data.votes = [];
				});

				return resolve({ result: false, value: 'video has been resumed' });
			} else {
				return resolve({ result: false, value: 'video is already playing' });
			}
		} else {
			const next_yts_video = guild_object.music_queue.shift();
			if (next_yts_video) {
				if (voice_connection) {
					dispatcher = voice_connection
						.play(ytdl(next_yts_video.url, { filter: 'audioonly' }));

					console.log('dispatcher :>> ', dispatcher);

					update_music_message(guild, guild_object, next_yts_video);

					const stream = ytdl(next_yts_video.url, {
						filter: 'audioonly',
						opusEncoded: false,
						fmt: 'mp3',
					});

					dispatcher = voice_connection.play(stream);
					update_music_message(guild, guild_object, next_yts_video);
					dispatcher.on('finish', () => {
						skip(guild_object, client, message, guild, dispatcher);
						guild_object.music_data.votes = []; //FIX TSIAKKAS
					});
				}
			} else {
				return resolve({ result: false, value: 'no song playing and queue is empty' });
			}
		}
	});
};

export async function pause(
	guild_object: GuildPrtl, dispatcher: StreamDispatcher | undefined
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (dispatcher) {
			if (!dispatcher.paused) {
				dispatcher.pause();
			}
			return resolve({ result: false, value: 'song has been paused' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now' });
		}
	});
};

export async function stop(
	guild_object: GuildPrtl, guild: Guild, dispatcher: StreamDispatcher | undefined
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';
		update_music_message(
			guild,
			guild_object,
			{
				type: 'video',
				videoId: '-',
				url: 'just type and I\'ll play',
				title: 'Music Player',
				description: '-',
				image: '-',
				thumbnail: portal_icon_url,
				seconds: 0,
				timestamp: '-',
				duration: {
					seconds: 0,
					timestamp: '0'
				},
				ago: '-',
				views: 0,
				author: {
					name: '-',
					url: '-'
				}
			});

		if (dispatcher) {
			if (!dispatcher.paused) dispatcher.pause();
			return resolve({ result: false, value: 'song has been stopped' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now' });
		}
	});
};

export async function skip(
	guild_object: GuildPrtl, client: Client, message: Message, guild: Guild, dispatcher: StreamDispatcher | undefined
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const portal_voice_connection = client.voice?.connections
			.find((connection: VoiceConnection) => {
				if (!message.guild) return false;
				return connection.channel.guild.id === message.guild.id;
			});

		if (dispatcher) {
			if (guild_object.music_queue.length > 0) {
				guild_object.music_queue.shift(); // fix shift
				const next_yts_video: yts.VideoSearchResult | undefined = guild_object.music_queue[0];
				if (next_yts_video) {
					if (portal_voice_connection) {
						const stream = ytdl(next_yts_video.url, {
							filter: 'audioonly',
							opusEncoded: false,
							fmt: 'mp3',
						});

						dispatcher = portal_voice_connection.play(stream);
						update_music_message(guild, guild_object, next_yts_video);
						dispatcher.on('finish', () => {
							skip(guild_object, client, message, guild, dispatcher);
							guild_object.music_data.votes = [];
						});

					}
				}
				else {
					const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
						'.github.io/master/assets/img/logo.png';
					update_music_message(
						guild,
						guild_object,
						{
							type: 'video',
							videoId: '-',
							url: 'just type and I\'ll play',
							title: 'Music Player',
							description: '-',
							image: '-',
							thumbnail: portal_icon_url,
							seconds: 0,
							timestamp: '-',
							duration: {
								seconds: 0,
								timestamp: '0'
							},
							ago: '-',
							views: 0,
							author: {
								name: '-',
								url: '-'
							}
						});
					if (!dispatcher.paused) {
						dispatcher.pause();
					}
					dispatcher = undefined;
					return resolve({ result: false, value: 'music list is empty' });
				}

				return resolve({ result: true, value: 'song has been skipped' });
			}
			else {
				return resolve({ result: false, value: 'nothing playing write now' });
			}
		}
	});
};
