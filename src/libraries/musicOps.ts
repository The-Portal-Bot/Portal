import ytdl from 'discord-ytdl-core';
import { Client, Guild, StreamDispatcher, User, VoiceConnection } from "discord.js";
import yts from 'yt-search';
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { join_by_reaction, update_music_message } from './helpOps';
import { clear_music_vote, insert_music_video, update_guild, fetch_guild } from './mongoOps';
// const ytdl = require('ytdl-core');

const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
	'.github.io/master/assets/img/logo.png';

const empty_message: yts.VideoSearchResult = {
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
};

function pop_music_queue(
	guild_object: GuildPrtl
): Promise<yts.VideoSearchResult | undefined> {
	return new Promise((resolve) => {
		fetch_guild(guild_object.id)
			.then(r => {
				if (!r) {
					return resolve(undefined);
				}
				guild_object = r;
				if (guild_object.music_queue.length > 0) {
					guild_object.music_queue.shift();
					update_guild(guild_object.id, 'music_queue', guild_object.music_queue);

					return resolve(guild_object.music_queue[0]);
				}

				return resolve(undefined);
			})
			.catch(e => {
				return resolve(undefined);
			});
	})
}

function spawn_dispatcher(
	video_options: yts.VideoSearchResult, voice_connection: VoiceConnection
): StreamDispatcher {
	const stream = ytdl(video_options.url, {
		filter: 'audioonly',
		opusEncoded: true,
		encoderArgs: ['-af', 'bass=g=10, dynaudnorm=f=200']
	});

	voice_connection.setSpeaking('SOUNDSHARE');
	const dispatcher = voice_connection.play(stream, { type: 'opus' });
	dispatcher.setBitrate(96000);

	return dispatcher;
}

export async function start(
	voice_connection: VoiceConnection | undefined, client: Client, user: User,
	guild: Guild, guild_object: GuildPrtl, search_term: string
): Promise<ReturnPormise> {
	return new Promise(resolve => {
		yts(search_term)
			.then(yts_attempt => {
				if (yts_attempt.videos.length <= 0) {
					const msg = `could not find something matching ${search_term}, on youtube`;
					update_music_message(guild, guild_object, yts_attempt.videos[0], msg);

					return resolve({
						result: false,
						value: msg
					});
				}

				if (voice_connection) {
					if (voice_connection.dispatcher) {
						guild_object.music_queue.push(yts_attempt.videos[0]);
						insert_music_video(guild_object.id, yts_attempt.videos[0])
							.then(r => {
								const msg = r
									? 'already playing, added to queue'
									: 'already playing, could add to queue';
								update_music_message(guild, guild_object, guild_object.music_queue[0], msg);

								return resolve({
									result: r,
									value: msg
								});
							})
							.catch(e => {
								const msg = `error while adding to queue: ${e}`;
								update_music_message(guild, guild_object, guild_object.music_queue[0], msg);

								return resolve({
									result: false,
									value: msg
								});
							});
					} else {
						guild_object.music_queue.push(yts_attempt.videos[0]);
						insert_music_video(guild_object.id, yts_attempt.videos[0]);

						const dispatcher = spawn_dispatcher(yts_attempt.videos[0], voice_connection);

						dispatcher.once('finish', () => {
							dispatcher.destroy();
							skip(voice_connection, user, client, guild, guild_object);
							clear_music_vote(guild_object.id);
						});

						update_music_message(
							guild,
							guild_object,
							yts_attempt.videos[0],
							'playback started'
						);

						return resolve({
							result: true,
							value: 'playback started'
						});
					}
				} else {
					insert_music_video(guild_object.id, yts_attempt.videos[0]);
					join_by_reaction(client, guild_object, user, true)
						.then(r => {
							if (r.result) {
								if (!r.voice_connection) {
									update_music_message(
										guild,
										guild_object,
										yts_attempt.videos[0],
										'failed to join voice channel'
									);

									return resolve({
										result: false,
										value: `could not join your voice channel`
									});
								}

								if (yts_attempt.videos.length <= 0) {
									update_music_message(
										guild,
										guild_object,
										yts_attempt.videos[0],
										`could not find something matching ${search_term}, on youtube`
									);

									return resolve({
										result: false,
										value: `could not find something matching ${search_term}, on youtube`
									});
								}

								const dispatcher = spawn_dispatcher(yts_attempt.videos[0], r.voice_connection);
								dispatcher.once('finish', () => {
									dispatcher.destroy();
									skip(r.voice_connection, user, client, guild, guild_object);
									clear_music_vote(guild_object.id);
								});

								update_music_message(
									guild,
									guild_object,
									yts_attempt.videos[0],
									'playback started'
								);

								return resolve({
									result: true,
									value: 'playback started'
								});
							} else {
								update_music_message(
									guild,
									guild_object,
									yts_attempt.videos[0],
									r.value
								);

								return resolve({
									result: false,
									value: r.value
								});
							}
						});
				}
			})
			.catch(e => {
				update_music_message(
					guild,
					guild_object,
					guild_object.music_queue[0] ? guild_object.music_queue[0] : empty_message,
					'error while searching youtube: ' + e
				);

				return resolve({
					result: false,
					value: 'error while searching youtube: ' + e
				});
			});
	});
};

export async function play(
	voice_connection: VoiceConnection | undefined, user: User,
	client: Client, guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				if (voice_connection.dispatcher.paused) {
					voice_connection.dispatcher.resume();
					update_music_message(
						guild,
						guild_object,
						guild_object.music_queue[0],
						'playback resumed'
					);

					return resolve({
						result: true,
						value: 'playback resumed'
					});
				}
			} else {
				pop_music_queue(guild_object)
					.then(next_video => {
						if (!next_video) {
							update_music_message(
								guild,
								guild_object,
								empty_message,
								'music queue is empty'
							);

							return resolve({
								result: false,
								value: 'music queue is empty'
							});
						}

						const dispatcher = spawn_dispatcher(next_video, voice_connection);
						dispatcher.once('finish', () => {
							dispatcher.destroy();
							skip(voice_connection, user, client, guild, guild_object);
							clear_music_vote(guild_object.id);
						});

						update_music_message(
							guild,
							guild_object,
							guild_object.music_queue[0],
							'playing queued song'
						);

						return resolve({
							result: true,
							value: 'playing queued song'
						});
					});
			}
		} else {
			if (guild_object.music_queue.length === 0) {
				update_music_message(
					guild,
					guild_object,
					empty_message,
					'queue is empty'
				);

				return resolve({
					result: false,
					value: 'queue is empty'
				});
			}

			const current_video = guild_object.music_queue[0];

			join_by_reaction(client, guild_object, user, true)
				.then(r => {
					if (r.result) {
						if (!r.voice_connection) {
							update_music_message(
								guild,
								guild_object,
								current_video,
								'failed to join voice channel'
							);

							return resolve({
								result: false,
								value: 'failed to join voice channel'
							});
						}

						const dispatcher = spawn_dispatcher(current_video, r.voice_connection);

						dispatcher.once('finish', () => {
							dispatcher.destroy();
							skip(voice_connection, user, client, guild, guild_object);
							clear_music_vote(guild_object.id);
						});

						update_music_message(
							guild,
							guild_object,
							current_video,
							'playing video from queue'
						);

						return resolve({
							result: true,
							value: 'playing video from queue'
						});
					} else {
						update_music_message(
							guild,
							guild_object,
							current_video,
							r.value
						);

						return resolve({
							result: false,
							value: r.value
						});
					}
				})
				.catch(e => {
					return resolve({
						result: false,
						value: 'failed to join voice channel, ' + e
					});
				});
		}
	});
};

export async function pause(
	voice_connection: VoiceConnection | undefined,
	guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		let returnValue: ReturnPormise = {
			result: false,
			value: ''
		};

		if (voice_connection) {
			if (voice_connection.dispatcher) {
				if (!voice_connection.dispatcher.paused) {
					voice_connection.dispatcher.pause();
					returnValue.result = true;
					returnValue.value = 'playback paused';
				} else {
					returnValue.result = false;
					returnValue.value = 'already paused';
				}
			} else {
				returnValue.result = false;
				returnValue.value = 'no playback';
			}
		} else {
			returnValue.result = false;
			returnValue.value = 'portal is not connected';
		}

		update_music_message(
			guild,
			guild_object,
			guild_object.music_queue[0]
				? guild_object.music_queue[0]
				: empty_message,
			returnValue.value
		);

		return resolve(returnValue);
	});
};

// export async function stop(
// 	voice_connection: VoiceConnection | undefined,
// 	guild: Guild, guild_object: GuildPrtl
// ): Promise<ReturnPormise> {
// 	return new Promise((resolve) => {
// 		let returnValue: ReturnPormise = {
// 			result: false,
// 			value: ''
// 		};

// 		if (voice_connection) {
// 			if (voice_connection.dispatcher) {
// 				voice_connection.dispatcher.end();
// 				returnValue.result = true;
// 				returnValue.value = 'playback stopped';
// 			} else {
// 				returnValue.result = false;
// 				returnValue.value = 'no playback';
// 			}
// 		} else {
// 			returnValue.result = false;
// 			returnValue.value = 'portal is not connected';
// 		}

// 		update_music_message(
// 			guild,
// 			guild_object,
// 			empty_message,
// 			returnValue.value
// 		);

// 		return resolve(returnValue);
// 	});
// };

export async function skip(
	voice_connection: VoiceConnection | undefined, user: User,
	client: Client, guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				console.log('A guild_object.music_queue :>> ', guild_object.music_queue.map(r => r.title));
				voice_connection.dispatcher.end();
			} else {
				console.log('NO DISPATCHER');
				console.log('B guild_object.music_queue :>> ', guild_object.music_queue.map(r => r.title));

				pop_music_queue(guild_object)
					.then(next_video => {

						if (!next_video) {
							update_music_message(
								guild,
								guild_object,
								empty_message,
								'queue is empty'
							);

							return resolve({
								result: false,
								value: 'queue is empty'
							});
						}

						const dispatcher = spawn_dispatcher(next_video, voice_connection);
						dispatcher.once('finish', () => {
							dispatcher.destroy();
							skip(voice_connection, user, client, guild, guild_object);
							clear_music_vote(guild_object.id);
						});

						update_music_message(
							guild,
							guild_object,
							next_video,
							'skipped to queued song'
						);

						return resolve({
							result: true,
							value: 'skipped to queued song'
						});
					});
			}
		} else {
			pop_music_queue(guild_object)
				.then(next_video => {

					if (!next_video) {
						update_music_message(
							guild,
							guild_object,
							empty_message,
							'queue is empty'
						);

						return resolve({
							result: false,
							value: 'playing video from queue'
						});
					}

					join_by_reaction(client, guild_object, user, true)
						.then(r => {
							if (r.result) {
								if (!r.voice_connection) {
									update_music_message(
										guild,
										guild_object,
										guild_object.music_queue[0],
										'failed to join voice channel'
									);

									return resolve({
										result: false,
										value: 'failed to join voice channel'
									});
								}

								const dispatcher = spawn_dispatcher(next_video, r.voice_connection);

								dispatcher.once('finish', () => {
									dispatcher.destroy();
									skip(voice_connection, user, client, guild, guild_object);
									clear_music_vote(guild_object.id);
								});

								update_music_message(
									guild,
									guild_object,
									guild_object.music_queue[0],
									'playing video from queue'
								);

								return resolve({
									result: true,
									value: 'playing video from queue'
								});
							} else {
								update_music_message(
									guild,
									guild_object,
									guild_object.music_queue[0],
									r.value
								);

								return resolve({
									result: false,
									value: r.value
								});
							}
						})
						.catch(e => {
							return resolve({
								result: false,
								value: 'failed to join voice channel, ' + e
							});
						});
				});
		}
	});
};
