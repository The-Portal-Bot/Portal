import { Message } from "discord.js";
import { update_member, insert_authorised_role } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length <= 0) {
			return resolve({
				result: false,
				value: 'you should give one argument (role name, role id ' +
					'or member id).\nyou can run `./help authorise` for help'
			});
		}

		if (!message.guild) {
			return resolve({
				result: false,
				value: 'could not fetch guild from message'
			});
		}

		const role_name = args.join(' ');

		// check if it is a user id
		guild_object.member_list.some(m => {
			if (m.id === role_name) {
				update_member(guild_object.id, m.id, 'admin', true);
				const member = message.guild?.members.cache
					.find(mb => mb.id === m.id);

				return resolve({
					result: true,
					value: `member ${member ? member : m.id} has been made an admin`
				});
			}

			return false;
		});

		const role = message.guild.roles.cache
			.find(r =>
				role_name === r.name ||
				role_name === r.id);

		if (role) {
			for (const i in guild_object.auth_role) {
				if (guild_object.auth_role[i] === role.id) {
					return resolve({
						result: false,
						value: `role "${role.name}" is already an authorised role`
					});
				}
			}

			insert_authorised_role(guild_object.id, role.id)
				.then(r => {
					return resolve({
						result: r,
						value: r
							? `Role "${role.name}" was set as admin role`
							: `could not set "${role.name}" as admin role`
					});
				})
				.catch(e => {
					return resolve({
						result: false,
						value: `an error occured while setting "${role.name}" as admin role (${e})`
					});
				});
		}
		else {
			return resolve({
				result: false,
				value: `"${role_name}" is neither a role name, role id nor a member id`
			});
		}
	});
};
