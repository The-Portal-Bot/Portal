import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import { Client, Message } from 'discord.js';
import { clientWrite } from '../../libraries/localisation.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('leave').setDescription('tell Portal to leave your voice channel'),
  async execute(message: Message, args: string[], pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    if (!message.guild) {
      return Promise.reject('message has no guild');
    }

    const voiceConnection = await getVoiceConnection(message.guild.id);

    if (!voiceConnection) {
      return Promise.reject('Portal must be connected to a voice channel with you');
    }

    try {
      voiceConnection.disconnect();
    } catch (e) {
      return Promise.reject('failed to disconnect from voice channel');
    }

    // clientTalk(client, pGuild, 'leave');
    // setTimeout(
    // 	function () {
    // 		voiceConnection.disconnect();
    // 	},
    // 	4000
    // );

    return {
      value: clientWrite(message, pGuild, 'leave'),
      result: true,
    };
  },
};
