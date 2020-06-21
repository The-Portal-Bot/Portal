/* eslint-disable no-undef */
/* eslint-disable no-cond-assign */
const guld_mngr = require('../functions/guild_manager');
let flow = false;

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path, user_match) => {
	return new Promise((resolve) => {
		let focus_name = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		let focus_time = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

		if (focus_name === '') {
			focus_name = focus_time;
			focus_time = 5;
		}

		if (Object.getOwnPropertyNames(user_match).length !== 0) {
			for (let key in user_match) {
				console.log('1) ' + key + ' === ' + focus_name);
				console.log('2) ' + user_match[key].name + ' === ' + message.member.displayName);
				if (key === focus_name) {
					if (user_match[key].name == message.member.displayName) {
						if (return_value = guld_mngr.create_focus_channel(
							message.guild, portal_guilds[message.guild.id].portal_list,
							message.member, focus_name, focus_time)) {
							if (return_value === true) {
								return resolve ({ result: false, value: '*you can run "./help focus" for help.*' });
							} else {
								return resolve ({ result: true, value: return_value });
							}
						} else {
							return resolve ({ result: false, value: '*could not find user in current voice channel.*' });
						}
					}
				}
			}
		}


		if (!flow) {
			user_match[message.member.displayName] = { name: focus_name, time: focus_time };
			return resolve ({
				result: false, value: `*user **${focus_name}** has not set any request.*` +
					` A request has been added on your behalf with ${focus_name} for ${focus_time} minutes`
			});
		}
	});
};
