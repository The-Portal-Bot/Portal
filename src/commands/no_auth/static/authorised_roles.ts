import { Client, Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { get_role_name } from "../../../libraries/guildOps";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}

		const roles = guild_object.auth_role;
		

		if (guild_object.auth_role.length > 0) {
			resolve({
				result: true,
				value: `authorised roles:*\n${roles.map((r, i) => get_role_name(r, i, message)).join('\n')}`,
			});
		}
		else {
			resolve({
				result: false,
				value: 'there are no authorisation roles',
			});
		}
	});
};
