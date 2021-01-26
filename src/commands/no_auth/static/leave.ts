import { Client, Message } from "discord.js";
import { client_talk, client_write } from "../../../libraries/localisationOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const voiceConnection = client?.voice?.connections.find(connection => !!connection.channel.id)
		if (voiceConnection) {
			client_talk(client, guild_object, 'leave');
			setTimeout(function () { voiceConnection.disconnect(); }, 4000);
		}

		return resolve({ result: true, value: client_write(message, guild_object, 'leave') });
	});
};
