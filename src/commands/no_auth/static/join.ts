import { Client, Message } from "discord.js";
import { join_user_voice } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}

		join_user_voice(client, message, guild_list, true)
			.then(response => { return resolve(response); })
			.catch(error => { return resolve({ result: false, value: error }) });
	});
};
