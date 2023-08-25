import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { joinUserVoiceChannelByInteraction } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'join';
const DESCRIPTION = 'makes portal join your voice channel'

export = {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.MEMBER,
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    try {
      await joinUserVoiceChannelByInteraction(client, interaction, pGuild /*, true*/);

      return {
        result: true,
        value: 'successfully joined voice channel',
      };
    }catch (error) {
      return {
        result: false,
        value: String(error),
      };
    }
  },
};
