import { Client, Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { get_role_name } from "../../../libraries/guildOps";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
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
