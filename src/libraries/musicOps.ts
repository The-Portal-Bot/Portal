import ytdl from 'discord-ytdl-core';
import { Client, Guild, Message, VoiceConnection } from "discord.js";
import yts from 'yt-search';
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { guildPrtl_to_object, join_user_voice, update_music_message } from './helpOps';


// const ytdl = require('ytdl-core');

export async function start(
	client: Client, message: Message, search_term: string, guild_list: GuildPrtl[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!search_term || search_term === '')
			return resolve({ result: false, value: 'cannot search for nothing' });
		if (!message.member)
			return resolve({ result: false, value: 'member has left the guild' });
		if (!message.member.voice.channel)
			return resolve({ result: false, value: 'you are not connected to any channel' });
		const guild_id = message.member.voice.channel.guild.id;

		const guild_object = guildPrtl_to_object(guild_list, guild_id);
		if (!guild_object) return resolve({ result: false, value: 'could not find guild in guild_list' });
		const guild = client.guilds.cache.find(g => g.id === guild_id);
		if (!guild) return resolve({ result: false, value: 'could fetch guild from client' });

		const portal_voice_vonnection = client.voice?.connections
			.find((connection: VoiceConnection) => {
				if (!message.guild) return false;
				return connection.channel.guild.id === message.guild.id;
			});

		if (guild_object.dispatcher) {
			yts(search_term)
				.then(yts_attempt => {
					if (yts_attempt) {
						if (portal_voice_vonnection && portal_voice_vonnection.speaking) {
							guild_object.music_queue.push(yts_attempt.videos[0]);
							update_music_message(guild, guild_object, guild_object.music_queue[0]);
							return resolve({ result: true, value: 'already playing song, your song has been added in list' });
						} else {
							if (message && message.guild) {
								play(message.guild.id, guild_list, client, message, message.guild)
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
			join_user_voice(client, message, guild_list, false)
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
									guild_object.music_queue.push(yts_attempt.videos[0]);
									guild_object.dispatcher = join_attempt.voice_connection?.play(stream);
									if (guild_object.dispatcher) {
										if (message.member && message.member.voice && message.member.voice.channel) {
											const guild = client.guilds.cache.find(g => g.id === message.guild?.id);
											if (guild !== undefined)
												update_music_message(guild, guild_object, yts_attempt.videos[0]);

											guild_object.dispatcher.on('finish', () => {
												if (message.guild) {
													skip(guild_id, guild_list, client, message, message.guild);
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
								}
								else {
									return resolve({ result: false, value: 'could not fetch StreamDispatcher' });
								}
							})
							.catch(error => console.log(error));
					}
					else {
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
	guild_id: string, guild_list: GuildPrtl[], client: Client, message: Message, guild: Guild
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const guild_object = guildPrtl_to_object(guild_list, guild_id);
		if (!guild_object) return { result: false, value: 'could not find guild in guild_list' };

		const portal_voice_vonnection = client.voice?.connections
			.find((connection: VoiceConnection) => {
				if (!message.guild) return false;
				return connection.channel.guild.id === message.guild.id;
			});
		if (!portal_voice_vonnection) return resolve({ result: false, value: 'portal is not connected' });

		if (guild_object.dispatcher) {
			if (guild_object.dispatcher.paused) {
				guild_object.dispatcher.resume();

				guild_object.dispatcher.on('finish', () => {
					skip(guild_id, guild_list, client, message, guild);
					guild_object.music_data.votes = [];
				});

				return resolve({ result: false, value: 'song has been resumed' });
			}
		}
		else if (guild_object.dispatcher === null) {
			const next_yts_video = guild_object.music_queue.shift();
			if (next_yts_video) {
				if (client.voice) {
					const voice_connection = client.voice.connections.find((connection: VoiceConnection) => !!connection.channel.id);

					if (voice_connection) {
						guild_object.dispatcher = voice_connection
							.play(ytdl(next_yts_video.url, { filter: 'audioonly' }));

						update_music_message(guild, guild_object, next_yts_video);

						const stream = ytdl(next_yts_video.url, {
							filter: 'audioonly',
							opusEncoded: false,
							fmt: 'mp3',
						});

						guild_object.dispatcher = voice_connection.play(stream);
						update_music_message(guild, guild_object, next_yts_video);
						guild_object.dispatcher.on('finish', () => {
							skip(guild_id, guild_list, client, message, guild);
							guild_object.music_data.votes = [];
						});
					}
				}
			}
			return resolve({ result: false, value: 'next video playing' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now' });
		}
	});
};

export async function pause(
	guild_id: string, guild_list: GuildPrtl[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const guild_object = guildPrtl_to_object(guild_list, guild_id);
		if (!guild_object) return resolve({ result: false, value: 'could not find guild in guild_list' });

		if (guild_object.dispatcher) {
			if (!guild_object.dispatcher.paused) {
				guild_object.dispatcher.pause();
			}
			return resolve({ result: false, value: 'song has been paused' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now' });
		}
	});
};

export async function stop(
	guild_id: string, guild_list: GuildPrtl[], guild: Guild
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const guild_object = guildPrtl_to_object(guild_list, guild_id);
		if (!guild_object) return resolve({ result: false, value: 'could not find guild in guild_list' });

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

		if (guild_object.dispatcher) {
			if (!guild_object.dispatcher.paused) guild_object.dispatcher.pause();
			return resolve({ result: false, value: 'song has been stopped' });
		}
		else {
			return resolve({ result: false, value: 'nothing playing write now' });
		}
	});
};

export async function skip(
	guild_id: string, guild_list: GuildPrtl[], client: Client, message: Message, guild: Guild
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const guild_object = guildPrtl_to_object(guild_list, guild_id);
		if (!guild_object) return resolve({ result: false, value: 'could not find guild in guild_list' });

		const portal_voice_vonnection = client.voice?.connections
			.find((connection: VoiceConnection) => {
				if (!message.guild) return false;
				return connection.channel.guild.id === message.guild.id;
			});

		if (guild_object.dispatcher) {
			if (guild_object.music_queue.length > 0) {
				guild_object.music_queue.shift();
				const next_yts_video: yts.VideoSearchResult | undefined = guild_object.music_queue[0];
				if (next_yts_video) {
					if (portal_voice_vonnection) {
						const stream = ytdl(next_yts_video.url, {
							filter: 'audioonly',
							opusEncoded: false,
							fmt: 'mp3',
						});

						guild_object.dispatcher = portal_voice_vonnection.play(stream);
						update_music_message(guild, guild_object, next_yts_video);
						guild_object.dispatcher.on('finish', () => {
							skip(guild_id, guild_list, client, message, guild);
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
					if (!guild_object.dispatcher.paused) {
						guild_object.dispatcher.pause();
					}
					guild_object.dispatcher = undefined;
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
