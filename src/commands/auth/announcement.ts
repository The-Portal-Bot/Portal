import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  NewsChannel,
  type VoiceChannel,
} from "npm:discord.js";

import {
  deleteChannel,
  getChannelTypeById,
} from "../../libraries/guild.library.ts";
import { messageHelp } from "../../libraries/help.library.ts";
import { updateGuild } from "../../libraries/mongo.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import { PortalChannelType } from "../../types/enums/PortalChannel.enum.ts";
import {
  TextChannelType,
  TextChannelTypeList,
} from "../../types/enums/TextChannelType.enum.ts";

const COMMAND_NAME = "announcement";
const DESCRIPTION = "set an announcements channel";

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
        .setName("announcement_channel")
        .setDescription("the channel you want to make the announcement channel")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("delete_previous")
        .setDescription(
          "whether or not to delete the previous announcement channel",
        )
        .setRequired(false)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const announcementChannel = interaction.options.getChannel(
      "announcement_channel",
    );
    const deletePreviousAnnouncementChannel = interaction.options.getChannel(
      "delete_previous",
    );

    if (!announcementChannel) {
      return {
        result: false,
        value: messageHelp("commands", "announcement"),
      };
    }

    if (!(announcementChannel instanceof NewsChannel)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "announcement",
          "channel must be news channel",
        ),
      };
    }

    if (!announcementChannel.isTextBased()) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "announcement",
          "channel must be text channel",
        ),
      };
    }

    const channelType = await getChannelTypeById(
      announcementChannel.id,
      pGuild,
    );
    if (channelType !== TextChannelType.NONE) {
      return {
        result: false,
        value: `selected channel is already in use as ${
          TextChannelTypeList[channelType]
        } channel`,
      };
    }

    if (deletePreviousAnnouncementChannel) {
      const announcement = interaction?.guild?.channels.cache.find(
        (channel) => channel.id == pGuild.announcement,
      ) as VoiceChannel;

      if (announcement) {
        deleteChannel(
          PortalChannelType.announcement,
          announcement,
          interaction,
        );
      }
    }

    const response = await updateGuild(
      pGuild.id,
      "announcement",
      announcementChannel.id,
    );

    return {
      result: response,
      value: response
        ? "new announcement channel set successfully"
        : "failed to set new announcement channel",
    };
  },
} as Command;
