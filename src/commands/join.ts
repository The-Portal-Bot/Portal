import { Client, Message } from "discord.js";
import { join_user_voice } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}

		return join_user_voice(client, message, guild_list, true)
			.then(response => response)
			.catch(err => console.log('err :>> ', err));
	});
};
