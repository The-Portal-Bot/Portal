import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (args: {
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
}) => {
	return new Promise((resolve) => {
		if (args.args.length <= 0) {
			resolve({ result: false, value: 'you should give one role.\nyou can run "./help auth_role_rem" for help.*' });
		}

		const role_name = args.args.join(' ');
		const role = args.message?.guild?.roles.cache.find(current_role => role_name === current_role.name);

		if (role) {
			const guild_object = args.guild_list.find(g => g.id === args.message.guild?.id);
			if (!guild_object) {
				return resolve({ result: true, value: 'portal guild could not be fetched' });
			}

			if(guild_object.auth_role.some((ar, index) => {
				if (ar === role.id) {
					guild_object.auth_role.splice(index, 1);
				}
			})) {
				return resolve({ result: true, value: `role ${role_name} has been removed from authorized roles.` });
			}
			
			return resolve({ result: false, value: `role ${role_name} is not in role list.` });
		}
		else {
			resolve({ result: false, value: `role ${role_name} does not exist in guild ${args.message.guild}.` });
		}
	});
};
