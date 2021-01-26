import { Client, Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length <= 0)
			resolve({
				result: false,
				value: 'you should give one argument (role name, role id ' +
					'or member id).\nyou can run `./help authorise` for help'
			});

		const role_name = args.join(' ');
		const role = message?.guild?.roles.cache.find(current_role => role_name === current_role.name);

		guild_object.member_list.some(m => {
			if (m.id === role_name) {
				m.admin = true;
				const member = message.guild?.members.cache.find(mb => mb.id === m.id);
				resolve({ result: true, value: `member ${member ? member : m.id} has been made an admin` });
			}
			return false;
		});

		if (role) {
			for (const i in guild_object.auth_role) {
				if (guild_object.auth_role[i] === role.id) {
					return resolve({ result: false, value: `role "${role_name}" is already an authorised role` });
				}
			}
			guild_object.auth_role.push(role.id);
			resolve({ result: true, value: `role "${role_name}" has been added to role list` });
		}
		else {
			resolve({ result: false, value: `"${role_name}" is neither a role nor a member id` });
		}
	});
};
