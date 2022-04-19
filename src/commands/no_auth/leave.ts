import { getVoiceConnection } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { client_write } from "../../libraries/localisation.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<string> => {

	if (!message.guild) {
		return Promise.reject('message has no guild');
	}

	let voiceConnection = await getVoiceConnection(message.guild.id);

	if (!voiceConnection) {
		return Promise.reject('Portal must be connected to a voice channel with you');
	}

	voiceConnection.disconnect();

	// client_talk(client, guild_object, 'leave');
	// setTimeout(
	// 	function () {
	// 		voiceConnection.disconnect();
	// 	},
	// 	4000
	// );


	return client_write(message, guild_object, 'leave');
};
