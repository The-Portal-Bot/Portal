/* eslint-disable no-unused-vars */
const help_mngr = require('../libraries/helpOps');
const guld_mngr = require('../libraries/guildOps');

const multiple_same_emote = function(emote_map) {
	for (let i = 0; i < emote_map.length; i++) {
		for (let j = i + 1; j < emote_map.length; j++) {
			if (emote_map[i].give === emote_map[j].give) {return true;}
			else if (emote_map[i].give === emote_map[j].strip) {return true;}
			else if (emote_map[i].strip === emote_map[j].give) {return true;}
			else if (emote_map[i].strip === emote_map[j].strip) {return true;}
		}
	}

	return false;
};

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const roles = [...message.guild.roles.cache];
		// client.emojis.cache.forEach(emoji => console.log('emoji: ', emoji));
		if (args.length > 0) {
			const role_map = help_mngr.getJSON(args.join(' '));
			if(role_map === null) {
				return resolve (
					{ result: false, value: '*roles must be in JSON format for more info ./help role*' },
				);
			}
			if(multiple_same_emote(role_map)) {
				return resolve (
					{ result: false, value: '*emotes should differ ./help role*' },
				);
			}

			const role_emb_value= []; // : GiveRole[]
			const role_emb_display = []; // : Field[]

			role_emb_display.push({
				emote: '',
				role: 'React with emote to get correlating role',
				inline: false,
			});
			for (let i = 0; i < role_map.length; i++) {
				if(!guld_mngr.is_role(message.guild, role_map[i].role)) {
					return resolve ({
						result: false,
						value: `${role_map[i].role} is not a role in ${message.guild}`,
					});
				}
				role_emb_display.push({
					emote: role_map[i].give,
					role: role_map[i].role,
					inline: true,
				});
				role_emb_value.push({
					emote: role_map[i].give,
					role: role_map[i].role,
					inline: true,
				});
			}

			role_emb_display.push({
				emote: '',
				role: 'React with emote to strip correlating role',
				inline: false,
			});
			for (let i = 0; i < role_map.length; i++) {
				if(!guld_mngr.is_role(message.guild, role_map[i].role)) {
					return resolve ({
						result: false,
						value: `${role_map[i].role} is not a role in ${message.guild}`,
					});
				}
				role_emb_display.push({
					emote: role_map[i].strip,
					role: role_map[i].role,
					inline: true,
				});
				role_emb_value.push({
					emote: role_map[i].strip,
					role: role_map[i].role,
					inline: true,
				});
			}
			role_map.forEach(elem => elem['id'] = roles.find(role => role[1].name === elem.role)[0]);
			help_mngr.create_role_message(
				message.channel, portal_guilds[message.guild.id]['role_list'],
				'Portal Role Assigner', '', '#FF7F00', role_emb_display, role_map,
			);

		}
		else {
			return resolve ({
				result: false,
				value: '*you can run "./help role" for help.*',
			});
		}

		return resolve ({
			result: true,
			value: '*role message has been created.*',
		});
	});
};
