import { Client } from "discord.js";
import { empty_channel_remover } from "../libraries/helpOps";
import { console_text } from "../libraries/localizationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (client: Client, guild_list: GuildPrtl[], portal_managed_guilds_path: string) => {
	if (!client.user) {
		return;
	}
	// Changing Portal bots status
	client.user.setActivity('./help', { url: 'https://github.com/keybraker', type: 'LISTENING' });
	console.log('Portal guilds: ');
	client.guilds.cache.forEach(guild => {
		console.log(`${guild} (${guild.id})`);
		empty_channel_remover(guild, guild_list, portal_managed_guilds_path);
	});

	return {
		result: true, value: console_text.some(ct => {
			if (ct.name === 'ready') {
				ct.lang.en({
					'a': client.users.cache.size,
					'b': client.channels.cache.size,
					'c': client.guilds.cache.size
				});
			}
		})
	};
};
