import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  NewsChannel,
} from "npm:discord.js";

import { getChannelTypeById } from "../../libraries/guild.library.ts";
import { messageHelp } from "../../libraries/help.library.ts";
import { insertURL } from "../../libraries/mongo.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import {
  TextChannelType,
  TextChannelTypeList,
} from "../../types/enums/TextChannelType.enum.ts";

const COMMAND_NAME = "url";
const DESCRIPTION = "set a channel to URL only";

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
      option.setName("url_channel").setDescription(
        "the channel you want to make the url channel",
      ).setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const urlChannel = interaction.options.getChannel("url_channel");

    if (!urlChannel) {
      return {
        result: false,
        value: messageHelp("commands", "url"),
      };
    }

    if (!(urlChannel instanceof NewsChannel)) {
      return {
        result: false,
        value: messageHelp("commands", "url", "channel must be news channel"),
      };
    }

    if (!urlChannel.isTextBased()) {
      return {
        result: false,
        value: messageHelp("commands", "url", "channel must be text channel"),
      };
    }

    const channelType = await getChannelTypeById(urlChannel.id, pGuild);
    if (channelType !== TextChannelType.NONE) {
      return {
        result: false,
        value: `selected channel is already in use as ${
          TextChannelTypeList[channelType]
        } channel`,
      };
    }

    const response = await insertURL(pGuild.id, urlChannel.id);

    return {
      result: response,
      value: response
        ? "new url channel set successfully"
        : "failed to set new url channel",
    };
  },
} as Command;
