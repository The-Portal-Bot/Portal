import { Message } from "discord.js";
import { update_member, remove_authorised_role } from "../../../libraries/mongoOps";
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

		guild_object.member_list.some(m => {
			if (m.id === role_name) {
				update_member(guild_object.id, m.id, 'admin', false);
				const member = message.guild?.members.cache.find(mb => mb.id === m.id);
				resolve({
					result: true,
					value: `member ${member ? member : m.id} is no longer admin`
				});
			}
			return false;
		});

		const role = message?.guild?.roles.cache
			.find(current_role => role_name === current_role.name ||
				role_name === current_role.id);

		if (role) {
			if (guild_object.auth_role.some(ar => ar === role.id)) {
				remove_authorised_role(guild_object.id, role.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? `successfully removed role ${role.name} from auth list`
								: `failed to remove role ${role.name} from auth list`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `failed to remove role ${role.name} from auth list`
						});
					});
			} else {
				return resolve({
					result: false,
					value: `role ${role.name} is not an authorised role`
				});
			}
		} else {
			return resolve({
				result: false,
				value: `role ${role_name} does not exist`
			});
		}
	});
};
