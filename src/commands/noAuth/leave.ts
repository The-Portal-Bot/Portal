import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';
import { clientWrite } from '../../libraries/localisation.library';
import { Command } from '../../types/Command';
import { PGuild } from '../../types/classes/PGuild.class';
import { AnnouncementAction, ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'leave';
const DESCRIPTION = 'makes portal leave your voice channel'

export = {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION),
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
} as Command;
