import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		if (args.length <= 0) {
			resolve({ result: false, value: 'you should give one role.\nyou can run "./help authorise" for help.*' });
		}

		const role_name = args.join(' ');
		const role = message?.guild?.roles.cache.find(current_role => role_name === current_role.name);

		if (role) {
			const guild_object = guild_list.find(g => g.id === message.guild?.id);
			if (!guild_object) {
				return resolve({ result: true, value: 'portal guild could not be fetched' });
			}

			for (const i in guild_object.auth_role) {
				if (guild_object.auth_role[i] === role.id) {
					return resolve({ result: false, value: `role "${role_name}" is already an authorised role.` });
				}
			}
			guild_object.auth_role.push(role.id);
			resolve({ result: true, value: `role "${role_name}" has been added to role list.` });
		}
		else {
			resolve({ result: false, value: `role "${role_name}" does not exist in guild "${message.guild}".` });
		}
	});
};
