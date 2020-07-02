/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');
const attr_objct = require('../properties/attribute_list');

const locales = ['gr', 'en', 'de'];

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		let current_portal_list = portal_guilds[message.guild.id].portal_list;

		if (message.member.voice.channel === undefined || message.member.voice.channel === null) {
			return resolve ({
				result: false, value: '*you must be in a channel handled by* **Portal™***.*'
			});
		} else if (!guld_mngr.included_in_voice_list(message.member.voice.channel.id, current_portal_list)) {
			return resolve ({
				result: false, value: '*the channel you are in is not handled by* **Portal™***.*'
			});
		}

		if (args.length > 1) { // check for type accuracy and make better
			for (let portal_key in current_portal_list) {
				for (let voice_key in current_portal_list[portal_key].voice_list) {
					if (voice_key === message.member.voice.channel.id) {
						let current_voice_channel = current_portal_list[portal_key].voice_list[voice_key];
						let current_portal_channel = current_portal_list[portal_key];

						if (message.member.id === current_voice_channel.creator_id) {
							let value = [...args]; value.shift(); value = value.filter(val => val !== '\n').join(' ');

							let return_value = attr_objct.set(
								message.member.voice.channel, current_voice_channel, current_portal_channel,
								portal_guilds[message.guild.id], args[0], value, message.member
							);

							switch (return_value) {
							case 1:
								return resolve ({ result: true, value: `*attribute ${args[0]} set to ${value} successfully.*` });
							case -1:
								return resolve({ result: false, value: `*${args[0]} is not an attribute.*` });
							case -2:
								return resolve ({ result: false, value: `*${args[0]} can only be set by an administrator.*` });
							case -3:
								return resolve({ result: false, value: `*${args[0]} can only be set by the portal creator.*` });
							case -4:
								return resolve({ result: false, value: `*${args[0]} can only be set by the voice creator.*` });
							case -5:
								return resolve ({ result: false, value: `*locale can only be ${locales.join(', ')}.*` });
							case -6:
								return resolve({ result: false, value: `*${args[0]} can be a number from 0-n (0 means unlimited).*` });
							case -7:
								return resolve({ result: false, value: `*${args[0]} can only be true or false.*` });
							default:
								return resolve ({ result: false, value: `*${args[0]} cannot be set.*` });
							}
						} else {
							return resolve ({ result: false, value: `*only the channel creator can change attribute: ${args[0]}.*` });
						}
					}
				}
			}
		}
		return resolve ({
			result: true, value: `*${args[0]} was not set.*`
		});
	});
};
