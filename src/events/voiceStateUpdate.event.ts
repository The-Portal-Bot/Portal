import { Client, Guild, TextChannel, VoiceChannel, VoiceConnection, VoiceState } from "discord.js";
import { create_voice_channel, generate_channel_name, included_in_portal_list, included_in_voice_list } from "../libraries/guild.library";
import { update_music_lyrics_message, update_music_message } from "../libraries/help.library";
import { client_talk } from "../libraries/localisation.library";
import { fetch_guild, remove_voice, set_music_data, update_guild } from "../libraries/mongo.library";
import { update_timestamp } from "../libraries/user.library";
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl.class";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

// delete portal's voice channel
async function delete_voice_channel(
	channel: VoiceChannel | TextChannel, guild_object: GuildPrtl
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!channel.deletable) {
			return resolve({
				result: false,
				value: `channel ${channel.name} (${channel.id}) is not deletable`
			});
		} else {
			guild_object.portal_list.some(p =>
				p.voice_list.some(v => {
					if (v.id === channel.id) {
						channel
							.delete()
							.then(r => {
								remove_voice(guild_object.id, p.id, v.id)
									.then(r => {
										return resolve({
											result: r,
											value: `channel ${channel.name} (${channel.id}) ${r ? '' : 'failed to be'} deleted`
										});
									})
									.catch(e => {
										return resolve({
											result: false,
											value: `channel ${channel.name} (${channel.id}) failed to be delete`
										});
									});
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `channel ${channel.name} (${channel.id}) failed to be delete`
								});
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
	guild_object: GuildPrtl, guild: Guild, minutes: number
): void {
	fetch_guild(guild.id)
		.then(guild_object => {
			if (guild_object) {
				generate_channel_name(voice_channel, portal_list, guild_object, guild);
				setTimeout(() => {
					if (!guild.deleted && !voice_channel.deleted) {
						generate_channel_name(voice_channel, portal_list, guild_object, guild);
						five_min_refresher(voice_channel, portal_list, guild_object, guild, minutes);
					}
				}, minutes * 60 * 1000);
			}
		})
		.catch(() => {
			return;
		});
};

async function channel_empty_check(
	old_channel: VoiceChannel | TextChannel, guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (old_channel.members.size === 0) {
			if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
				delete_voice_channel(old_channel, guild_object)
					.then(response => {
						return resolve(response);
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `an error occurred while deleting voice / ${e}`
						});
					});
			} else {
				return resolve({
					result: false,
					value: `channel is not handled by Portal`
				});
			}
		}
		else if (old_channel.members.size === 1) {
			if (client.voice) {
				const voice_connection = client.voice.connections
					.find((connection: VoiceConnection) =>
						connection.channel.id === old_channel.id);

				if (voice_connection) {
					guild_object.music_queue = [];
					update_guild(guild_object.id, 'music_queue', guild_object.music_queue);
					voice_connection.disconnect();

					if (guild_object.music_data.pinned) {
						guild_object.music_data.pinned = false;
						set_music_data(guild_object.id, guild_object.music_data);
					}

					update_music_message(
						old_channel.guild,
						guild_object,
						guild_object.music_queue.length > 0
							? guild_object.music_queue[0]
							: undefined,
						'left last',
						false
					);

					update_music_lyrics_message(old_channel.guild, guild_object, '');

					if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
						delete_voice_channel(old_channel, guild_object)
							.then(response => {
								return resolve(response);
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `an error occurred while deleting voice / ${e}`
								})
							});
					} else {
						return resolve({
							result: true,
							value: 'Portal left voice channel'
						})
					}
				} else {
					return resolve({
						result: false,
						value: `Portal is not connected`
					});
				}
			} else {
				return resolve({
					result: false,
					value: `Portal is not connected`
				});
			}
		}
	});
}

async function from_null(
	new_channel: VoiceChannel | null, guild_object: GuildPrtl, newState: VoiceState
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (new_channel) { // joined from null
			if (included_in_portal_list(new_channel.id, guild_object.portal_list)) { // joined portal channel
				const portal_object = guild_object.portal_list
					.find(p => p.id === new_channel.id);

				if (!portal_object) {
					return resolve({
						result: false,
						value: 'null->existing (source: null / dest: portal_list) / could not find portal_object'
					});
				}

				update_timestamp(newState, guild_object); // points for voice

				create_voice_channel(newState, portal_object, new_channel, newState.id)
					.then(response => {
						if (!response.result) {
							return resolve(response);
						}

						five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);

						return resolve({
							result: true,
							value: 'null->existing (source: null / dest: portal_list)'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `null->existing (source: null / dest: portal_list) / ${e}`
						});
					});
			}
			else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // joined voice channel
				five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
				update_timestamp(newState, guild_object); // points for voice

				return resolve({
					result: true,
					value: 'null->existing (source: null / dest: voice_list)'
				});
			}
			else { // joined other channel
				update_timestamp(newState, guild_object); // points for other

				return resolve({
					result: true,
					value: 'null->existing (source: null / dest: other channel)'
				});
			}
		} else {
			return resolve({
				result: false,
				value: 'strange, from null to null'
			});
		}
	});
}

async function from_existing(
	old_channel: VoiceChannel, new_channel: VoiceChannel | null, client: Client,
	guild_object: GuildPrtl, newState: VoiceState
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (new_channel === null) {
			channel_empty_check(old_channel, guild_object, client);
			update_timestamp(newState, guild_object);

			return resolve({
				result: false,
				value: 'existing->null'
			});
		}
		else if (new_channel !== null) { // Moved from channel to channel
			if (included_in_portal_list(old_channel.id, guild_object.portal_list)) {
				if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // has been handled before
					update_timestamp(newState, guild_object); // points from voice creation
					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);

					return resolve({
						result: true,
						value: 'existing->existing (source: portal_list / dest: voice_list) / has been handled before'
					});
				} else {
					return resolve({
						result: true,
						value: 'not handled by portal'
					});
				}
			}
			else if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {

				channel_empty_check(old_channel, guild_object, client);

				if (included_in_portal_list(new_channel.id, guild_object.portal_list)) { // moved from voice to portal
					const portal_object = guild_object.portal_list
						.find(p => p.id === new_channel.id);

					if (!portal_object) {
						return resolve({
							result: false,
							value: 'could not find Portal in database'
						});
					}

					create_voice_channel(newState, portal_object, new_channel, newState.id)
						.then(response => {
							if (!response.result) {
								return resolve(response);
							}

							five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);

							return resolve({
								result: true,
								value: 'existing->existing (source: voice_list / dest: portal_list) has been handled before'
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `an error occurred while creating voice channel / ${e}`
							});
						});
				}
				else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // moved from voice to voice
					update_timestamp(newState, guild_object); // points calculation from any channel
					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);

					return resolve({
						result: true,
						value: 'existing->existing (source: voice_list / dest: voice_list)'
					});
				}
				else { // moved from voice to other
					update_timestamp(newState, guild_object); // points calculation from any channel
					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);

					return resolve({
						result: true,
						value: 'existing->existing (source: voice_list / dest: other)'
					});
				}
			}
			else {
				// Joined portal channel
				if (included_in_portal_list(new_channel.id, guild_object.portal_list)) {
					const portal_object = guild_object.portal_list
						.find(p => p.id === new_channel.id);

					if (!portal_object) {
						return resolve({
							result: false,
							value: 'existing->existing (source: other voice / dest: portal_list) / could not find portal in DB, contact Portal support'
						});
					}

					create_voice_channel(newState, portal_object, new_channel, newState.id)
						.then(response => {
							if (!response.result) {
								return resolve(response);
							}

							five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);

							return resolve({
								result: true,
								value: 'existing->existing (source: other voice / dest: portal_list)'
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `existing->existing (source: other voice / dest: portal_list ) / ${e}`
							});
						});
				}
				else if (included_in_voice_list(
					new_channel.id, guild_object.portal_list)) { // left created channel and joins another created

					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);

					return resolve({
						result: true,
						value: 'existing->existing (source: other voice / dest: voice_list)'
					});
				}
			}
		}
	});
}

module.exports = async (
	args: { client: Client, newState: VoiceState, oldState: VoiceState }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
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
										args.newState.kick();

										return resolve({
											result: false,
											value: `no bots are allowed`
										});
									}
								}

								p.voice_list.some(v => {
									if (v.id === new_channel.id) {
										if (v.no_bots) {
											args.newState.kick();

											return resolve({
												result: false,
												value: `no bots are allowed`
											});
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
									return resolve({
										result: false,
										value: `${e}`
									});
								})
						} else {
							from_existing(old_channel, new_channel, args.client, guild_object, args.newState)
								.then(r => {
									return resolve(r);
								})
								.catch(e => {
									return resolve({
										result: false,
										value: `${e}`
									});
								});
						}
					} else {
						return resolve({
							result: false,
							value: 'could not find guild in Portal'
						});
					}
				})
				.catch(error => {
					return resolve({
						result: false,
						value: 'could not find guild in Portal (' + error + ')'
					});
				});
		} else {
			return resolve({
				result: false,
				value: 'could fnot find guild in Portal'
			});
		}
	});
};
