import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { joinUserVoiceChannelByInteraction } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('join').setDescription('tell Portal to join your voice channel'),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    const voiceConnection = await joinUserVoiceChannelByInteraction(client, interaction, pGuild /*, true*/);

    if (!voiceConnection) {
      return Promise.reject('failed to join voice channel');
    }

    return {
      result: true,
      value: 'successfully joined voice channel',
    };
  },
};
