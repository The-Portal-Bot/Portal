import type { GuildMember, Message, PartialMessage } from "npm:discord.js";
import { fetchGuild } from "../libraries/mongo.library.ts";

import {} from "../libraries/help.library.ts";
import { searchYoutube } from "../libraries/music.library2.ts";
import { VoiceLibrary } from "../libraries/voice.library.ts";
import type { PGuild } from "../types/classes/PGuild.class.ts";
import logger from "../utilities/log.utility.ts";

export async function messageCreate(
  message: Message<boolean> | PartialMessage,
): Promise<void> {
  if (!message.guild) {
    logger.error("message does not have guild");
    return;
  }

  const pGuild = await fetchGuild(message.guild.id);
  if (!pGuild) {
    logger.error(`failed to fetch guild ${message.guild.id}`);
    return;
  }

  if (message.author?.bot) {
    return;
  }

  if (pGuild.musicData.channelId === message.channelId) {
    await handleMusicMessageCreation(message, pGuild);
  }
}

async function handleMusicMessageCreation(
  message: Message<boolean> | PartialMessage,
  pGuild: PGuild,
): Promise<void> {
  try {
    // Delete message right away
    deleteMessage(message);

    const content = message.content;
    if (!content) {
      logger.error("Message does not have content");
      return;
    }

    // Validate guild and channel
    if (
      !message.guild?.channels.cache.some((channel) =>
        channel.id === pGuild.musicData.channelId
      )
    ) {
      logger.error(
        `Failed to find music channel ${pGuild.musicData.channelId}`,
      );
      return;
    }

    const member = message.member;
    if (!member) {
      logger.error("Message does not have member");
      return;
    }

    // Check if user is in a voice channel
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      await sendUserDM(
        member,
        "You must be in a voice channel to use music commands",
      );
      return;
    }

    // Validate voice channel state
    if (!voiceChannel.joinable) {
      await sendUserDM(
        member,
        "I don't have permission to join your voice channel",
      );
      return;
    }

    // Check existing connection
    const currentVoiceConnection = VoiceLibrary.getVoiceConnectionByGuildId(
      member.guild.id,
    );

    // If already connected to the right channel, proceed with search
    if (currentVoiceConnection) {
      if (currentVoiceConnection.joinConfig.channelId === voiceChannel.id) {
        const video = await searchYoutube(content);
        if (!video) {
          logger.error("Failed to search youtube");
          return;
        }
        logger.info(`Selected video ${video.title}`);
        return;
      } else {
        // Connected to wrong channel - need to switch
        currentVoiceConnection.destroy();
      }
    }

    // Try to join voice channel
    try {
      const newVoiceConnection = await VoiceLibrary.joinUserVoiceChannelById(
        voiceChannel.id,
        member.guild,
      );

      if (!newVoiceConnection) {
        throw new Error("Failed to establish voice connection");
      }

      const video = await searchYoutube(content);
      if (!video) {
        logger.error("Failed to search youtube");
        return;
      }
      logger.info(`Selected video ${video.title}`);
    } catch (error) {
      logger.error(`Failed to join voice channel: ${error}`);
      await sendUserDM(
        member,
        "Failed to join voice channel. Please ensure you are connected and try again.",
      );
      return;
    }
  } catch (error) {
    logger.error(`Error in handleMusicMessageCreation: ${error}`);
  }
}

// Helper function for sending DMs
async function sendUserDM(
  member: GuildMember,
  content: string,
): Promise<void> {
  try {
    const dmChannel = await member.createDM();
    await dmChannel.send(content);
  } catch (error) {
    logger.error(`Failed to send DM to user ${member.id}: ${error}`);
  }
}

function deleteMessage(message: Message<boolean> | PartialMessage): void {
  if (!message.deletable) {
    return;
  }

  message.delete();
}
