import { Message, Client } from "discord.js";
import { message_help } from "../../../libraries/help.library";
import { client_talk, client_write } from "../../../libraries/localisation.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const voiceConnection = client?.voice?.connections
			.find(connection => !!connection.channel.id);

		if (voiceConnection) {
			client_talk(client, guild_object, 'leave');
			setTimeout(
				function () {
					voiceConnection.disconnect();
				},
				4000
			);
		}

		return resolve({
				result: true,
				value: message_help('commands', 'leave', client_write(message, guild_object, 'leave'))
			});
	});
};
