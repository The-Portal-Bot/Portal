/* eslint-disable no-unused-vars */
const help_mngr = require('./../functions/help_manager');
const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		let roles = [...message.guild.roles.cache];

		if (args.length > 0) {
			let role_map = help_mngr.getJSON(args.join(' '));
			if(role_map === null) {
				return resolve ({ 
					result: false, 
					value: '*roles must be in JSON format for more info ./help role*'
				});
			}

			let role_emb_value = [];
			let role_emb_display = [];
			
			role_emb_display.push({ 
				emote: '', 
				role: 'React with emote to get correlating role', 
				inline: false
			});
			for (let i = 0; i < role_map.length; i++) {
				role_emb_display.push({
					emote: role_map[i].give,
					role: role_map[i].role,
					inline: true 
				});
				role_emb_value.push({
					emote: role_map[i].give,
					role: role_map[i].role,
					inline: true 
				});
			}

			role_emb_display.push({ 
				emote: '', 
				role: 'React with emote to strip correlating role', 
				inline: false
			});
			for (let i = 0; i < role_map.length; i++) {
				role_emb_display.push({
					emote: role_map[i].strip,
					role: role_map[i].role,
					inline: true 
				});
				role_emb_value.push({
					emote: role_map[i].strip,
					role: role_map[i].role,
					inline: true 
				});
			}

			guld_mngr.create_role_message(
				message, portal_guilds[message.guild.id]['role_list'],
				'Portal Role Assigner', '', '#FF7F00', role_emb_display, role_map
			);

		} else {
			return resolve ({ 
				result: false, 
				value: '*you can run "./help role" for help.*'
			});
		}

		return resolve ({ 
			result: true, 
			value: '*role message has been created.*'
		});
	});
};
