import ytdl from 'discord-ytdl-core';
import { Client, Guild, StreamDispatcher, StreamOptions, User, VoiceConnection } from "discord.js";
import yts from 'yt-search';
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { join_by_reaction, update_music_message } from './helpOps';
import { clear_music_vote, insert_music_video, update_guild, fetch_guild_music_queue } from './mongoOps';
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

async function pop_music_queue(
	guild_object: GuildPrtl
): Promise<yts.VideoSearchResult | undefined> {
	return new Promise((resolve) => {
		fetch_guild_music_queue(guild_object.id)
			.then(music_queue => {
				if (!music_queue) {
					return resolve(undefined);
				}

				if (music_queue.length > 0) {
					music_queue.shift();
					update_guild(guild_object.id, 'music_queue', music_queue);
					guild_object.music_queue = music_queue;

					return resolve(music_queue[0]);
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

	const stream_options = <StreamOptions>{
		type: 'opus',
		bitrate: 96000
	}

	return voice_connection.play(stream, stream_options);
}

async function push_video_to_queue(
	guild: Guild, guild_object: GuildPrtl, video: yts.VideoSearchResult
): Promise<ReturnPormise> {
	return new Promise(resolve => {
		if (!guild_object.music_queue) {
			guild_object.music_queue = [];
		}

		guild_object.music_queue.push(video);
		insert_music_video(guild_object.id, video)
			.then(r => {
				const msg = r
					? `${video.title} has been added to queue`
					: `${video.title} failed to get added to queue`;
				update_music_message(
					guild,
					guild_object,
					guild_object.music_queue
						? guild_object.music_queue[0]
						: video,
					msg,
					false);

				return resolve({
					result: r,
					value: msg
				});
			})
			.catch(e => {
				const msg = `error while adding to queue: ${e}`;
				update_music_message(
					guild,
					guild_object,
					guild_object.music_queue
						? guild_object.music_queue[0]
						: video,
					msg,
					false);

				return resolve({
					result: false,
					value: msg
				});
			});
	});
}

async function start_playback(
	voice_connection: VoiceConnection | undefined, client: Client, user: User,
	guild: Guild, guild_object: GuildPrtl, video: yts.VideoSearchResult
): Promise<ReturnPormise> {
	return new Promise(resolve => {
		push_video_to_queue(guild, guild_object, video)
			.then(push_response => {
				if (voice_connection) {
					if (!voice_connection.dispatcher) {
						const dispatcher = spawn_dispatcher(
							guild_object.music_queue
								? guild_object.music_queue[0]
								: video,
							voice_connection
						);

						dispatcher.once('finish', () => {
							dispatcher.destroy();
							skip(voice_connection, user, client, guild, guild_object);
							clear_music_vote(guild_object.id);
						});

						update_music_message(
							guild,
							guild_object,
							guild_object.music_queue
								? guild_object.music_queue[0]
								: video,
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
							guild_object.music_queue
								? guild_object.music_queue[0]
								: video,
							'already playing'
						);

						return resolve(
							push_response
						);
					}
				} else {
					join_by_reaction(client, guild_object, user, false)
						.then(r => {
							if (r.result) {
								if (!r.voice_connection) {
									update_music_message(
										guild,
										guild_object,
										guild_object.music_queue
											? guild_object.music_queue[0]
											: video,
										'failed to join voice channel 2');

									return {
										result: false,
										value: `could not join your voice channel`
									};
								}

								const dispatcher = spawn_dispatcher(
									guild_object.music_queue
										? guild_object.music_queue[0]
										: video,
									r.voice_connection
								);

								dispatcher.once('finish', () => {
									dispatcher.destroy();
									skip(r.voice_connection, user, client, guild, guild_object);
									clear_music_vote(guild_object.id);
								});

								update_music_message(
									guild,
									guild_object,
									guild_object.music_queue
										? guild_object.music_queue[0]
										: video,
									'playback started'
								);

								return {
									result: true,
									value: 'playback started'
								};
							} else {
								update_music_message(
									guild,
									guild_object,
									guild_object.music_queue
										? guild_object.music_queue[0]
										: video, r.value);

								return {
									result: false,
									value: r.value
								};
							}
						})
						.catch(e => {
							const msg = `error while joining voice channel ${e}`;
							update_music_message(guild, guild_object, empty_message, msg);

							return resolve({
								result: false,
								value: msg
							});
						});
				}
			})
			.catch(e => {
				update_music_message(guild, guild_object, empty_message,
					`error while adding video to queue 2: ${e}`);

				return resolve({
					result: false,
					value: `error while adding video to queue 2: ${e}`
				});
			});
	});
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
					update_music_message(
						guild,
						guild_object,
						yts_attempt.videos
							? yts_attempt.videos[0]
							: empty_message,
						msg);

					return resolve({
						result: false,
						value: msg
					});
				}

				start_playback(
					voice_connection, client, user,
					guild, guild_object, yts_attempt.videos[0]
				)
					.then(r => {
						return resolve(r);
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `error while starting music player (${e})`
						});
					});

			})
			.catch(e => {
				update_music_message(
					guild,
					guild_object,
					guild_object.music_queue[0]
						? guild_object.music_queue[0]
						: empty_message,
					`error while searching youtube (${e})`
				);

				return resolve({
					result: false,
					value: `error while searching youtube (${e})`
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
								'queue is empty',
								false
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
					'queue is empty',
					false
				);

				return resolve({
					result: false,
					value: 'queue is empty'
				});
			}

			join_by_reaction(client, guild_object, user, false)
				.then(r => {
					if (r.result) {
						if (!r.voice_connection) {
							update_music_message(
								guild,
								guild_object,
								guild_object.music_queue[0],
								'failed to join voice channel 3'
							);

							return resolve({
								result: false,
								value: 'failed to join voice channel 4'
							});
						}

						const dispatcher = spawn_dispatcher(guild_object.music_queue[0], r.voice_connection);

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
						value: 'failed to join voice channel 5, ' + e
					});
				});
		}
	});
};

export async function pause(
	voice_connection: VoiceConnection | undefined, user: User,
	guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		let return_value: ReturnPormise = {
			result: false,
			value: ''
		};

		if (voice_connection) {
			if (voice_connection.dispatcher) {
				if (!voice_connection.dispatcher.paused) {
					voice_connection.dispatcher.pause();
					return_value.result = true;
					return_value.value = 'playback paused';
				} else {
					return_value.result = false;
					return_value.value = 'already paused';
				}
			} else {
				return_value.result = false;
				return_value.value = 'no playback';
			}
		} else {
			return_value.result = false;
			return_value.value = 'portal is not connected';
		}

		update_music_message(
			guild,
			guild_object,
			guild_object.music_queue[0]
				? guild_object.music_queue[0]
				: empty_message,
			return_value.value,
			false
		);

		return resolve(return_value);
	});
};

// export async function stop(
// 	voice_connection: VoiceConnection | undefined,
// 	guild: Guild, guild_object: GuildPrtl
// ): Promise<ReturnPormise> {
// 	return new Promise((resolve) => {
// 		let return_value: ReturnPormise = {
// 			result: false,
// 			value: ''
// 		};

// 		if (voice_connection) {
// 			if (voice_connection.dispatcher) {
// 				voice_connection.dispatcher.end();
// 				return_value.result = true;
// 				return_value.value = 'playback stopped';
// 			} else {
// 				return_value.result = false;
// 				return_value.value = 'no playback';
// 			}
// 		} else {
// 			return_value.result = false;
// 			return_value.value = 'portal is not connected';
// 		}

// 		update_music_message(
// 			guild,
// 			guild_object,
// 			empty_message,
// 			return_value.value
// 		);

// 		return resolve(return_value);
// 	});
// };

export async function skip(
	voice_connection: VoiceConnection | undefined, user: User,
	client: Client, guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				voice_connection.dispatcher.end();
			} else {
				pop_music_queue(guild_object)
					.then(next_video => {
						if (!next_video) {
							update_music_message(
								guild,
								guild_object,
								empty_message,
								'queue is empty',
								false
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
							'queue is empty',
							false
						);

						return resolve({
							result: false,
							value: 'playing video from queue'
						});
					}

					join_by_reaction(client, guild_object, user, false)
						.then(r => {
							if (r.result) {
								if (!r.voice_connection) {
									update_music_message(
										guild,
										guild_object,
										guild_object.music_queue[0],
										'failed to join voice channel 6'
									);

									return resolve({
										result: false,
										value: 'failed to join voice channel 7'
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
								value: 'failed to join voice channel 8, ' + e
							});
						});
				});
		}
	});
};
