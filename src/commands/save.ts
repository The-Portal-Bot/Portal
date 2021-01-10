import { Client, Message } from "discord.js";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) return resolve({ result: true, value: 'portal guild could not be fetched' });
		if (!message.guild) return resolve({ result: true, value: 'guild could not be fetched' });

		update_portal_managed_guilds( portal_managed_guilds_path, guild_list)
			.then((response) => resolve(response))
			.catch((error) => resolve({ result: false, value: error }));
	});
};
