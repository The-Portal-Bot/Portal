import { ActivityOptions, Client, Guild } from "discord.js";
import { insert_guild, remove_deleted_channels, remove_empty_voice_channels, update_portal_managed_guilds } from "../libraries/helpOps";
import { get_function } from "../libraries/localisationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function add_guild_again(guild_id: string, guild_list: GuildPrtl[], client: Client): boolean {
	const guild_in_db = guild_list.some(g => g.id === guild_id);
	if (!guild_in_db) {
		insert_guild(guild_id, guild_list, client);
		return true;
	}
	return false;
}

module.exports = async (
	args: { client: Client, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.client.user === null || args.client.user === undefined)
			return resolve({
				result: false,
				value: 'could not fetch user from client'
			});

		const options: ActivityOptions = {
			url: 'https://github.com/keybraker',
			type: 'LISTENING'
		};
		args.client.user.setActivity('./help', options);

		let index = 0;
		console.log(`> loading portal\'s guilds from ${args.portal_managed_guilds_path}`);
		args.client.guilds.cache.forEach((guild: Guild) => {
			console.log(`> ${index++}. ${guild} (${guild.id})`);

			add_guild_again(guild.id, args.guild_list, args.client);
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
