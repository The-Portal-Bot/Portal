import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (args: {
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
}) => {
	return new Promise((resolve) => {
		const guild_object = args.guild_list.find(g => g.id === args.message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}

		const roles = guild_object.auth_role;
		const get_role_name = (role_id: string, i: number) => {
			const role = args.message?.guild?.roles.cache.find(r => r.id === role_id);
			return role ? `${i}. ${role.name}` : `${i}. undefined`;
		};

		if (guild_object.auth_role.length > 0) {
			resolve({
				result: true,
				value: `*Authorized Roles:*\n${roles.map((r, i) => get_role_name(r, i)).join('\n')}`,
			});
		}
		else {
			resolve({
				result: false,
				value: 'There are no authorization roles.',
			});
		}
	});
};
