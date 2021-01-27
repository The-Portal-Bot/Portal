import { Message } from "discord.js";
import { update_member_admin } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length <= 0)
			resolve({
				result: false,
				value: 'you should give one role.\nyou can run `./help deauthorise` for help'
			});

		if (!message.guild)
			return resolve({
				result: false,
				value: 'could not fetch guild from message'
			});

		const role_name = args.join(' ');
		const role = message?.guild?.roles.cache.find(current_role => role_name === current_role.name);

		guild_object.member_list.some(m => {
			if (m.id === role_name) {
				// m.admin = false;
				update_member_admin(guild_object.id, m.id, false);
				const member = message.guild?.members.cache.find(mb => mb.id === m.id);
				resolve({
					result: true,
					value: `member ${member ? member : m.id} is no longer admin`
				});
			}
			return false;
		});

		if (role) {
			if (guild_object.auth_role.some((ar, index) => {
				if (ar === role.id) {
					guild_object.auth_role.splice(index, 1);
					return true;
				}
				return false;
			})) {
				return resolve({ result: true, value: `role ${role_name} has been removed from authorised roles` });
			}

			return resolve({ result: false, value: `role ${role_name} is not in role list` });
		}
		else {
			resolve({ result: false, value: `role ${role_name} does not exist in guild ${message.guild}` });
		}
	});
};
