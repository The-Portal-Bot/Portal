import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { commandDescriptionByNameAndAuthenticationLevel, joinUserVoiceChannelByInteraction } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'join';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, false)),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    const voiceConnection = await joinUserVoiceChannelByInteraction(client, interaction, pGuild /*, true*/);

    return {
      result: !!voiceConnection,
      value: `${voiceConnection ? 'successfully joined' : 'failed to join'} voice channel`,
    };
  },
};
