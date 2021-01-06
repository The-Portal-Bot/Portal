import { Client } from "discord.js";
import { remove_empty_voice_channels } from "../libraries/helpOps";
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
		remove_empty_voice_channels(guild, args.guild_list, args.portal_managed_guilds_path);
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
