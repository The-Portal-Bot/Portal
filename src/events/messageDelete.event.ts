import { Client, Message, PartialMessage, TextChannel } from 'discord.js';
import {
  createMusicLyricsMessage,
  createMusicMessage,
  isMessageDeleted,
  markMessageAsDeleted,
} from '../libraries/help.library';
import { fetchGuild, removePoll, removeVendor } from '../libraries/mongo.library';

export default async (args: { client: Client; message: Message<boolean> | PartialMessage }): Promise<string> => {
  if (!args.message.guild) {
    return `message's guild could not be fetched`;
  }

  const pGuild = await fetchGuild(args.message.guild.id);

  if (!pGuild) {
    return `failed to fetch guild`;
  }

  const pRoles = pGuild.pRoles;
  const pMusicData = pGuild.musicData;

  if (pMusicData.messageId === args.message.id) {
    const musicChannel = <TextChannel>(
      args.message.guild?.channels.cache.find((channel) => channel.id === pGuild.musicData.channelId)
    );

    if (!musicChannel) {
      return 'could not find channel';
    }

    const musicMessage = await createMusicMessage(musicChannel, pGuild);

    if (!musicMessage) {
      return 'failed to create music message';
    }

    if (pGuild.musicData.messageLyricsId) {
      if (musicChannel) {
        const lyricMessage = await musicChannel.messages.fetch(pGuild.musicData.messageLyricsId);

        if (!lyricMessage) {
          return `error creating lyrics message`;
        }

        if (isMessageDeleted(lyricMessage)) {
          const deletedMessage = await lyricMessage.delete();

          if (deletedMessage) {
            markMessageAsDeleted(deletedMessage);
            return `deleted lyrics message`;
          }
        }
      }
    }
  } else if (pMusicData.messageLyricsId === args.message.id) {
    const musicChannel = <TextChannel>(
      args.message?.guild?.channels.cache.find((channel) => channel.id === pGuild.musicData.channelId)
    );

    if (musicChannel && pGuild.musicData.messageId) {
      const lyricMessage = await createMusicLyricsMessage(musicChannel, pGuild, pGuild.musicData.messageId);
      return lyricMessage ? 'created lyrics message' : `error creating lyrics message`;
    }
  } else if (pGuild.pPolls.some((p) => p.messageId === args.message.id)) {
    const poll = pGuild.pPolls.find((p) => p.messageId === args.message.id);

    if (!poll) {
      return 'failed to find poll';
    }

    const removedPoll = await removePoll(pGuild.id, args.message.id);
    return removedPoll ? 'successfully removed poll' : 'failed to remove poll';
  } else {
    const roleGiver = pRoles.find((roleGiver) => roleGiver.messageId === args.message.id);

    if (!roleGiver) {
      return `could not find role giver message ${args.message.id} in database`;
    }

    const response = await removeVendor(pGuild.id, roleGiver.messageId);

    return response
      ? 'successfully deleted role message'
      : 'failed to delete role message';
  }

  return 'message deletion handled';
};
