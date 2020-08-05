/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		let current_voice = message.member.voice;
		let current_portal_list = portal_guilds[message.guild.id].portal_list;

		if (current_voice === null) {
			return resolve ({
				result: false,
				value: '*you must be in a channel handled by* **Portal™** *to run commands.*'
			});
		} else if (!guld_mngr.included_in_voice_list(current_voice.channelID, current_portal_list)) {
			return resolve ({
				result: false,
				value: '*the channel you are in is not handled by* **Portal™**'
			});
		}

		for (let key in current_portal_list) {
			if (current_portal_list[key].voice_list[current_voice.channelID]) {
				message.channel.send('executing: ' + args.join(' '))
					.then(sentMessage => {
						sentMessage.edit(
							guld_mngr.regex_interpreter(
								args.join(' '),
								current_voice.channel,
								current_portal_list[key].voice_list[current_voice.channelID],
								current_portal_list[key],
								portal_guilds[message.guild.id]
							)
						);
					});
			}
		}

		return resolve ({
			result: true,
			value: '*command ran successfully.*'
		});
	});
};
