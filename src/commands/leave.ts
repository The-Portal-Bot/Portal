import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { client_talk, client_write } from "../libraries/localizationOps";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		const voiceConnection = client?.voice?.connections.find(connection => !!connection.channel.id)
		if (voiceConnection) {
			client_talk(client, guild_list, 'leave');
			setTimeout(function() { voiceConnection.disconnect(); }, 3000);
		}

		return resolve ({ result: true, value: client_write(message, guild_list, 'leave') });
	});
};
