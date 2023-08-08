import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, NewsChannel, TextBasedChannel, VoiceChannel } from 'discord.js';
import {
  deleteChannel,
  isAnnouncementChannel,
  isMusicChannel,
  isUrlOnlyChannel
} from '../../libraries/guild.library';
import { commandDescriptionByNameAndAuthenticationLevel, messageHelp } from '../../libraries/help.library';
import { updateGuild } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { PortalChannelTypes } from '../../types/enums/PortalChannel.enum';

const COMMAND_NAME = 'announcement';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, true))
    .addChannelOption((option) =>
      option
        .setName('announcement_channel')
        .setDescription('the channel you want to make the announcement channel')
        .setRequired(true))
    .addChannelOption((option) =>
      option
        .setName('delete_previous')
        .setDescription('whether or not to delete the previous announcement channel')
        .setRequired(false))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const announcementChannel = interaction.options.getChannel('announcement_channel');
    const deletePreviousAnnouncementChannel = interaction.options.getChannel('delete_previous');

    if (!announcementChannel) {
      return {
        result: false,
        value: messageHelp('commands', 'announcement'),
      };
    }

    if (!(announcementChannel instanceof NewsChannel)) {
      return {
        result: false,
        value: messageHelp('commands', 'announcement', 'channel must be news channel'),
      };
    }

    if (!announcementChannel.isTextBased()) {
      return {
        result: false,
        value: messageHelp('commands', 'announcement', 'channel must be text channel'),
      };
    }

    const channelHasUsage = await doesChannelHaveUsage(announcementChannel.id, pGuild);
    if (channelHasUsage.result) {
      return {
        result: false,
        value: channelHasUsage.value,
      };
    }

    if (deletePreviousAnnouncementChannel) {
      const announcement = interaction?.guild?.channels.cache
        .find((channel) => channel.id == pGuild.announcement) as VoiceChannel;

      if (announcement) {
        deleteChannel(PortalChannelTypes.announcement, announcement, interaction);
      }
    }

    const response = await updateGuild(pGuild.id, 'announcement', announcementChannel.id);

    return {
      result: response,
      value: response
        ? 'new announcement channel set successfully'
        : 'failed to set new announcement channel',
    };
  },
};

async function doesChannelHaveUsage(textBasedChannelId: TextBasedChannel['id'], pGuild: PGuild) {
  if (!textBasedChannelId) {
    return {
      result: false,
      value: 'could not get channel id',
    };
  }

  if (isAnnouncementChannel(textBasedChannelId, pGuild)) {
    const response = await updateGuild(pGuild.id, 'announcement', 'null').catch(() => {
      return {
        result: true,
        value: 'failed to remove announcement channel',
      };
    });

    return {
      result: true,
      value: response ? 'successfully removed announcement channel' : 'failed to remove announcement channel',
    };
  }

  if (isMusicChannel(textBasedChannelId, pGuild)) {
    return {
      result: true,
      value: 'this can\'t be set as an announcement channel for it is the music channel',
    };
  }

  if (isUrlOnlyChannel(textBasedChannelId, pGuild)) {
    return {
      result: true,
      value: 'this can\'t be set as the announcement channel for it is an url channel',
    };
  }

  return {
    result: false,
    value: '',
  };
}
