import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  TextChannel,
  type VoiceChannel,
} from "npm:discord.js";

import {
  deleteChannel,
  getChannelTypeById,
} from "../../libraries/guild.library.ts";
import {
  createMusicLyricsMessage,
  createMusicMessage,
  messageHelp,
} from "../../libraries/help.library.ts";
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

const COMMAND_NAME = "music";
const DESCRIPTION = "set a music channel";

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
        .setName("music_channel")
        .setDescription("the channel you want to make the music channel")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("delete_previous")
        .setDescription("whether or not to delete the previous music channel")
        .setRequired(false)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const musicChannel = interaction.options.getChannel("music_channel");
    const deletePreviousMusicChannel = interaction.options.getChannel(
      "delete_previous",
    );

    if (!musicChannel) {
      return {
        result: false,
        value: messageHelp("commands", "music"),
      };
    }

    if (!(musicChannel instanceof TextChannel)) {
      return {
        result: false,
        value: messageHelp("commands", "music", "channel must be text channel"),
      };
    }

    if (!musicChannel.isTextBased) {
      return {
        result: false,
        value: messageHelp("commands", "music", "channel must be text channel"),
      };
    }

    const channelType = await getChannelTypeById(musicChannel.id, pGuild);
    if (channelType !== TextChannelType.NONE) {
      return {
        result: false,
        value: `selected channel is already in use as ${
          TextChannelTypeList[channelType]
        } channel`,
      };
    }

    if (deletePreviousMusicChannel) {
      const music = interaction?.guild?.channels.cache.find(
        (channel) => channel.id == pGuild.musicData.channelId,
      ) as VoiceChannel;

      if (music) {
        deleteChannel(PortalChannelType.music, music, interaction);
      }
    }

    const musicMessageId = await createMusicMessage(musicChannel, pGuild);
    await createMusicLyricsMessage(musicChannel, pGuild, musicMessageId);

    return {
      result: true,
      value: "new music channel set successfully",
    };
  },
} as Command;
