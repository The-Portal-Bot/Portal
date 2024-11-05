import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import logger from '../../utilities/log.utility';

import { joinUserVoiceChannelByInteraction, messageHelp } from '../../libraries/help.library';
import { clientTalk } from '../../libraries/localisation.library';
import { Command } from '../../types/Command';
import { PGuild } from '../../types/classes/PGuild.class';
import { AnnouncementAction, ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'join';
const DESCRIPTION = 'makes portal join your voice channel'

export = {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    try {
      const voiceChannel = await joinUserVoiceChannelByInteraction(interaction, pGuild);

      if(!voiceChannel) {
        return {
          result: false,
          value: 'failed to join voice channel',
        };
      }

      clientTalk(interaction, pGuild, AnnouncementAction.join, true);

      return {
        result: true,
        value: 'successfully joined voice channel',
      };
    }catch (error) {
      logger.error(`commands.join.error: ${error}`);

      return {
        result: false,
        value: messageHelp('commands', 'join', 'failed to join voice channel'),
      };
    }
  },
} as Command;
