import ytdl from 'discord-ytdl-core';
import { Client, Guild, Message, StreamDispatcher, StreamOptions, User, VoiceConnection } from "discord.js";
import { RequestOptions } from 'https';
import yts, { Duration, PlaylistMetadataResult, SearchResult, VideoMetadataResult, VideoSearchResult } from 'yt-search';
import config from '../config.json';
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";
import { get_json, is_url, join_by_reaction, join_user_voice, logger, update_music_lyrics_message, update_music_message } from './help.library';
import { https_fetch, scrape_lyrics } from './http.library';
import { clear_music_vote, fetch_guild_music_queue, insert_music_video, update_guild } from './mongo.library';
// const ytdl = require('ytdl-core');

async function pop_music_queue(
	guild_object: GuildPrtl
): Promise<yts.VideoSearchResult | undefined> {
	return new Promise((resolve) => {
		fetch_guild_music_queue(guild_object.id)
			.then(music => {
				if (!music) {
					return resolve(undefined);
				}

				if (!music.data.pinned && music.queue.length > 0) {
					music.queue.shift();
					update_guild(guild_object.id, 'music_queue', music.queue);
				}

				guild_object.music_queue = music.queue;
				guild_object.music_data = music.data;

				return resolve(music.queue.length > 0 ? music.queue[0] : undefined);
			})
			.catch(() => {
				return resolve(undefined);
			});
	})
}

function delete_dispatcher(
	dispatcher: StreamDispatcher
): boolean {
	if (!dispatcher.destroyed) {
		dispatcher.destroy();

		return true;
	}

	return false;
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
		volume: false
		// bitrate: not added as dispatcher does not auto destroy
	}

	return voice_connection.play(stream, stream_options);;
}

async function push_video_to_queue(
	guild_object: GuildPrtl, video: VideoSearchResult
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
	voice_connection: VoiceConnection | undefined, client: Client, user: User, message: Message,
	guild: Guild, guild_object: GuildPrtl, video: VideoSearchResult
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
							delete_dispatcher(dispatcher);

							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
									update_music_message(
										guild,
										guild_object,
										guild_object.music_queue.length > 0
											? guild_object.music_queue[0]
											: undefined,
										r.value,
										r.result
									);
								})
								.catch(e => {
									logger.log({ level: 'error', type: 'none', message: `failed to skip video / ${e}` });
								});
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
					join_user_voice(client, message, guild_object, false)
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
									delete_dispatcher(dispatcher);

									skip(r.voice_connection, user, client, guild, guild_object)
										.then(r => {
											clear_music_vote(guild_object.id);
											update_music_message(
												guild,
												guild_object,
												guild_object.music_queue.length > 0
													? guild_object.music_queue[0]
													: undefined,
												r.value,
												r.result
											);
										})
										.catch(e => {
											logger.log({ level: 'error', type: 'none', message: `failed to skip video / ${e}` });
										});
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
								value: `error while joining channel / ${e}`
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
	voice_connection: VoiceConnection | undefined, client: Client, user: User, message: Message,
	guild: Guild, guild_object: GuildPrtl, search_term: string
): Promise<ReturnPormise> {
	return new Promise(resolve => {
		if (is_url(search_term)) {
			const plist_index = search_term.indexOf('list=');
			const pindx_index = search_term.indexOf('index=');
			const video_index = search_term.indexOf('?v=');

			if (plist_index > 0) {
				const listId = search_term.substr(plist_index + 5, 34);
				const index_str = pindx_index > 0
					? search_term.substr(pindx_index + 6)
					: '0';
				const index = isNaN(+index_str)
					? 0
					: +index_str;

				yts({ listId: listId })
					.then((yts_attempt: PlaylistMetadataResult) => {
						if (yts_attempt.videos.length <= 0) {
							return resolve({
								result: false,
								value: `could not find the playlist on youtube`
							});
						}

						const yt_url = 'https://www.youtube.com/watch';
						const initial_video = yts_attempt.videos[index];

						update_music_lyrics_message(guild, guild_object, '');

						start_playback(
							voice_connection, client, user, message,
							guild, guild_object, <VideoSearchResult>{
								type: 'video',
								videoId: initial_video.videoId,
								url: `${yt_url}` +
									`?v=${initial_video.videoId}` +
									`&list=${yts_attempt.listId}` +
									`&index=${index ? index : 1}`,
								title: initial_video.title,
								description: '',
								image: '',
								thumbnail: initial_video.thumbnail,
								seconds: 0,
								timestamp: '',
								duration: <Duration>{
									seconds: 0,
									timestamp: '-'
								},
								ago: '',
								views: 0,
								author: initial_video.author,
							}
						)
							.then(r => {
								yts_attempt.videos.forEach((v, i) => {
									if (i > 0 && i > +index)
										push_video_to_queue(guild_object, <VideoSearchResult>{
											type: 'video',
											videoId: v.videoId,
											url: `${yt_url}` +
												`?v=${v.videoId}` +
												`&list=${yts_attempt.listId}` +
												`&index=${i + 1}`,
											title: v.title,
											description: '',
											image: '',
											thumbnail: v.thumbnail,
											seconds: 0,
											timestamp: '',
											duration: (<any>v).duration,
											ago: '',
											views: 0,
											author: v.author,
										})
								});

								return resolve(
									r
								);
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `error while starting music player / ${e}`
								});
							});

					})
					.catch(e => {
						return resolve({
							result: false,
							value: `error while searching youtube playlist / ${e}`
						});
					});
			} else if (video_index > 0) {
				const videoId = search_term.substr(video_index + 3, 11);

				yts({ videoId: videoId })
					.then((yts_attempt: VideoMetadataResult) => {
						start_playback(
							voice_connection, client, user, message,
							guild, guild_object, <VideoSearchResult>{
								type: 'video',
								videoId: yts_attempt.videoId,
								url: yts_attempt.url,
								title: yts_attempt.title,
								description: yts_attempt.description,
								image: yts_attempt.image,
								thumbnail: yts_attempt.thumbnail,
								seconds: yts_attempt.seconds,
								timestamp: yts_attempt.timestamp,
								duration: yts_attempt.duration,
								ago: yts_attempt.ago,
								views: yts_attempt.views,
								author: yts_attempt.author
							}
						)
							.then(r => {
								return resolve(
									r
								);
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `error while starting music player / ${e}`
								});
							});

					})
					.catch(e => {
						return resolve({
							result: false,
							value: `error while searching youtube video / ${e}`
						});
					});
			} else {
				return resolve({
					result: false,
					value: `the url is not of a youtube video or playlist`
				});
			}
		} else {
			yts(search_term)
				.then((yts_attempt: SearchResult) => {
					if (yts_attempt.videos.length <= 0) {
						return resolve({
							result: false,
							value: `could not find something matching ${search_term}, on youtube`
						});
					}

					start_playback(
						voice_connection, client, user, message,
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
								value: `error while starting music player / ${e}`
							});
						});
				})
				.catch(e => {
					return resolve({
						result: false,
						value: `error while searching youtube / ${e}`
					});
				});
		}
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
							delete_dispatcher(dispatcher);

							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
									update_music_message(
										guild,
										guild_object,
										guild_object.music_queue.length > 0
											? guild_object.music_queue[0]
											: undefined,
										r.value,
										r.result
									);
								})
								.catch(e => {
									logger.log({ level: 'error', type: 'none', message: `failed to skip video / ${e}` });
								});
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
							delete_dispatcher(dispatcher);

							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
									update_music_message(
										guild,
										guild_object,
										guild_object.music_queue.length > 0
											? guild_object.music_queue[0]
											: undefined,
										r.value,
										r.result
									);
								})
								.catch(e => {
									logger.log({ level: 'error', type: 'none', message: `failed to skip video / ${e}` });
								});
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
						value: `could not to join voice channel / ${e}`
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
	voice_connection: VoiceConnection | undefined, user: User, client: Client,
	guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (voice_connection) {
			if (voice_connection.dispatcher) {
				if (voice_connection.dispatcher.paused) {
					setTimeout(() => {
						voice_connection.dispatcher.resume();
						setTimeout(() => {
							voice_connection.dispatcher.end();
						}, 0.2 * 1000);
					}, 0.2 * 1000);
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
						update_music_lyrics_message(guild, guild_object, '');

						if (!next_video) {
							return resolve({
								result: false,
								value: 'queue is empty'
							});
						}

						const dispatcher = spawn_dispatcher(next_video, voice_connection);

						dispatcher.once('finish', () => {
							delete_dispatcher(dispatcher);

							skip(voice_connection, user, client, guild, guild_object)
								.then(r => {
									clear_music_vote(guild_object.id);
									update_music_message(
										guild,
										guild_object,
										guild_object.music_queue.length > 0
											? guild_object.music_queue[0]
											: undefined,
										r.value,
										r.result
									);
								})
								.catch(e => {
									logger.log({ level: 'error', type: 'none', message: `failed to skip video / ${e}` });
								});
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
									delete_dispatcher(dispatcher);

									skip(voice_connection, user, client, guild, guild_object)
										.then(r => {
											clear_music_vote(guild_object.id);
											update_music_message(
												guild,
												guild_object,
												guild_object.music_queue.length > 0
													? guild_object.music_queue[0]
													: undefined,
												r.value,
												r.result
											);
										})
										.catch(e => {
											logger.log({ level: 'error', type: 'none', message: `failed to skip video / ${e}` });
										});
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
								value: `failed to join voice channel / ${e}`
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

export async function get_lyrics(
	guild: Guild, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (guild_object.music_queue.length > 0) {
			const uselessWordsArray = ["official", "music", "video", "ft."];
			const expStr = uselessWordsArray.join("|");

			const search_term_init = guild_object.music_queue[0].title
				.replace(new RegExp('\\b(' + expStr + ')\\b', 'gi'), ' ')
				.replace(/\s{2,}/g, ' ');
			const search_term_without = search_term_init
				.replace(/[&\/\\#,+()$~%.'"-:*?<>{}]/g, '')
			const search_term = search_term_without
				.split(' ')
				.filter((s, i) => i < 6)
				.filter(s => !null && s !== '')
				.join('%20');

			const options: RequestOptions = {
				'method': 'GET',
				"hostname": "genius.p.rapidapi.com",
				'port': undefined,
				"path": `/search?q=${search_term}`,
				'headers': {
					"x-rapidapi-host": "genius.p.rapidapi.com",
					'x-rapidapi-key': config.api_keys.lyrics,
					'useQueryString': 1
				},
			};

			https_fetch(options)
				.then((response: Buffer) => {
					const json = get_json(response.toString().substring(response.toString().indexOf('{')));

					if (!json) {
						return resolve({
							result: false,
							value: 'data from source was corrupted'
						});
					}

					if (json.meta.status !== 200) {
						return resolve({
							result: false,
							value: 'could not fetch lyrics'
						});
					}

					if (json.response.hits.length === 0 || json.response.hits[0].type !== 'song') {
						return resolve({
							result: false,
							value: 'could not find song'
						});
					}

					scrape_lyrics(`https://genius.com${json.response.hits[0].result.path}`)
						.then((text: string) => {
							update_music_lyrics_message(guild, guild_object, text, `https://genius.com${json.response.hits[0].result.path}`)
								.then(r => {
									return resolve({
										result: true,
										value: `displayed lyrics`
									});
								})
								.catch((e: any) => {
									logger.log({ level: 'error', type: 'none', message: `failed to update lyrics message / ${e}` });
									return resolve({
										result: false,
										value: `failed to update lyrics message / ${e}`
									});
								});
						})
						.catch((e: any) => {
							logger.log({ level: 'error', type: 'none', message: `failed to scrap genius page / ${e}` });
							return resolve({
								result: false,
								value: `failed to scrap genius page / ${e}`
							});
						});
				})
				.catch((e: any) => {
					return resolve({
						result: false,
						value: `could not access the server / ${e}`
					});
				});
		} else {
			update_music_lyrics_message(guild, guild_object, '');

			return resolve({
				result: false,
				value: 'no song in queue'
			});
		}
	});
};