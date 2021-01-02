/* eslint-disable no-unused-vars */
const guld_mngr = require('../libraries/guild_manager');
const lclz_mngr = require('../libraries/localization_manager');
const help_mngr = require('../libraries/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return help_mngr.join_user_voice(client, message, portal_guilds, true)
		.then(response => response)
		.catch(err => console.log('err :>> ', err));

	// return new Promise((resolve) => {
	// let current_voice = message.member.voice.channel;
	// // check if he is an a guild
	// if (current_voice !== null) {
	// 	// is he in a voice channel that is in the same guild as his text message
	// 	if (current_voice.guild.id === message.guild.id) {
	// 		// is he in a controlled voice channel ?
	// if (guld_mngr.included_in_voice_list(current_voice.id, portal_guilds[message.guild.id].portal_list)) {
	// 			current_voice.join()
	// 				.then(con => { lclz_mngr.client_talk(client, portal_guilds, 'join'); })
	// 				.catch(e => { console.log(e); });
	// 		} else {
	// 			return resolve ({ result: false, value: 'I can only connect to my channels.'  }); // localize
	// 		}
	// 	} else {
	// 		return resolve ({ result: false, value: 'your current channel is on another guild.' });  // localize
	// 	}
	// } else {
	// 	return resolve ({ result: false, value: 'you are not connected to any channel.'  }); // localize
	// }

	// return resolve ({ result: true, value: lclz_mngr.client_write(message, portal_guilds, 'join') });
	// });
};
