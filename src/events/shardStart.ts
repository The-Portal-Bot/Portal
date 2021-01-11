import { Client } from "discord.js";
import {
	remove_deleted_channels, remove_deleted_guild,
	remove_empty_voice_channels, update_portal_managed_guilds
} from "../libraries/helpOps";
import { console_text, get_function } from "../libraries/localisationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { client: Client, guild_list: GuildPrtl[], portal_managed_guilds_path: string, id: string }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.client.user === null || args.client.user === undefined)
			return { result: false, value: 'could not fetch user from client' };

		// Changing Portal bots status
		args.client.user.setActivity('./help', {
			url: 'https://github.com/keybraker',
			type: 'LISTENING'
		});

		const guild = args.client.guilds.cache.find(g => g.id === args.id);
		if (!guild)
			return { result: false, value: 'could not fetch user from client' };

		console.log(`> loading portal\'s guilds: ${args.id}`);
		console.log(`> ${guild} (${guild.id})`);

		remove_deleted_guild(guild, args.guild_list);
		remove_deleted_channels(guild, args.guild_list);
		remove_empty_voice_channels(guild, args.guild_list);

		update_portal_managed_guilds(args.portal_managed_guilds_path, args.guild_list);
		console.log('');

		const func = get_function('console', 'en', 'ready');
		return resolve({
			result: true,
			value: func
				? func(args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size)
				: 'error with localisation'
		});
	});
};