import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';
import { clientWrite } from '../../libraries/localisation.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { AnnouncementAction, ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('leave').setDescription('tell Portal to leave your voice channel'),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    if (!interaction.guild) {
      return {
        result: false,
        value: 'guild could not be fetched',
      };
    }

    const voiceConnection = await getVoiceConnection(interaction.guild.id);

    if (!voiceConnection) {
      return {
        result: false,
        value: 'portal must be connected to a voice channel with you',
      };
    }

    const outcome = await voiceConnection.disconnect();

    if (!outcome) {
      return {
        result: false,
        value: 'failed to disconnect from voice channel',
      };
    }

    // clientTalk(client, pGuild, 'leave');
    // setTimeout(
    // 	function () {
    // 		voiceConnection.disconnect();
    // 	},
    // 	4000
    // );

    return {
      result: true,
      value: clientWrite(interaction, pGuild, AnnouncementAction.leave),
    };
  },
};
