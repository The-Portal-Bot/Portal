import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';
import { clientTalk, clientWrite } from '../../libraries/localisation.library.js';
import { Command } from '../../types/Command.js';
import { PGuild } from '../../types/classes/PGuild.class.js';
import { AnnouncementAction, ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface.js';

const COMMAND_NAME = 'leave';
const DESCRIPTION = 'makes portal leave your voice channel';

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder().setName(COMMAND_NAME).setDescription(DESCRIPTION),
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

    if (voiceConnection.state.status !== VoiceConnectionStatus.Ready) {
      // await voiceConnection.destroy();
      return {
        result: false,
        value: 'failed to destroy voice connection',
      };
    }

    clientTalk(interaction, pGuild, AnnouncementAction.leave, true);
    setTimeout(function () {
      voiceConnection.disconnect();
    }, 4000);

    return {
      result: true,
      value: clientWrite(interaction, pGuild, AnnouncementAction.leave),
    };
  },
} as Command;
