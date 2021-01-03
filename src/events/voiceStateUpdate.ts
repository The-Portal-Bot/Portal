import { Client, VoiceConnection, VoiceState } from "discord.js";
import {
	create_voice_channel, delete_channel, generate_channel_name,
	included_in_portal_list, included_in_voice_list
} from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { client_talk } from "../libraries/localizationOps";
import { stop } from "../libraries/musicOps";
import { update_timestamp } from "../libraries/userOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (client: Client, newState: VoiceState, oldState: VoiceState,
	guild_list: GuildPrtl[], portal_managed_guilds_path: string): Promise<ReturnPormise> => {
	if (client.voice == undefined || !newState.member) {
		return {
			result: false,
			value: 'error with arguments'
		};
	}

	const newChannel = newState.channel; // join channel
	const oldChannel = oldState.channel; // left channel

	if (oldChannel !== null && oldChannel !== undefined) {
		if (newChannel !== null && newChannel !== undefined) {
			if (newChannel.id === oldChannel.id) {
				return {
					result: true,
					value: 'changed voice state but remains in the same channel'
				};
			}
		}
	}

	const newVoiceConnection = client.voice.connections.find((connection: VoiceConnection) =>
		newChannel !== null && connection.channel.id === newChannel.id);
	if (newVoiceConnection && !newState.member.user.bot) {
		client_talk(client, guild_list, 'user_connected');
	}

	const oldVoiceConnection = client.voice.connections.find((connection: VoiceConnection) =>
		oldChannel !== null && connection.channel.id === oldChannel.id);
	if (oldVoiceConnection && !newState.member.user.bot) {
		client_talk(client, guild_list, 'user_disconnected');
	}

	let report_message = `from: ${oldChannel} to ${newChannel}\n`;

	if (oldChannel === null) {
		if (newChannel !== null) { // joined from null
			report_message += 'null->existing\n';
			const guild_object = guild_list.find(g => g.id === newState.guild.id);
			if (!guild_object) return {
				result: false,
				value: 'error with data'
			};

			// joined portal channel
			if (included_in_portal_list(newChannel.id, guild_object.portal_list)) {
				const portal_object = guild_object.portal_list.find(p => p.id === newChannel.id);
				if (!portal_object) return {
					result: false,
					value: 'error with data'
				};

				create_voice_channel(
					newState, portal_object,
					newChannel, newState.id);
				generate_channel_name(
					newChannel,
					guild_object.portal_list,
					guild_object,
					newState.guild);

			}
			else if (included_in_voice_list(
				newChannel.id, guild_object.portal_list)) { // joined voice channel

				generate_channel_name(
					newChannel,
					guild_object.portal_list,
					guild_object,
					newState.guild);
				update_timestamp(newState, guild_list); // points for voice

			}
			else { // joined other channel

				update_timestamp(newState, guild_list); // points for other

			}
		}
	}
	else if (oldChannel !== null) { // Left from existing
		if (newChannel === null) {
			report_message += 'existing->null\n';
			const guild_object = guild_list.find(g => g.id === newState.guild.id);
			if (!guild_object) return {
				result: false,
				value: 'error with data'
			};

			// user left voice channel
			if (included_in_voice_list(oldChannel.id, guild_object.portal_list)) {

				if (oldChannel.members.size === 0) {
					delete_channel(oldChannel, null, true);
				}
				const voiceConnection = client.voice.connections
					.find((connection: VoiceConnection) => connection.channel.id === oldChannel.id);

				if (voiceConnection) {
					if (oldChannel.members.size === 1) {
						voiceConnection.disconnect();
						delete_channel(oldChannel, null, true);
						stop(newState.guild.id, guild_list, oldChannel.guild);
					}
				}
			}
			update_timestamp(newState, guild_list); // points calculation from any channel
		}
		else if (newChannel !== null) { // Moved from channel to channel
			report_message += 'existing->existing\n';
			const guild_object = guild_list.find(g => g.id === newState.guild.id);
			if (!guild_object) return {
				result: false,
				value: 'error with data'
			};

			if (included_in_portal_list(oldChannel.id, guild_object.portal_list)) {

				report_message += '->source: portal_list\n';

				if (included_in_voice_list(
					newChannel.id, guild_object.portal_list)) { // has been handled before

					update_timestamp(newState, guild_list); // points from voice creation

					report_message += '->dest: voice_list\n';
					report_message += 'has been handled before\n';
					generate_channel_name(
						newChannel,
						guild_object.portal_list,
						guild_object,
						newState.guild);
				}
			}
			else if (included_in_voice_list(oldChannel.id, guild_object.portal_list)) {

				report_message += '->source: voice_list\n';

				if (included_in_portal_list(
					newChannel.id, guild_object.portal_list)) { // moved from voice to portal

					report_message += '->dest: portal_list\n';

					if (oldChannel.members.size === 0) {

						delete_channel(
							oldChannel, null, true);

					}
					const voiceConnection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === oldChannel.id);

					if (voiceConnection) {
						if (oldChannel.members.size === 1) {
							voiceConnection.disconnect();
							delete_channel(oldChannel, null, true);
							stop(newState.guild.id, guild_list, oldChannel.guild);
						}
					}

					const portal_object = guild_object.portal_list.find(p => p.id === newChannel.id);
					if (!portal_object) return {
						result: false,
						value: 'error with data'
					};

					create_voice_channel(
						newState, portal_object,
						newChannel, newState.id);
					generate_channel_name(
						newChannel,
						guild_object.portal_list,
						guild_object,
						newState.guild);
				}
				else if (included_in_voice_list(newChannel.id, guild_object.portal_list)) { // moved from voice to voice

					report_message += '->dest: voice_list\n';

					if (oldChannel.members.size === 0) {
						delete_channel(
							oldChannel, null, true);
					}

					const voiceConnection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === oldChannel.id);

					if (voiceConnection) {
						if (oldChannel.members.size === 1) {
							voiceConnection.disconnect();
							delete_channel(oldChannel, null, true);
							stop(newState.guild.id, guild_list, oldChannel.guild);
						}
					}

					generate_channel_name(
						newChannel,
						guild_object.portal_list,
						guild_object,
						newState.guild);

				}
				else { // moved from voice to other

					report_message += '->dest: other\n';

					if (oldChannel.members.size === 0) {
						delete_channel(oldChannel, null, true);
					}

					const voiceConnection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === oldChannel.id);

					if (voiceConnection) {
						if (oldChannel.members.size === 1) {
							voiceConnection.disconnect();
							delete_channel(oldChannel, null, true);
							stop(newState.guild.id, guild_list, oldChannel.guild);
						}

					}

					generate_channel_name(
						newChannel,
						guild_object.portal_list,
						guild_object,
						newState.guild);
				}
			}
			else {
				report_message += '->source: other voice\n';

				if (included_in_portal_list(
					newChannel.id, guild_object.portal_list)) { // Joined portal channel
					report_message += '->dest: portal_list\n';
					const portal_object = guild_object.portal_list.find(p => p.id === newChannel.id);
					if (!portal_object) return {
						result: false,
						value: 'error with data'
					};

					create_voice_channel(
						newState, portal_object,
						newChannel, newState.id);
					generate_channel_name(
						newChannel,
						guild_object.portal_list,
						guild_object,
						newState.guild);

				}
				else if (included_in_voice_list(
					newChannel.id, guild_object.portal_list)) { // left created channel and joins another created
					report_message += '->dest: voice_list\n';

					generate_channel_name(
						newChannel,
						guild_object.portal_list,
						guild_object,
						newState.guild);
				}
			}
		}
	}

	update_portal_managed_guilds(true, portal_managed_guilds_path, guild_list);
	report_message += '\n';

	return { result: true, value: report_message };
};
