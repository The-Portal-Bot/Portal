const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');
const help_mngr = require('./../functions/help_manager');
const user_mngr = require('./../functions/user_manager');

module.exports = async (args) => {
	if (args.newState === undefined || args.oldState == undefined) {return { result: true, value: 'state of undefined' };}

	const newChannel = args.newState.channel; // join channel
	const oldChannel = args.oldState.channel; // left channel

	if (oldChannel !== null && oldChannel !== undefined) {
		if (newChannel !== null && newChannel !== undefined) {
			if (newChannel.id === oldChannel.id) {
				return {
					result: true, value: 'changed voice state but remains in the same channel',
				};
			}
		}
	}

	const newVoiceConnection = args.client.voice.connections
		.find(connection => newChannel !== null && connection.channel.id === newChannel.id);
	if (newVoiceConnection && !args.newState.member.user.bot) {lclz_mngr.client_talk(args.client, args.guild_list, 'user_connected');}

	const oldVoiceConnection = args.client.voice.connections
		.find(connection => oldChannel !== null && connection.channel.id === oldChannel.id);
	if (oldVoiceConnection && !args.newState.member.user.bot) {lclz_mngr.client_talk(args.client, args.guild_list, 'user_disconnected');}

	let report_message = `from: ${oldChannel} to ${newChannel}\n`;

	if (oldChannel === null) {

		if (newChannel !== null) { // joined from null
			report_message += 'null->existing\n';

			if (guld_mngr.included_in_portal_list(
				newChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // joined portal channel

				guld_mngr.create_voice_channel(
					args.newState, args.guild_list[args.newState.guild.id].portal_list[newChannel.id],
					newChannel, args.newState.id);
				guld_mngr.generate_channel_name(
					newChannel,
					args.guild_list[args.newState.guild.id].portal_list,
					args.guild_list[args.newState.guild.id],
					args.newState.guild);

			}
			else if (guld_mngr.included_in_voice_list(
				newChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // joined voice channel

				guld_mngr.generate_channel_name(
					newChannel,
					args.guild_list[args.newState.guild.id].portal_list,
					args.guild_list[args.newState.guild.id],
					args.newState.guild);
				user_mngr.update_timestamp(args.newState, args.guild_list); // points for voice

			}
			else { // joined other channel

				user_mngr.update_timestamp(args.newState, args.guild_list); // points for other

			}
		}

	}
	else if (oldChannel !== null) { // Left from existing

		if (newChannel === null) {
			report_message += 'existing->null\n';

			if (guld_mngr.included_in_voice_list(
				oldChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // user left voice channel

				if (oldChannel.members.size === 0) {
					guld_mngr.delete_channel(oldChannel, args.guild_list[args.newState.guild.id].portal_list);
				}
				const voiceConnection = args.client.voice.connections
					.find(connection => connection.channel.id === oldChannel.id);

				if (voiceConnection) {
					if (oldChannel.members.size === 1) {
						voiceConnection.disconnect();
						guld_mngr.delete_channel(oldChannel, args.guild_list[args.newState.guild.id].portal_list);
					}
				}
			}

			user_mngr.update_timestamp(args.newState, args.guild_list); // points calculation from any channel

		}
		else if (newChannel !== null) { // Moved from channel to channel
			report_message += 'existing->existing\n';

			if (guld_mngr.included_in_portal_list(
				oldChannel.id, args.guild_list[args.newState.guild.id].portal_list)) {

				report_message += '->source: portal_list\n';

				if (guld_mngr.included_in_voice_list(
					newChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // has been handled before

					user_mngr.update_timestamp(args.newState, args.guild_list); // points from voice creation

					report_message += '->dest: voice_list\n';
					report_message += 'has been handled before\n';
					guld_mngr.generate_channel_name(
						newChannel,
						args.guild_list[args.newState.guild.id].portal_list,
						args.guild_list[args.newState.guild.id],
						args.newState.guild);

				}

			}
			else if (guld_mngr.included_in_voice_list(
				oldChannel.id, args.guild_list[args.newState.guild.id].portal_list)) {

				report_message += '->source: voice_list\n';

				if (guld_mngr.included_in_portal_list(
					newChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // moved from voice to portal

					report_message += '->dest: portal_list\n';

					if (oldChannel.members.size === 0) {

						guld_mngr.delete_channel(
							oldChannel, args.guild_list[args.newState.guild.id].portal_list);

					}
					const voiceConnection = args.client.voice.connections
						.find(connection => connection.channel.id === oldChannel.id);

					if (voiceConnection) {
						if (oldChannel.members.size === 1) {

							voiceConnection.disconnect();
							guld_mngr.delete_channel(
								oldChannel, args.guild_list[args.newState.guild.id].portal_list);

						}
					}

					guld_mngr.create_voice_channel(
						args.newState, args.guild_list[args.newState.guild.id].portal_list[newChannel.id],
						newChannel, args.newState.id);
					guld_mngr.generate_channel_name(
						newChannel,
						args.guild_list[args.newState.guild.id].portal_list,
						args.guild_list[args.newState.guild.id],
						args.newState.guild);
				}
				else if (guld_mngr.included_in_voice_list(
					newChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // moved from voice to voice

					report_message += '->dest: voice_list\n';

					if (oldChannel.members.size === 0) {
						guld_mngr.delete_channel(
							oldChannel, args.guild_list[args.newState.guild.id].portal_list);
					}

					const voiceConnection = args.client.voice.connections
						.find(connection => connection.channel.id === oldChannel.id);

					if (voiceConnection) {
						if (oldChannel.members.size === 1) {
							voiceConnection.disconnect();
							guld_mngr.delete_channel(
								oldChannel, args.guild_list[args.newState.guild.id].portal_list);
						}
					}

					guld_mngr.generate_channel_name(
						newChannel,
						args.guild_list[args.newState.guild.id].portal_list,
						args.guild_list[args.newState.guild.id],
						args.newState.guild);

				}
				else { // moved from voice to other

					report_message += '->dest: other\n';

					if (oldChannel.members.size === 0) {
						guld_mngr.delete_channel(oldChannel, args.guild_list[args.newState.guild.id].portal_list);
					}

					const voiceConnection = args.client.voice.connections
						.find(connection => connection.channel.id === oldChannel.id);

					if (voiceConnection) {
						if (oldChannel.members.size === 1) {
							voiceConnection.disconnect();
							guld_mngr.delete_channel(oldChannel, args.guild_list[args.newState.guild.id].portal_list);
						}

					}

					guld_mngr.generate_channel_name(
						newChannel,
						args.guild_list[args.newState.guild.id].portal_list,
						args.guild_list[args.newState.guild.id],
						args.newState.guild);
				}

			}
			else {

				report_message += '->source: other voice\n';

				if (guld_mngr.included_in_portal_list(
					newChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // Joined portal channel
					report_message += '->dest: portal_list\n';

					guld_mngr.create_voice_channel(
						args.newState, args.guild_list[args.newState.guild.id].portal_list[newChannel.id],
						newChannel, args.newState.id);
					guld_mngr.generate_channel_name(
						newChannel,
						args.guild_list[args.newState.guild.id].portal_list,
						args.guild_list[args.newState.guild.id],
						args.newState.guild);

				}
				else if (guld_mngr.included_in_voice_list(
					newChannel.id, args.guild_list[args.newState.guild.id].portal_list)) { // left created channel and joins another created
					report_message += '->dest: voice_list\n';

					guld_mngr.generate_channel_name(
						newChannel,
						args.guild_list[args.newState.guild.id].portal_list,
						args.guild_list[args.newState.guild.id],
						args.newState.guild);

				}
			}
		}
	}

	help_mngr.update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.guild_list);
	report_message += '\n';

	return { result: true, value: report_message };
};
