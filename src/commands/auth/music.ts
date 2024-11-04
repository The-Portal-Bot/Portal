import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, TextChannel, VoiceChannel } from 'discord.js';

import { deleteChannel, doesChannelHaveUsage } from '../../libraries/guild.library';
import { createMusicLyricsMessage, createMusicMessage, messageHelp } from '../../libraries/help.library';
import { Command } from '../../types/Command';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';
import { PortalChannelType } from '../../types/enums/PortalChannel.enum';

const COMMAND_NAME = 'music';
const DESCRIPTION = 'set a music channel';

export = {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addChannelOption((option) =>
      option
        .setName('music_channel')
        .setDescription('the channel you want to make the music channel')
        .setRequired(true))
    .addChannelOption((option) =>
      option
        .setName('delete_previous')
        .setDescription('whether or not to delete the previous music channel')
        .setRequired(false))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const musicChannel = interaction.options.getChannel('music_channel');
    const deletePreviousMusicChannel = interaction.options.getChannel('delete_previous');

    if (!musicChannel) {
      return {
        result: false,
        value: messageHelp('commands', 'music'),
      };
    }

    if (!(musicChannel instanceof TextChannel)) {
      return {
        result: false,
        value: messageHelp('commands', 'music', 'channel must be text channel'),
      };
    }

    if (!musicChannel.isTextBased) {
      return {
        result: false,
        value: messageHelp('commands', 'music', 'channel must be text channel'),
      };
    }

    const channelHasUsage = await doesChannelHaveUsage(musicChannel.id, pGuild);
    if (channelHasUsage.result) {
      return {
        result: false,
        value: channelHasUsage.value,
      };
    }

    if (deletePreviousMusicChannel) {
      const music = interaction?.guild?.channels.cache
        .find((channel) => channel.id == pGuild.musicData.channelId) as VoiceChannel;

      if (music) {
        deleteChannel(PortalChannelType.music, music, interaction);
      }
    }

    const musicMessageId = await createMusicMessage(musicChannel, pGuild);
    await createMusicLyricsMessage(musicChannel, pGuild, musicMessageId);

    return {
      result: true,
      value: 'new music channel set successfully',
    };
  },
} as Command;
