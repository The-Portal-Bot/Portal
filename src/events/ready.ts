import { Client } from "discord.js";
import {
	update_portal_managed_guilds, remove_deleted_guild,
	remove_deleted_channels, remove_empty_voice_channels
} from "../libraries/helpOps";
import { console_text, get_function } from "../libraries/localisationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { client: Client, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.client.user === null || args.client.user === undefined)
			return resolve({
				result: false,
				value: 'could not fetch user from client'
			});

		// Changing Portal bots status
		args.client.user.setActivity('./help', {
			url: 'https://github.com/keybraker',
			type: 'LISTENING'
		});

		let index = 0;
		console.log(`> loading portal\'s guilds from ${args.portal_managed_guilds_path}`);
		args.client.guilds.cache.forEach((guild) => {
			console.log(`> ${index++}. ${guild} (${guild.id})`);

			remove_deleted_guild(guild, args.guild_list);
			remove_deleted_channels(guild, args.guild_list);
			remove_empty_voice_channels(guild, args.guild_list);

			update_portal_managed_guilds(args.portal_managed_guilds_path, args.guild_list);
		});

		const func = get_function('console', 'en', 'ready');
		return resolve({
			result: true,
			value: func
				? func(args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size)
				: 'error with localisation'
		});
	});
};
