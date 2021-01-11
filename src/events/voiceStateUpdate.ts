import { Client, VoiceChannel, VoiceConnection, VoiceState, TextChannel, Message } from "discord.js";
import { create_voice_channel, generate_channel_name, included_in_portal_list, included_in_voice_list } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { client_talk } from "../libraries/localizationOps";
import { stop } from "../libraries/musicOps";
import { update_timestamp } from "../libraries/userOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

async function delete_channel(
	channel: VoiceChannel | TextChannel, guild_list: GuildPrtl[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const deleted = guild_list.some(g =>
			g.portal_list.some(p =>
				p.voice_list.some((v, index) => {
					if (v.id === channel.id) {
						if (channel.deletable) {
							channel
								.delete()
								.then(g => {
									p.voice_list.splice(index, 1);
									console.log(`deleted channel: ${channel.name} (${channel.id}) from ${channel.guild.name}`);
								})
								.catch(console.log);
						}
						return true;
					}
					return false
				})
			)
		);

		if (!deleted)
			return resolve({ result: true, value: `could not delete channel ${channel}` });
	});
}

function from_null(
	new_channel: VoiceChannel | null, guild_list: GuildPrtl[], guild_object: GuildPrtl,
	newState: VoiceState
): ReturnPormise {
	let report_message = '';

	// joined from null
	if (new_channel) {
		report_message += 'null->existing\n';

		// joined portal channel
		if (included_in_portal_list(new_channel.id, guild_object.portal_list)) {
			const portal_object = guild_object.portal_list.find(p => p.id === new_channel.id);
			if (!portal_object) return { result: false, value: 'error with data' };

			create_voice_channel(newState, portal_object, new_channel, newState.id)
				.then(response => {
					if (!response.result) return response;
					generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
				})
				.catch(error => { return { result: false, value: error }; });
		}
		// joined voice channel
		else if (included_in_voice_list(new_channel.id, guild_object.portal_list)) {
			generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
			update_timestamp(newState, guild_list); // points for voice
		}
		else { // joined other channel
			update_timestamp(newState, guild_list); // points for other
		}
	} else {
		return { result: false, value: 'FN/VU/000: from null to null' };
	}

	return { result: true, value: report_message };
}

function from_existing(
	old_channel: VoiceChannel, new_channel: VoiceChannel | null, client: Client,
	guild_list: GuildPrtl[], guild_object: GuildPrtl, newState: VoiceState
): ReturnPormise {
	let report_message = '';

	if (new_channel === null) {
		report_message += 'existing->null\n';

		// user left voice channel
		if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {

			if (old_channel.members.size === 0) {
				delete_channel(old_channel, guild_list)
					.then(response => { return response; });
			}

			if (client.voice) {
				const voice_connection = client.voice.connections
					.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

				if (voice_connection) {
					if (old_channel.members.size === 1) {
						voice_connection.disconnect();
						delete_channel(old_channel, guild_list)
							.then(response => { return response; });
						stop(newState.guild.id, guild_list, old_channel.guild);
					}
				}
			}
		}
		update_timestamp(newState, guild_list); // points calculation from any channel
	}
	else if (new_channel !== null) { // Moved from channel to channel
		report_message += 'existing->existing\n';

		if (included_in_portal_list(old_channel.id, guild_object.portal_list)) {

			report_message += '->source: portal_list\n';

			if (included_in_voice_list(new_channel.id, guild_object.portal_list)) { // has been handled before

				update_timestamp(newState, guild_list); // points from voice creation

				report_message += '->dest: voice_list\n';
				report_message += 'has been handled before\n';
				generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);
			}
		}
		else if (included_in_voice_list(old_channel.id, guild_object.portal_list)) {

			report_message += '->source: voice_list\n';

			if (included_in_portal_list(new_channel.id, guild_object.portal_list)) { // moved from voice to portal

				report_message += '->dest: portal_list\n';

				if (old_channel.members.size === 0) {
					delete_channel(old_channel, guild_list)
						.then(response => { return response; });
				}

				if (client.voice) {
					const voice_connection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

					if (voice_connection) {
						if (old_channel.members.size === 1) {
							voice_connection.disconnect();
							delete_channel(old_channel, guild_list)
								.then(response => { return response; });
							stop(newState.guild.id, guild_list, old_channel.guild);
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
					delete_channel(old_channel, guild_list)
						.then(response => { return response; });
				}
				if (client.voice) {
					const voiceConnection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

					if (voiceConnection) {
						if (old_channel.members.size === 1) {
							voiceConnection.disconnect();
							delete_channel(old_channel, guild_list)
								.then(response => { return response; });
							stop(newState.guild.id, guild_list, old_channel.guild);
						}
					}
				}

				generate_channel_name(new_channel, guild_object.portal_list, guild_object, newState.guild);

			}
			else { // moved from voice to other

				report_message += '->dest: other\n';

				if (old_channel.members.size === 0) {
					delete_channel(old_channel, guild_list)
						.then(response => { return response; });
				}

				if (client.voice) {
					const voiceConnection = client.voice.connections
						.find((connection: VoiceConnection) => connection.channel.id === old_channel.id);

					if (voiceConnection) {
						if (old_channel.members.size === 1) {
							voiceConnection.disconnect();
							delete_channel(old_channel, guild_list)
								.then(response => { return response; });
							stop(newState.guild.id, guild_list, old_channel.guild);
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
				report_message += '->dest: portal_list\n';
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
	args: {
		client: Client, newState: VoiceState, oldState: VoiceState,
		guild_list: GuildPrtl[], portal_managed_guilds_path: string
	}
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const guild_object = args.guild_list.find(g => g.id === args.newState.guild.id);
		if (!guild_object) return resolve({ result: false, value: 'error with data' });

		const new_channel = args.newState.channel; // join channel
		const old_channel = args.oldState.channel; // left channel

		if (old_channel !== null && old_channel !== undefined) {
			if (new_channel !== null && new_channel !== undefined) {
				if (new_channel.id === old_channel.id) {
					return {
						result: true,
						value: 'changed voice state but remains in the same channel'
					};
				}
			}
		}

		if (args.client.voice && args.newState.member) {
			const new_voice_connection = args.client.voice.connections.find((connection: VoiceConnection) =>
				new_channel !== null && connection.channel.id === new_channel.id);
			if (new_voice_connection && !args.newState.member.user.bot) {
				client_talk(args.client, args.guild_list, 'user_connected');
			}

			const old_voice_connection = args.client.voice.connections.find((connection: VoiceConnection) =>
				old_channel !== null && connection.channel.id === old_channel.id);
			if (old_voice_connection && !args.newState.member.user.bot) {
				client_talk(args.client, args.guild_list, 'user_disconnected');
			}
		}

		let report_message = `from: ${old_channel} to ${new_channel}\n`;

		const execution = (old_channel === null)
			? from_null(new_channel, args.guild_list, guild_object, args.newState)
			: from_existing(old_channel, new_channel, args.client, args.guild_list, guild_object, args.newState);

		if (!execution.result) return resolve(execution);
		report_message += `${execution.value}\n`;

		update_portal_managed_guilds(args.portal_managed_guilds_path, args.guild_list);

		return resolve({ result: true, value: report_message });
	});
};
