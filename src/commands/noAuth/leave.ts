import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';
import { clientWrite } from '../../libraries/localisation.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { AnnouncementAction, ReturnPromise } from '../../types/classes/PTypes.interface';
import { commandDescriptionByNameAndAuthenticationLevel } from '../../libraries/help.library';

const COMMAND_NAME = 'leave';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, false)),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    if (!interaction.guild) {
      return {
        result: false,
        value: 'guild could not be fetched',
      };
    }

    const voiceConnection = getVoiceConnection(interaction.guild.id);

    if (!voiceConnection) {
      return {
        result: false,
        value: 'portal must be connected to a voice channel with you',
      };
    }

    if (!voiceConnection.disconnect()) {
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
