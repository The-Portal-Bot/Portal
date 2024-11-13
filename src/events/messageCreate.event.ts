import type { Message, PartialMessage, TextChannel } from "npm:discord.js";
import { fetchGuild } from "../libraries/mongo.library.ts";

import {} from "../libraries/help.library.ts";
import { searchYoutube, startPlayback } from "../libraries/music.library2.ts";
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
  deleteMessage(message);

  const content = message.content;
  if (!content) {
    logger.error("message does not have content");
    return;
  }

  if (
    !message.guild?.channels.cache.some((channel) =>
      channel.id === pGuild.musicData.channelId
    )
  ) {
    logger.error(
      `failed to find music channel ${pGuild.musicData.channelId}`,
    );
    return;
  }

  const member = message.member;
  if (!member) {
    logger.error("message does not have member");
    return;
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    const dmChannel = await member.createDM();

    if (!dmChannel) {
      logger.error(`failed to create DM channel with user ${member.id}`);
      return;
    }

    const dmMessage = await dmChannel.send(
      "You must be in a Portal controlled voice channel to use music commands",
    );

    if (!dmMessage) {
      logger.error("failed to send message to DM channel");
      return;
    }

    return;
  }

  const currentVoiceConnection = VoiceLibrary.getVoiceConnectionByGuildId(
    member.guild.id,
  );

  if (
    currentVoiceConnection &&
    currentVoiceConnection.joinConfig.channelId === voiceChannel.id
  ) {
    logger.info("client is already in voice channel");
    return;
  }

  const newVoiceConnection = VoiceLibrary.joinUserVoiceChannelById(
    voiceChannel.id,
    member.guild,
  );
  if (!newVoiceConnection) {
    logger.error(`failed to join voice channel for member ${member.id}`);
    return;
  }

  const video = await searchYoutube(content);
  if (!video) {
    logger.error("failed to search youtube");
    return;
  }
  logger.info(`selected video ${video.title}`);

  // await startPlayback(newVoiceConnection, video, pGuild);

  logger.info("message sent to music channel");
}

function deleteMessage(message: Message<boolean> | PartialMessage): void {
  if (!message.deletable) {
    return;
  }

  message.delete();
}
