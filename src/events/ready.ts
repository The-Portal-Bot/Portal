import { Client } from "discord.js";
import {
	update_portal_managed_guilds, remove_deleted_guild,
	remove_deleted_channels, remove_empty_voice_channels
} from "../libraries/helpOps";
import { console_text } from "../libraries/localizationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	args: { client: Client, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
) => {
	if (args.client.user === null || args.client.user === undefined) return {
		result: false,
		value: 'could not fetch user from client'
	}

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

		update_portal_managed_guilds( args.portal_managed_guilds_path, args.guild_list);
	});
	console.log('');

	return {
		result: true,
		value: console_text.some(ct => {
			if (ct.name === 'ready') {
				ct.lang.en({
					'a': args.client.users.cache.size,
					'b': args.client.channels.cache.size,
					'c': args.client.guilds.cache.size
				});
			}
		})
	};
};
