import { getVoiceConnection } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { client_write } from "../../libraries/localisation.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('tell Portal to leave your voice channel'),
	async execute(
		message: Message, args: string[], pGuild: PGuild, client: Client
	): Promise<string> {
		if (!message.guild) {
			return Promise.reject('message has no guild');
		}

		let voiceConnection = await getVoiceConnection(message.guild.id);

		if (!voiceConnection) {
			return Promise.reject('Portal must be connected to a voice channel with you');
		}

		voiceConnection.disconnect();

		// client_talk(client, pGuild, 'leave');
		// setTimeout(
		// 	function () {
		// 		voiceConnection.disconnect();
		// 	},
		// 	4000
		// );


		return client_write(message, pGuild, 'leave');
	}
};
