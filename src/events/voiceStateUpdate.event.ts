import { Client, Guild, TextChannel, VoiceChannel, VoiceConnection, VoiceState } from "discord.js";
import { create_voice_channel, generate_channel_name, included_in_portal_list, included_in_voice_list } from "../libraries/guild.library";
import { update_music_lyrics_message, update_music_message } from "../libraries/help.library";
import { client_talk } from "../libraries/localisation.library";
import { fetch_guild, remove_voice, set_music_data, update_guild } from "../libraries/mongo.library";
import { update_timestamp } from "../libraries/user.library";
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl.class";

// delete portal's voice channel
async function delete_voice_channel(
	channel: VoiceChannel | TextChannel, guild_object: GuildPrtl
): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!channel.deletable) {
			return reject(`channel ${channel.name} (${channel.id}) is not deletable`);
		} else {
			guild_object.portal_list.some(p =>
				p.voice_list.some(v => {
					if (v.id === channel.id) {
						channel
							.delete()
							.then(deleted_channel => {
								remove_voice(guild_object.id, p.id, v.id)
									.then(r => {
										if (r) {
											return resolve(`channel (${deleted_channel.id}) deleted`);
										} else {
											return reject(`channel (${deleted_channel.id}) failed to be deleted`);
										}
									})
									.catch(e => {
										return reject(`channel (${deleted_channel.id}) failed to be delete / ${e}`);
									});
							})
							.catch(e => {
								return reject(`channel ${channel.name} (${channel.id}) failed to be delete / ${e}`);
							});

						return true;
					}

					return false;
				})
			);
		}
	});
}

function five_min_refresher(
	voice_channel: VoiceChannel, portal_list: PortalChannelPrtl[],
	guild: Guild, minutes: number
): void {
	fetch_guild(guild.id)
		.then(guild_object => {
			if (guild_object) {
				generate_channel_name(voice_channel, portal_list, guild_object, guild)
					.catch(console.error);
				setTimeout(() => {
					if (!guild.deleted && !voice_channel.deleted) {
						generate_channel_name(voice_channel, portal_list, guild_object, guild)
							.catch(console.error);
						five_min_refresher(voice_channel, portal_list, guild, minutes);
					}
				}, minutes * 60 * 1000);
			}
		})
		.catch(console.error);
}

async function channel_empty_check(
	old_channel: VoiceChannel | TextChannel, guild_object: GuildPrtl, client: Client
): Promise<string> {
	return new Promise((resolve, reject) => {
		if (old_channel.members.size === 0) {
			if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
				delete_voice_channel(old_channel, guild_object)
					.then(response => {
						return resolve(response);
					})
					.catch(e => {
						return reject(`an error occurred while deleting voice / ${e}`);
					});
			} else {
				return reject(`channel is not handled by Portal`);
			}
		}
		else if (old_channel.members.size === 1) {
			if (client.voice) {
				const voice_connection = client.voice.connections
					.find((connection: VoiceConnection) =>
						connection.channel.id === old_channel.id);

				if (voice_connection) {
					guild_object.music_queue = [];
					update_guild(guild_object.id, 'music_queue', guild_object.music_queue)
						.catch(e => {
							return reject(`failed to update guild / ${e}`);
						});
					voice_connection.disconnect();

					if (guild_object.music_data.pinned) {
						guild_object.music_data.pinned = false;
						set_music_data(guild_object.id, guild_object.music_data)
							.catch(e => {
								return reject(`failed to set music data / ${e}`);
							});
					}

					update_music_message(
						old_channel.guild,
						guild_object,
						guild_object.music_queue.length > 0
							? guild_object.music_queue[0]
							: undefined,
						'left last',
						false
					)
						.catch(e => {
							return reject(`failed to update music message / ${e}`);
						});

					update_music_lyrics_message(old_channel.guild, guild_object, '')
						.catch(e => {
							return reject(`failed to update music lyrics / ${e}`);
						});

					if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
						delete_voice_channel(old_channel, guild_object)
							.then(response => {
								return resolve(response);
							})
							.catch(e => {
								return reject(`an error occurred while deleting voice / ${e}`)
							});
					} else {
						return resolve('Portal left voice channel');
					}
				} else {
					return resolve(`Portal is not connected`);
				}
			} else {
				return resolve(`Portal is not connected`);
			}
		}
	});
}

async function from_null(
	new_channel: VoiceChannel | null, guild_object: GuildPrtl, newState: VoiceState
): Promise<string> {
	return new Promise((resolve, reject) => {
		if (new_channel) { // joined from null
			if (included_in_portal_list(new_channel.id, guild_object.portal_list)) { // joined portal channel
				const portal_object = guild_object.portal_list
					.find(p => p.id === new_channel.id);

				if (!portal_object) {
					return reject('null->existing (source: null / dest: portal_list) / could not find portal_object');
				}

				update_timestamp(newState, guild_object); // points for voice

				create_voice_channel(newState, portal_object)
					.then(() => {
						return resolve('null->existing (source: null / dest: portal_list)');
					})
					.catch(e => {
						return reject(`null->existing (source: null / dest: portal_list) / ${e}`);
					});
			}
			else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // joined voice channel
				five_min_refresher(new_channel, guild_object.portal_list, newState.guild, 5);
				update_timestamp(newState, guild_object); // points for voice


				return resolve('null->existing (source: null / dest: voice_list)');
			}
			else { // joined other channel
				update_timestamp(newState, guild_object); // points for other


				return resolve('null->existing (source: null / dest: other channel)');
			}
		} else {
			return reject('strange, from null to null');
		}
	});
}

async function from_existing(
	old_channel: VoiceChannel, new_channel: VoiceChannel | null, client: Client,
	guild_object: GuildPrtl, newState: VoiceState
): Promise<string> {
	return new Promise((resolve, reject) => {
		if (new_channel === null) {
			update_timestamp(newState, guild_object);
			channel_empty_check(old_channel, guild_object, client)
				.catch(e => {
					return resolve(`failed to check channel state / ${e}`);
				});

			return resolve('existing->null');
		}
		else if (new_channel !== null) { // Moved from channel to channel
			if (included_in_portal_list(old_channel.id, guild_object.portal_list)) {
				if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // has been handled before
					update_timestamp(newState, guild_object); // points from voice creation
					five_min_refresher(new_channel, guild_object.portal_list, newState.guild, 5);

					return resolve('existing->existing (source: portal_list / dest: voice_list) / has been handled before');
				} else {
					return resolve('not handled by portal');
				}
			}
			else if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
				channel_empty_check(old_channel, guild_object, client)
					.catch(e => {
						return resolve(`failed to check channel state / ${e}`);
					});

				if (included_in_portal_list(new_channel.id, guild_object.portal_list)) { // moved from voice to portal
					const portal_object = guild_object.portal_list
						.find(p => p.id === new_channel.id);

					if (!portal_object) {
						return reject('could not find Portal in database');
					}

					create_voice_channel(newState, portal_object)
						.then(() => {
							return resolve('existing->existing (source: voice_list / dest: portal_list) has been handled before');
						})
						.catch(e => {
							return reject(`an error occurred while creating voice channel / ${e}`);
						});
				}
				else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // moved from voice to voice
					update_timestamp(newState, guild_object); // points calculation from any channel
					five_min_refresher(new_channel, guild_object.portal_list, newState.guild, 5);

					return resolve('existing->existing (source: voice_list / dest: voice_list)');
				}
				else { // moved from voice to other
					update_timestamp(newState, guild_object); // points calculation from any channel
					five_min_refresher(new_channel, guild_object.portal_list, newState.guild, 5);

					return resolve('existing->existing (source: voice_list / dest: other)');
				}
			}
			else {
				// Joined portal channel
				if (included_in_portal_list(new_channel.id, guild_object.portal_list)) {
					const portal_object = guild_object.portal_list
						.find(p => p.id === new_channel.id);

					if (!portal_object) {
						return reject('existing->existing (source: other voice / dest: portal_list) / could not find portal in DB, contact Portal support');
					}

					create_voice_channel(newState, portal_object)
						.then(() => {
							return resolve('existing->existing (source: other voice / dest: portal_list)');
						})
						.catch(e => {
							return reject(`existing->existing (source: other voice / dest: portal_list ) / ${e}`);
						});
				}
				else if (included_in_voice_list(
					new_channel.id, guild_object.portal_list)) { // left created channel and joins another created

					five_min_refresher(new_channel, guild_object.portal_list, newState.guild, 5);

					return resolve('existing->existing (source: other voice / dest: voice_list)');
				}
			}
		}
	});
}

module.exports = async (
	args: { client: Client, newState: VoiceState, oldState: VoiceState }
): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (args.newState?.guild) {
			const new_channel = args.newState.channel; // join channel
			const old_channel = args.oldState.channel; // left channel

			fetch_guild(args.newState?.guild.id)
				.then(guild_object => {
					if (guild_object) {
						if (!!new_channel && args.newState.member?.user.bot) {
							guild_object.portal_list.find(p => {
								if (p.id === new_channel.id) {
									if (p.no_bots) {
										args.newState
											.kick()
											.catch(e => {
												return reject(`failed to kick / ${e}`);
											});

										return reject(`no bots are allowed`);
									}
								}

								p.voice_list.some(v => {
									if (v.id === new_channel.id) {
										if (v.no_bots) {
											args.newState
												.kick()
												.catch(e => {
													return reject(`failed to kick / ${e}`);
												});

											return reject(`no bots are allowed`);
										}
									}
								});
							});
						}

						if (args.client.voice && args.newState.member) {
							const new_voice_connection = args.client.voice.connections
								.find((connection: VoiceConnection) =>
									!!new_channel && connection.channel.id === new_channel.id);

							if (new_voice_connection && !args.newState.member.user.bot) {
								client_talk(args.client, guild_object, 'user_connected');
							}

							const old_voice_connection = args.client.voice.connections
								.find((connection: VoiceConnection) =>
									!!old_channel && connection.channel.id === old_channel.id);

							if (old_voice_connection && !args.newState.member.user.bot) {
								client_talk(args.client, guild_object, 'user_disconnected');
							}
						}

						if (!old_channel) {
							from_null(new_channel, guild_object, args.newState)
								.then(r => {
									return resolve(r);
								})
								.catch(e => {
									return reject(e);
								})
						} else {
							from_existing(old_channel, new_channel, args.client, guild_object, args.newState)
								.then(r => {
									return resolve(r);
								})
								.catch(e => {
									return reject(e);
								});
						}
					} else {
						return reject('could not find guild in Portal');
					}
				})
				.catch(e => {
					return reject(`could not find guild in Portal (${e})`);
				});
		} else {
			return reject('could fnot find guild in Portal');
		}
	});
}
