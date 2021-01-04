import { Client } from "discord.js";
import { empty_channel_remover } from "../libraries/helpOps";
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

	console.log('Portal guilds: ');
	args.client.guilds.cache.forEach(guild => {
		console.log(`${guild} (${guild.id})`);
		empty_channel_remover(guild, args.guild_list, args.portal_managed_guilds_path);
	});

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
