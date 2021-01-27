import { Client, Message } from "discord.js";
import { update_member_admin } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length <= 0)
			return resolve({
				result: false,
				value: 'you should give one argument (role name, role id ' +
					'or member id).\nyou can run `./help authorise` for help'
			});

		if (!message.guild)
			return resolve({
				result: false,
				value: 'could not fetch guild from message'
			});

		const role_name = args.join(' ');
		const role = message.guild.roles.cache.find(current_role => role_name === current_role.name);

		guild_object.member_list.some(m => {
			if (m.id === role_name) {
				// m.admin = true;
				update_member_admin(guild_object.id, m.id, true);
				const member = message.guild?.members.cache.find(mb => mb.id === m.id);
				return resolve({
					result: true,
					value: `member ${member ? member : m.id} has been made an admin`
				});
			}
			return false;
		});

		if (role) {
			for (const i in guild_object.auth_role) {
				if (guild_object.auth_role[i] === role.id) {
					return resolve({
						result: false,
						value: `role "${role_name}" is already an authorised role`
					});
				}
			}
			guild_object.auth_role.push(role.id);
			return resolve({
				result: true,
				value: `role "${role_name}" has been added to role list`
			});
		}
		else {
			return resolve({
				result: false,
				value: `"${role_name}" is neither a role nor a member id`
			});
		}
	});
};
