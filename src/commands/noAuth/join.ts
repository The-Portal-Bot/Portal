import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { joinUserVoiceChannelByInteraction } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('join').setDescription('tell Portal to join your voice channel'),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    const voiceConnection = await joinUserVoiceChannelByInteraction(client, interaction, pGuild /*, true*/);

    return {
      result: !!voiceConnection,
      value: `${voiceConnection ? 'successfully joined' : 'failed to join'} voice channel`,
    };
  },
};
