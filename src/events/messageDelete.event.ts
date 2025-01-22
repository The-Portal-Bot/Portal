import type { Message, PartialMessage, TextChannel } from "npm:discord.js";
import {
  createMusicLyricsMessage,
  createMusicMessage,
  isMessageDeleted,
  markMessageAsDeleted,
} from "../libraries/help.library.ts";
import {
  fetchGuild,
  removePoll,
  removeVendor,
} from "../libraries/mongo.library.ts";

import type { PGuild } from "../types/classes/PGuild.class.ts";
import logger from "../utilities/log.utility.ts";

export async function messageDelete(
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

  if (pGuild.musicData.messageId === message.id) {
    await handleMusicMessageDeletion(message, pGuild);
  } else if (pGuild.musicData.messageLyricsId === message.id) {
    await handleLyricMessageDeletion(message, pGuild);
  } else if (pGuild.pPolls.some((p) => p.messageId === message.id)) {
    await handlePollMessageDeletion(message, pGuild);
  } else if (
    pGuild.pRoles.some((roleGiver) => roleGiver.messageId === message.id)
  ) {
    await handleVendorMessageDeletion(message, pGuild);
  }
}

async function handleMusicMessageDeletion(
  message: Message<boolean> | PartialMessage,
  pGuild: PGuild,
): Promise<void> {
  const musicChannel = <TextChannel> (
    message.guild?.channels.cache.find((channel) =>
      channel.id === pGuild.musicData.channelId
    )
  );

  if (!musicChannel) {
    logger.error(
      `failed to find music channel ${pGuild.musicData.channelId}`,
    );
    return;
  }

  const musicMessage = await createMusicMessage(musicChannel, pGuild);
  if (!musicMessage) {
    logger.error("failed to create music message");
    return;
  }

  if (pGuild.musicData.messageLyricsId) {
    if (musicChannel) {
      const lyricMessage = await musicChannel.messages.fetch(
        pGuild.musicData.messageLyricsId,
      );

      if (!lyricMessage) {
        logger.error(
          `failed to fetch lyrics message ${pGuild.musicData.messageLyricsId}`,
        );
        return;
      }

      if (isMessageDeleted(lyricMessage)) {
        const deletedMessage = await lyricMessage.delete();

        if (deletedMessage) {
          markMessageAsDeleted(deletedMessage);
          logger.info(
            `deleted lyrics message ${pGuild.musicData.messageLyricsId}`,
          );
        }
      }
    }
  }
}

async function handleLyricMessageDeletion(
  message: Message<boolean> | PartialMessage,
  pGuild: PGuild,
): Promise<void> {
  const musicChannel = <TextChannel> (
    message?.guild?.channels.cache.find((channel) =>
      channel.id === pGuild.musicData.channelId
    )
  );

  if (musicChannel && pGuild.musicData.messageId) {
    const lyricMessage = await createMusicLyricsMessage(
      musicChannel,
      pGuild,
      pGuild.musicData.messageId,
    );
    if (!lyricMessage) {
      logger.warn("failed to create lyrics message");
    }
  }
}

async function handlePollMessageDeletion(
  message: Message<boolean> | PartialMessage,
  pGuild: PGuild,
): Promise<void> {
  // const poll = pGuild.pPolls.find((p) => p.messageId === message.id);
  // if (!poll) {
  //   logger.warn(`failed to find poll ${message.id}`);
  // }

  const removedPoll = await removePoll(pGuild.id, message.id);
  if (!removedPoll) {
    logger.warn(`failed to remove poll ${message.id}`);
  }
}

async function handleVendorMessageDeletion(
  message: Message<boolean> | PartialMessage,
  pGuild: PGuild,
): Promise<void> {
  const roleGiver = pGuild.pRoles.find((roleGiver) =>
    roleGiver.messageId === message.id
  );
  if (!roleGiver) {
    logger.warn(`failed to find role giver ${message.id}`);
    return;
  }

  const response = await removeVendor(pGuild.id, roleGiver.messageId);
  if (!response) {
    logger.warn(`failed to remove vendor ${roleGiver.messageId}`);
  }
}
