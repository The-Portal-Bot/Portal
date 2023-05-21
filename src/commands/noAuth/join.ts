import { Client, Message } from "discord.js";
import { joinUserVoiceChannelByMessage } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('tell Portal to join your voice channel'),
  async execute(
    message: Message, args: string[], pGuild: PGuild, client: Client
  ): Promise<ReturnPromise> {
    const voiceConnection = await joinUserVoiceChannelByMessage(client, message, pGuild, true)
      .catch(e => { return Promise.reject(e); });

    if (!voiceConnection) {
      return Promise.reject('failed to join voice channel');
    }

    return {
      result: true,
      value: 'successfully joined voice channel'
    };
  }
};
