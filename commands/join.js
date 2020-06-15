/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	let current_voice = message.member.voice.channel;
	// check if he is an a guild
	if (current_voice !== null) {
		// is he in a voice channel that is in the same guild as his text message
		if (current_voice.guild.id === message.guild.id) {
			// is he in a controlled voice channel ?
			if (guld_mngr.included_in_voice_list(current_voice.id, portal_guilds[message.guild.id].portal_list)) {
				current_voice.join()
					.then(con => {
						lclz_mngr.portal[portal_guilds[current_voice.guild.id].locale].hello.voice(client);
					})
					.catch(e => { console.log(e); });


			} else {
				return {
					result: false, value: 'I can only connect to my channels.' // localize
				};
			}
		} else {
			return {
				result: false, value: 'Your current channel is on another guild.' // localize
			};
		}
	} else {
		return {
			result: false, value: 'You are not connected to any channel.' // localize
		};
	}
	console.log(`portal_guilds[${current_voice.guild.id}].locale: ` + portal_guilds[current_voice.guild.id].locale);
	return {
		result: true, value: lclz_mngr.portal[portal_guilds[current_voice.guild.id].locale].hello.text()
	};
};
