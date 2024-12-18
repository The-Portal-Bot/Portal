import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, InteractionContextType, NewsChannel, VoiceChannel } from 'discord.js';

import { deleteChannel, doesChannelHaveUsage } from '../../libraries/guild.library.js';
import { messageHelp } from '../../libraries/help.library.js';
import { updateGuild } from '../../libraries/mongo.library.js';
import { Command } from '../../types/Command.js';
import { PGuild } from '../../types/classes/PGuild.class.js';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface.js';
import { PortalChannelType } from '../../types/enums/PortalChannel.enum.js';

const COMMAND_NAME = 'announcement';
const DESCRIPTION = 'make an announcement to the announcements channel';

export default {
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
        .setName('announcement_channel')
        .setDescription('the channel you want to make the announcement channel')
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName('delete_previous')
        .setDescription('whether or not to delete the previous announcement channel')
        .setRequired(false),
    )
    .setContexts(InteractionContextType.Guild),
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
      const announcement = interaction?.guild?.channels.cache.find(
        (channel) => channel.id == pGuild.announcement,
      ) as VoiceChannel;

      if (announcement) {
        deleteChannel(PortalChannelType.announcement, announcement, interaction);
      }
    }

    const response = await updateGuild(pGuild.id, 'announcement', announcementChannel.id);

    return {
      result: response,
      value: response ? 'new announcement channel set successfully' : 'failed to set new announcement channel',
    };
  },
} as Command;
