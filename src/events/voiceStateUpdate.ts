import { Client, TextChannel, VoiceChannel, VoiceConnection, VoiceState } from "discord.js";
import { create_voice_channel, generate_channel_name, included_in_portal_list, included_in_voice_list } from "../libraries/guildOps";
import { client_talk } from "../libraries/localisationOps";
import { fetch_guild, remove_voice } from "../libraries/mongoOps";
import { stop } from "../libraries/musicOps";
import { update_timestamp } from "../libraries/userOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
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

function from_null(
	new_channel: VoiceChannel | null, guild_object: GuildPrtl, newState: VoiceState
): ReturnPormise {
	// joined from null
	if (new_channel) {
		// joined portal channel
		if (included_in_portal_list(new_channel.id, guild_object.portal_list)) {
			const portal_object = guild_object.portal_list.find(p => p.id === new_channel.id);
			if (!portal_object) return { result: false, value: 'error with data' };

			create_voice_channel(newState, portal_object, new_channel, newState.id)
				.then(response => {
					if (!response.result) return response;
					generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
				})
				.catch(error => { console.log('error :>> ', error); return { result: false, value: error }; });
		}
		// joined voice channel
		else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) {
			generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
			update_timestamp(newState, guild_object); // points for voice
		}
		else { // joined other channel
			update_timestamp(newState, guild_object); // points for other
		}

		return { result: true, value: 'null->existing\n' };
	} else {
		return { result: false, value: 'should not be possible to move from null to null' };
	}
}

function from_existing(
	old_channel: VoiceChannel, new_channel: VoiceChannel | null, client: Client,
	guild_object: GuildPrtl, newState: VoiceState
): ReturnPormise {
	let report_message = '';

	if (new_channel === null) {
		report_message += 'existing->null';

		// user left voice channel
		if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {
			if (old_channel.members.size === 0)
				delete_voice_channel(old_channel, guild_object)
					.then(response => { return response; });

			if (client.voice) {
				const voice_connection = client.voice.connections
					.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

				if (voice_connection) {
					if (old_channel.members.size === 1) {
						voice_connection.disconnect();
						delete_voice_channel(old_channel, guild_object)
							.then(response => { return response; });
						stop(guild_object, old_channel.guild);
					}
				}
			}
		}
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
				generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
			}
		}
		else if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {

			report_message += '->source: voice_list\n';

			if (included_in_portal_list(new_channel.id, guild_object.portal_list)) { // moved from voice to portal

				report_message += '->dest: portal_list';

				if (old_channel.members.size === 0) {
					delete_voice_channel(old_channel, guild_object)
						.then(response => { return response; });
				}

				if (client.voice) {
					const voice_connection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

					if (voice_connection) {
						if (old_channel.members.size === 1) {
							voice_connection.disconnect();
							delete_voice_channel(old_channel, guild_object)
								.then(response => { return response; });
							stop(guild_object, old_channel.guild);
						}
					}
				}

				const portal_object = guild_object.portal_list.find(p => p.id === new_channel.id);
				if (!portal_object) return { result: false, value: 'error with data' };

				create_voice_channel(newState, portal_object, new_channel, newState.id)
					.then(response => {
						if (!response.result) return response;
						generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
					})
					.catch(error => { return { result: false, value: error }; });
			}
			else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // moved from voice to voice

				report_message += '->dest: voice_list\n';

				if (old_channel.members.size === 0) {
					delete_voice_channel(old_channel, guild_object)
						.then(response => { return response; });
				}
				if (client.voice) {
					const voiceConnection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

					if (voiceConnection) {
						if (old_channel.members.size === 1) {
							voiceConnection.disconnect();
							delete_voice_channel(old_channel, guild_object)
								.then(response => { return response; });
							stop(guild_object, old_channel.guild);
						}
					}
				}

				generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
			}
			else { // moved from voice to other

				report_message += '->dest: other\n';

				if (old_channel.members.size === 0) {
					delete_voice_channel(old_channel, guild_object)
						.then(response => { return response; });
				}

				if (client.voice) {
					const voiceConnection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

					if (voiceConnection) {
						if (old_channel.members.size === 1) {
							voiceConnection.disconnect();
							delete_voice_channel(old_channel, guild_object)
								.then(response => { return response; });
							stop(guild_object, old_channel.guild);
						}
					}
				}

				generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
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
						if (!response.result) return response;
						generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
					})
					.catch(error => { return { result: false, value: error }; });
			}
			else if (included_in_voice_list(
				new_channel.id, guild_object.portal_list)) { // left created channel and joins another created
				report_message += '->dest: voice_list\n';

				generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
			}
		}
	}

	return { result: true, value: report_message };
}

module.exports = async (
	args: { client: Client, newState: VoiceState, oldState: VoiceState }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.newState?.guild) {
			fetch_guild(args.newState?.guild.id)
				.then(guild_object => {
					if (guild_object) {
						const new_channel = args.newState.channel; // join channel
						const old_channel = args.oldState.channel; // left channel

						if (old_channel && new_channel)
							if (new_channel.id === old_channel.id)
								return resolve({ result: true, value: 'changed voice state but remains in the same channel' });

						if (args.client.voice && args.newState.member) {
							const new_voice_connection = args.client.voice.connections
								.find((connection: VoiceConnection) => !!new_channel && connection.channel.id === new_channel.id);
							if (new_voice_connection && !args.newState.member.user.bot) {
								client_talk(args.client, guild_object, 'user_connected');
							}

							const old_voice_connection = args.client.voice.connections
								.find((connection: VoiceConnection) => !!old_channel && connection.channel.id === old_channel.id);
							if (old_voice_connection && !args.newState.member.user.bot) {
								client_talk(args.client, guild_object, 'user_disconnected');
							}
						}

						let report_message = `from: ${old_channel} to ${new_channel}\n`;

						const execution = (old_channel === null)
							? from_null(new_channel, guild_object, args.newState)
							: from_existing(old_channel, new_channel, args.client, guild_object, args.newState);

						if (!execution.result) return resolve(execution);
						report_message += `${execution.value}`;

						return resolve({ result: true, value: report_message });
					} else {
						return resolve({ result: false, value: 'could not find guild in Portal' });
					}
				})
				.catch(error => {
					return resolve({ result: false, value: 'could not find guild in Portal' });
				});
		} else {
			return resolve({ result: false, value: 'could fnot find guild in Portal' });
		}
	});
};
