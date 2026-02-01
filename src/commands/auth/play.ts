import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  InteractionContextType,
} from "discord.js";

import { messageHelp } from "../../libraries/help.library.ts";
import { searchYoutube, startPlayback } from "../../libraries/music.library2.ts";
import { VoiceLibrary } from "../../libraries/voice.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import logger from "../../utilities/log.utility.ts";

const COMMAND_NAME = "play";
const DESCRIPTION = "Play a song from YouTube";

export default {
  time: 5,
  premium: false,
  ephemeral: false,
  auth: true,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The song name or YouTube URL to play")
        .setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const query = interaction.options.getString("query");

    if (!query) {
      return {
        result: false,
        value: messageHelp("commands", "play"),
      };
    }

    const member = interaction.member as GuildMember;
    if (!member) {
      return {
        result: false,
        value: "Could not get member information",
      };
    }

    // Check if user is in a voice channel
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return {
        result: false,
        value: "You must be in a voice channel to use this command",
      };
    }

    // Check if voice channel is joinable
    if (!voiceChannel.joinable) {
      return {
        result: false,
        value: "I don't have permission to join your voice channel",
      };
    }

    // Search for the video
    const video = await searchYoutube(query);
    if (!video) {
      return {
        result: false,
        value: `Could not find anything matching "${query}" on YouTube`,
      };
    }

    // Get or create voice connection
    let voiceConnection = VoiceLibrary.getVoiceConnectionByGuildId(
      member.guild.id,
    );

    // If connected to a different channel, switch
    if (
      voiceConnection &&
      voiceConnection.joinConfig.channelId !== voiceChannel.id
    ) {
      voiceConnection.destroy();
      voiceConnection = null;
    }

    // Join if not connected
    if (!voiceConnection) {
      try {
        voiceConnection = await VoiceLibrary.joinUserVoiceChannelById(
          voiceChannel.id,
          member.guild,
        );

        if (!voiceConnection) {
          return {
            result: false,
            value: "Failed to join voice channel",
          };
        }
      } catch (error) {
        logger.error(`Failed to join voice channel: ${error}`);
        return {
          result: false,
          value: "Failed to join voice channel. Please try again.",
        };
      }
    }

    // Start playback
    const playbackStarted = await startPlayback(voiceConnection, video, pGuild);

    if (!playbackStarted) {
      return {
        result: false,
        value: "Failed to start playback",
      };
    }

    return {
      result: true,
      value: `🎵 Now playing: **${video.title}** (${video.timestamp})`,
    };
  },
} as unknown as Command;
