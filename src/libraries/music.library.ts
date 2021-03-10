import ytdl from 'discord-ytdl-core';
import { Client, Guild, StreamDispatcher, StreamOptions, User, VoiceConnection } from "discord.js";
import yts from 'yt-search';
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl.interface";
import { join_by_reaction } from './help.library';
import { clear_music_vote, fetch_guild_music_queue, insert_music_video, update_guild } from './mongo.library';
// const ytdl = require('ytdl-core');

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

	const dispatcher = voice_connection.play(stream, stream_options);
	dispatcher.setMaxListeners(20); // check

	return dispatcher;
}

async function push_video_to_queue(
	guild_object: GuildPrtl, video: yts.VideoSearchResult
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

				return resolve({
					result: r,
					value: msg
				});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: `error while adding to queue: ${e}`
				});
			});
	});
}

async function start_playback(
	voice_connection: VoiceConnection | undefined, client: Client, user: User,
	guild: Guild, guild_object: GuildPrtl, video: yts.VideoSearchResult
): Promise<ReturnPormise> {
	return new Promise(resolve => {
		push_video_to_queue(guild_object, video)
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
							if (!dispatcher.destroyed) {
								dispatcher.destroy();
							}
							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
								})
								.catch(console.log);
						});

						return resolve({
							result: true,
							value: 'playback started'
						});
					} else {
						return resolve({
							result: true,
							value: 'already playing, song added to queue'
						});
					}
				} else {
					join_by_reaction(client, guild_object, user, false)
						.then(r => {
							if (r.result) {
								if (!r.voice_connection) {
									return resolve({
										result: false,
										value: `could not join your voice channel`
									});
								}

								const dispatcher = spawn_dispatcher(
									guild_object.music_queue
										? guild_object.music_queue[0]
										: video,
									r.voice_connection
								);

								dispatcher.once('finish', () => {
									if (!dispatcher.destroyed) {
										dispatcher.destroy();
									}
									skip(r.voice_connection, user, client, guild, guild_object)
										.then(r => {
											clear_music_vote(guild_object.id);
										})
										.catch(console.log);
								});

								return resolve({
									result: true,
									value: 'playback started'
								});
							} else {
								return resolve({
									result: false,
									value: r.value
								});
							}
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `error while joining channel (${e})`
							});
						});
				}
			})
			.catch(e => {
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
					return resolve({
						result: false,
						value: `could not find something matching ${search_term}, on youtube`
					});
				}

				start_playback(
					voice_connection, client, user,
					guild, guild_object, yts_attempt.videos[0]
				)
					.then(r => {
						return resolve(
							r
						);
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `error while starting music player (${e})`
						});
					});

			})
			.catch(e => {
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

					return resolve({
						result: true,
						value: 'playback resumed'
					});
				}
			} else {
				pop_music_queue(guild_object)
					.then(next_video => {
						if (!next_video) {
							return resolve({
								result: false,
								value: 'queue is empty'
							});
						}

						const dispatcher = spawn_dispatcher(next_video, voice_connection);
						dispatcher.once('finish', () => {
							if (!dispatcher.destroyed) {
								dispatcher.destroy();
							}
							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
								})
								.catch(console.log);
						});

						return resolve({
							result: true,
							value: 'playing queued song'
						});
					});
			}
		} else {
			if (guild_object.music_queue.length === 0) {
				return resolve({
					result: false,
					value: 'queue is empty'
				});
			}

			join_by_reaction(client, guild_object, user, false)
				.then(r => {
					if (r.result) {
						if (!r.voice_connection) {
							return resolve({
								result: false,
								value: 'could not join voice channel'
							});
						}

						const dispatcher = spawn_dispatcher(guild_object.music_queue[0], r.voice_connection);

						dispatcher.once('finish', () => {
							if (!dispatcher.destroyed) {
								dispatcher.destroy();
							}
							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
								})
								.catch(console.log);
						});

						return resolve({
							result: true,
							value: 'playing video from queue'
						});
					} else {
						return resolve({
							result: false,
							value: r.value
						});
					}
				})
				.catch(e => {
					return resolve({
						result: false,
						value: `could not to join voice channel (${e})`
					});
				});
		}
	});
};

export async function pause(
	voice_connection: VoiceConnection | undefined
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				if (!voice_connection.dispatcher.paused) {
					voice_connection.dispatcher.pause();
					return resolve({
						result: true,
						value: 'playback paused'
					});
				} else {
					return resolve({
						result: false,
						value: 'already paused'
					});
				}
			} else {
				return resolve({
					result: false,
					value: 'player is idle'
				});
			}
		} else {
			return resolve({
				result: false,
				value: 'Portal is not connected'
			});
		}
	});
};

export async function skip(
	voice_connection: VoiceConnection | undefined, user: User,
	client: Client, guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				if (voice_connection.dispatcher.paused) {
					setTimeout(() => {
						voice_connection.dispatcher.resume();
						setTimeout(() => {
							voice_connection.dispatcher.end();
						}, 0.5 * 1000);
					}, 0.5 * 1000);
					voice_connection.dispatcher.resume();
				} else {
					voice_connection.dispatcher.end();
				}

				return resolve({
					result: true,
					value: 'skipped to queued song'
				});
			} else {
				pop_music_queue(guild_object)
					.then(next_video => {
						if (!next_video) {
							return resolve({
								result: false,
								value: 'queue is empty'
							});
						}

						const dispatcher = spawn_dispatcher(next_video, voice_connection);
						dispatcher.once('finish', () => {
							if (!dispatcher.destroyed) {
								dispatcher.destroy();
							}
							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
								})
								.catch(console.log);
						});

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
						return resolve({
							result: false,
							value: 'queue is empty'
						});
					}

					join_by_reaction(client, guild_object, user, false)
						.then(r => {
							if (r.result) {
								if (!r.voice_connection) {
									return resolve({
										result: false,
										value: 'could not join voice channel'
									});
								}

								const dispatcher = spawn_dispatcher(next_video, r.voice_connection);

								dispatcher.once('finish', () => {
									if (!dispatcher.destroyed) {
										dispatcher.destroy();
									}
									skip(voice_connection, user, client, guild, guild_object)
										.then(r => {
											clear_music_vote(guild_object.id);
										})
										.catch(console.log);
								});

								return resolve({
									result: true,
									value: 'playing video from queue'
								});
							} else {
								return resolve({
									result: false,
									value: r.value
								});
							}
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `failed to join voice channel (${e})`
							});
						});
				});
		}
	});
};

export async function volume_up(
	voice_connection: VoiceConnection | undefined
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				voice_connection.dispatcher.setVolume(voice_connection.dispatcher.volume + 0.25);
				return resolve({
					result: true,
					value: `volume increased by 25% to ${voice_connection.dispatcher.volume * 100}%`
				});
			} else {
				return resolve({
					result: false,
					value: 'player is idle'
				});
			}
		} else {
			return resolve({
				result: false,
				value: 'Portal is not connected'
			});
		}
	});
};

export async function volume_down(
	voice_connection: VoiceConnection | undefined
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				if (voice_connection.dispatcher.volume !== 0) {
					voice_connection.dispatcher.setVolume(voice_connection.dispatcher.volume - 0.25);
					return resolve({
						result: true,
						value: `volume decreased by 25% to ${voice_connection.dispatcher.volume * 100}%`
					});
				} else {
					return resolve({
						result: false,
						value: 'volume is at 0%'
					});
				}
			} else {
				return resolve({
					result: false,
					value: 'player is idle'
				});
			}
		} else {
			return resolve({
				result: false,
				value: 'Portal is not connected'
			});
		}
	});
};