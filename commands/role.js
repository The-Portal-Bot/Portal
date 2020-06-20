/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	let roles = [];
	message.guild.roles.cache.forEach(role => { roles.push({ role }); });

	if (args.length > 0) {
		let role_map = null;
		try {
			role_map = JSON.parse(args.join(' '));
		} catch (error) {
			// message.channel.send('Roles must be in JSON format for more info ./help role_giver');
			return {
				result: false, value: '*roles must be in JSON format for more info ./help role_giver*'
			};
		}
		let role_emb = [];
		let role_emb_prnt = [];

		role_emb_prnt.push(
			{ emote: '', role: '**Get Role**: *react with one of the following emotes to get this role.*', inline: false }
		);
		for (let i = 0; i < role_map.length; i++) {
			role_emb_prnt.push(
				{ emote: role_map[i].give, role: role_map[i].role, inline: true }
			);
			role_emb.push(
				{ emote: role_map[i].give, role: role_map[i].role, inline: true }
			);
		}
		role_emb_prnt.push(
			// { emote: '', role: '', inline: false },
			{ emote: '', role: '**Strip Role**: *react with one of the following emotes to strip this role.*', inline: false }
		);
		for (let i = 0; i < role_map.length; i++) {
			role_emb_prnt.push(
				{ emote: role_map[i].strip, role: role_map[i].role, inline: true }
			);
			role_emb.push(
				{ emote: role_map[i].strip, role: role_map[i].role, inline: true }
			);
		}
		guld_mngr.create_role_message(message, portal_guilds[message.guild.id]['role_list'],
			'Portal Role Assigner', '', '#FF7F00', role_emb_prnt);
		message.react('✔️');
	} else {
		return {
			result: false, value: '*you can run "./help role" for help.*'
		};
	}

	return {
		result: true, value: '*role giver message has been created.*'
	};
};
