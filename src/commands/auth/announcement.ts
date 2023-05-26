import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, ChatInputCommandInteraction, VoiceChannel } from 'discord.js';
import {
  createChannel,
  deleteChannel,
  getOptions,
  isAnnouncementChannel,
  isMusicChannel,
  isUrlOnlyChannel,
} from '../../libraries/guild.library';
import { messageHelp } from '../../libraries/help.library';
import { updateGuild } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { PortalChannelTypes } from '../../types/enums/PortalChannel.enum';

export = {
  data: new SlashCommandBuilder()
    .setName('announcement')
    .setDescription('makes an announcement channel')
    .addStringOption((option) =>
      option
        .setName('announcement')
        .setDescription('The announcement you want to make')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    const channelId = interaction.channel?.id;

    if (!interaction.guild) {
      return {
        result: false,
        value: 'message guild could not be fetched',
      };
    }

    if (args.length === 0) {
      const response = await doesChannelHaveUsage(interaction, pGuild);
      if (response.result) {
        return {
          result: false,
          value: response.value,
        };
      }
    }

    const announcement = interaction.guild.channels.cache.find(
      (channel) => channel.id == pGuild.announcement
    ) as VoiceChannel;

    if (announcement) {
      deleteChannel(PortalChannelTypes.announcement, announcement, interaction).catch((e) => {
        return {
          result: false,
          value: `failed to delete channel: ${e}`,
        };
      });
    }

    if (args.length === 0) {
      const response = await updateGuild(pGuild.id, 'announcement', channelId);

      return {
        result: response,
        value: response
          ? 'this is now the announcement channel'
          : 'failed to set this as the announcement channel',
      };
    } else if (args.length > 0) {
      let announcementChannel: string = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1);
      let announcementCategory: string | null = args.join(' ').substring(args.join(' ').indexOf('|'));

      if (announcementChannel === '' && announcementCategory !== '') {
        announcementChannel = announcementCategory;
        announcementCategory = null;
      }

      const announcementOptions = getOptions(
        interaction.guild,
        'announcements channel (Portal/Users/Admins)',
        false,
        undefined,
        ChannelType.GuildAnnouncement
      );
      let createdChannelId: string;
      try {
        createdChannelId = await createChannel(
          interaction.guild,
          announcementChannel,
          announcementOptions,
          announcementCategory
        );
      } catch (e) {
        return Promise.reject(e);
      }

      try {
        const response = await updateGuild(pGuild.id, 'announcement', createdChannelId);
        return {
          result: response,
          value: response
            ? 'created announcement channel successfully'
            : 'failed to create a announcement channel',
        };
      } catch (e) {
        return {
          result: false,
          value: `failed to create a announcement channel: ${e}`,
        };
      }
    }

    return {
      result: false,
      value: messageHelp('commands', 'announcement'),
    };
  },
};

async function doesChannelHaveUsage(interaction: ChatInputCommandInteraction, pGuild: PGuild) {
  const channelId = interaction.channel?.id;

  if (!channelId) {
    return {
      result: false,
      value: 'could not get channel id',
    };
  }

  if (isAnnouncementChannel(channelId, pGuild)) {
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

  if (isMusicChannel(channelId, pGuild)) {
    return {
      result: true,
      value: "this can't be set as an announcement channel for it is the music channel",
    };
  }

  if (isUrlOnlyChannel(channelId, pGuild)) {
    return {
      result: true,
      value: "this can't be set as the announcement channel for it is an url channel",
    };
  }

  return {
    result: false,
    value: '',
  };
}
