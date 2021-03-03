import { Client, Guild, TextChannel, VoiceChannel, VoiceConnection, VoiceState } from "discord.js";
import { create_voice_channel, generate_channel_name, included_in_portal_list, included_in_voice_list } from "../libraries/guildOps";
import { client_talk } from "../libraries/localisationOps";
import { fetch_guild, remove_voice } from "../libraries/mongoOps";
import { update_timestamp } from "../libraries/userOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

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
	voice_channel: VoiceChannel, portal_list: PortalChannelPrtl[], guild_object: GuildPrtl, guild: Guild, minutes: number
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
							value: `an error occured while deleting voice (${e})`
						});
					});
			}
		}
		else if (old_channel.members.size === 1) {
			if (client.voice) {
				const voice_connection = client.voice.connections
					.find((connection: VoiceConnection) =>
						connection.channel.id === old_channel.id);

				if (voice_connection) {
					// voice_connection.dispatcher.destroy();
					voice_connection.disconnect();

					if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
						delete_voice_channel(old_channel, guild_object)
							.then(response => {
								return resolve(response);
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `an error occured while deleting voice (${e})`
								})
							});
					} else {
						return resolve({
							result: true,
							value: 'portal left voice channel'
						})
					}
				}
			}
		}
	});
}

async function from_null(
	new_channel: VoiceChannel | null, guild_object: GuildPrtl, newState: VoiceState
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		// joined from null
		if (new_channel) {
			// joined portal channel
			if (included_in_portal_list(new_channel.id, guild_object.portal_list)) {
				const portal_object = guild_object.portal_list
					.find(p => p.id === new_channel.id);

				if (!portal_object) {
					return resolve({
						result: false,
						value: 'could not find portal'
					});
				}

				create_voice_channel(newState, portal_object, new_channel, newState.id)
					.then(response => {
						if (!response.result) {
							return resolve(response);
						}

						five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
						// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `an error occured while creating voice channel (${e})`
						});
					});

				update_timestamp(newState, guild_object); // points for voice
			}
			// joined voice channel
			else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) {
				five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
				// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
				update_timestamp(newState, guild_object); // points for voice
			}
			else { // joined other channel
				update_timestamp(newState, guild_object); // points for other
			}

			return resolve({
				result: true,
				value: 'null->existing\n'
			});
		} else {
			return resolve({
				result: false,
				value: 'should not be possible to move from null to null'
			});
		}
	});
}

async function from_existing(
	old_channel: VoiceChannel, new_channel: VoiceChannel | null, client: Client,
	guild_object: GuildPrtl, newState: VoiceState
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		let report_message = '';

		if (new_channel === null) {
			report_message += 'existing->null';

			channel_empty_check(old_channel, guild_object, client);
			update_timestamp(newState, guild_object); // points calculation from any channel
		}
		else if (new_channel !== null) { // Moved from channel to channel
			report_message += 'existing->existing\n';

			if (included_in_portal_list(old_channel.id, guild_object.portal_list)) {
				report_message += '->source: portal_list\n';

				if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // has been handled before

					update_timestamp(newState, guild_object); // points from voice creation

					report_message += '->dest: voice_list\n';
					report_message += 'has been handled before';
					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
					// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
				}
			}
			else if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
				report_message += '->source: voice_list\n';

				if (included_in_portal_list(new_channel.id, guild_object.portal_list)) { // moved from voice to portal
					report_message += '->dest: portal_list';

					channel_empty_check(old_channel, guild_object, client);

					const portal_object = guild_object.portal_list.find(p => p.id === new_channel.id);
					if (!portal_object) {
						return resolve({
							result: false,
							value: 'error with data'
						});
					}

					create_voice_channel(newState, portal_object, new_channel, newState.id)
						.then(response => {
							if (!response.result) {
								return resolve(response);
							}
							five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
							// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `an error occured while creating voice channel (${e})`
							});
						});
				}
				else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // moved from voice to voice
					report_message += '->dest: voice_list\n';

					channel_empty_check(old_channel, guild_object, client);
					update_timestamp(newState, guild_object); // points calculation from any channel
					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
					// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
				}
				else { // moved from voice to other
					report_message += '->dest: other\n';

					channel_empty_check(old_channel, guild_object, client);
					update_timestamp(newState, guild_object); // points calculation from any channel
					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
					// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
				}
			}
			else {
				report_message += '->source: other voice\n';

				// Joined portal channel
				if (included_in_portal_list(new_channel.id, guild_object.portal_list)) {
					report_message += '->dest: portal_list';
					const portal_object = guild_object.portal_list.find(p => p.id === new_channel.id);
					if (!portal_object) return { result: false, value: 'error with data' };

					create_voice_channel(newState, portal_object, new_channel, newState.id)
						.then(response => {
							if (!response.result) {
								return resolve(response);
							}
							five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
							// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `an error occured while creating voice channel (${e})`
							});
						});
				}
				else if (included_in_voice_list(
					new_channel.id, guild_object.portal_list)) { // left created channel and joins another created
					report_message += '->dest: voice_list\n';

					five_min_refresher(new_channel, guild_object.portal_list, guild_object, newState.guild, 5);
					// generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
				}
			}
		}

		return { result: true, value: report_message };
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
						console.log('!!new_channel :>> ', !!new_channel);
						console.log('args.newState.member?.user.bot :>> ', args.newState.member?.user.bot);
						if (!!new_channel && args.newState.member?.user.bot) {
							const found = guild_object.portal_list.find(p => {
								if (p.id === new_channel.id) {
									console.log(`in portal channel`);
									if (p.no_bots) {
										console.log(`no bots allowed`);
										args.newState.connection?.disconnect();
										return true;
									}
								}

								return p.voice_list.find(v => {
									if (v.id === new_channel.id) {
										console.log(`in portal channel`);
										if (v.no_bots) {
											console.log(`no bots allowed`);
											args.newState.connection?.disconnect();
											return true;
										}
									}
								});
							});

							console.log('found :>> ', found);
							if (found) {
								return resolve({
									result: false,
									value: `no bots are allowed`
								});
							}
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
										value: `an error occured while handling user (${e})`
									});
								})
						}
						else {
							from_existing(old_channel, new_channel, args.client, guild_object, args.newState)
								.then(r => {
									return resolve(r);
								})
								.catch(e => {
									return resolve({
										result: false,
										value: `an error occured while handling user (${e})`
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
