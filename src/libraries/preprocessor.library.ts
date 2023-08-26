import { Message } from 'discord.js';
import * as auth from '../commands/auth';
import * as noAuth from '../commands/noAuth';
import { MusicData, PGuild } from '../types/classes/PGuild.class';
import { AuthCommands, CommandOptions, NoAuthCommands } from '../types/classes/PTypes.interface';
import { includedInPIgnores, isUrlOnlyChannel } from './guild.library';
import { isMessageDeleted, isUserIgnored, markMessageAsDeleted, messageReply } from './help.library';
import logger from './log.library';
import { removeIgnore, removeURL, setMusicData } from './mongo.library';
import { addPointsMessage } from './user.library';

/*
 * Returns: true/false if processing must continue
 */
export async function portalPreprocessor(message: Message, pGuild: PGuild): Promise<boolean> {
  if (!message.member) {
    logger.error(new Error('could not get member'));
    return true;
  }

  if (isUserIgnored(message.member)) {
    if (!handleUrlChannels(message, pGuild)) {
      if (pGuild.musicData.channelId === message.channel.id) {
        message.member.send('you can\'t play music when ignored').catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });

        if (isMessageDeleted(message)) {
          const deletedMessage = await message.delete().catch((e) => {
            logger.error(new Error(`failed to delete message: ${e}`));
          });

          if (deletedMessage) {
            markMessageAsDeleted(deletedMessage);
          }
        }
      }
    }

    return true;
  } else {
    if (await handleUrlChannels(message, pGuild)) {
      return true;
    } else if (handleIgnoredChannels(message, pGuild)) {
      handleRankingSystem(message, pGuild);
      return true;
    } else if (handleMusicChannels(message, pGuild)) {
      handleRankingSystem(message, pGuild);
      return true;
    } else {
      handleRankingSystem(message, pGuild);

      // if (pGuild.profanityLevel !== ProfanityLevelEnum.none) {
      //     // profanity check
      //     const profanities = isProfane(message.content, pGuild.profanityLevel);
      //     if (profanities.length > 0) {
      //         message
      //             .react('🚩')
      //             .catch((e) => {
      //                 logger.error(new Error(`failed to react message: ${e}`));
      //             });

      //         message.author
      //             .send(`try not to use profanities (${profanities.join(',')})`)
      //             .catch(e => {
      //                 logger.error(new Error(e));
      //             });
      //     }
      // }

      return false;
    }
  }
}

export function commandDecipher(messageContent: Message['content']): {
  commandName: AuthCommands | NoAuthCommands | undefined;
  args: string[];
} {
  // separate command name and arguments
  const args = messageContent.trim().split(/ +/g);
  const commandOnly = args.shift();

  if (!commandOnly) {
    return {
      commandName: undefined,
      args: [],
    };
  }

  return {
    commandName: commandOnly.toLowerCase() as AuthCommands | NoAuthCommands,
    args: args,
  };
}

export function commandFetcher(
  commandName: AuthCommands | NoAuthCommands,
){
  const authCommand = [...Object.values(auth)].find(command => command.data.name === commandName);

  if (authCommand) {
    return {
      name: authCommand.data.name,
      description: authCommand.data.description,
      auth: authCommand.auth,
      scopeLimit: authCommand.scopeLimit,
      time: authCommand.time,
      premium: authCommand.premium,
      ephemeral: authCommand.ephemeral,
    } as CommandOptions;
  }

  const noAuthCommand = [...Object.values(noAuth)].find(command => command.data.name === commandName);

  if (noAuthCommand) {
    return  {
      name: noAuthCommand.data.name,
      description: noAuthCommand.data.description,
      auth: noAuthCommand.auth,
      scopeLimit: noAuthCommand.scopeLimit,
      time: noAuthCommand.time,
      premium: noAuthCommand.premium,
      ephemeral: noAuthCommand.ephemeral,
    } as CommandOptions;
  }

  return undefined;
}

export function handleRankingSystem(message: Message, pGuild: PGuild): void {
  addPointsMessage(message, pGuild.pMembers[0], pGuild.rankSpeed)
    .then((level) => {
      if (level) {
        messageReply(true, message, `you reached level ${level}!`).catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });
      }
    })
    .catch((e) => {
      logger.error(new Error(e));
    });
}

export async function handleUrlChannels(message: Message, pGuild: PGuild): Promise<boolean> {
  if (isUrlOnlyChannel(message.channel.id, pGuild)) {
    if (message.content === './url') {
      removeURL(pGuild.id, message.channel.id)
        .then((r) => {
          messageReply(true, message, `removed url channel ${r ? 'successfully' : 'unsuccessfully'}`).catch((e) => {
            logger.error(new Error(`failed to send message: ${e}`));
          });
        })
        .catch((e) => {
          logger.error(new Error(`failed to remove url channel: ${e}`));
        });
    } else {
      message.author.send(`${message.channel} is a url-only channel`).catch((e) => {
        logger.error(new Error(`failed to remove url channel: ${e}`));
      });

      if (isMessageDeleted(message)) {
        const deletedMessage = await message.delete().catch((e) => {
          logger.error(new Error(`failed to delete message: ${e}`));
        });

        if (deletedMessage) {
          markMessageAsDeleted(deletedMessage);
        }
      }
    }

    return true;
  }

  return false;
}

export function handleIgnoredChannels(message: Message, pGuild: PGuild): boolean {
  if (includedInPIgnores(message.channel.id, pGuild)) {
    if (message.content === './ignore') {
      removeIgnore(pGuild.id, message.channel.id)
        .then((r) => {
          messageReply(true, message, `removed from ignored channels ${r ? 'successfully' : 'unsuccessfully'}`).catch(
            (e) => {
              logger.error(new Error(`failed to send message: ${e}`));
            }
          );
        })
        .catch((e) => {
          logger.error(new Error(`failed to remove ignored channel: ${e}`));
        });
    }

    return true;
  }

  return false;
}

export function handleMusicChannels(message: Message, pGuild: PGuild): boolean {
  if (pGuild.musicData.channelId === message.channel.id) {
    if (message.content === './music') {
      if (!message.guild) {
        logger.error(new Error('failed to get guild from message'));
        return true;
      }

      const musicData = new MusicData('null', 'null', 'null', [], false);
      setMusicData(pGuild.id, musicData)
        .then((r) => {
          messageReply(true, message, `removed from ignored channels ${r ? 'successfully' : 'unsuccessfully'}`).catch(
            (e) => logger.error(new Error(`failed to send message: ${e}`))
          );
        })
        .catch((e) => logger.error(new Error(`failed to remove music channel: ${e}`)));
    } else {
      // if (!message.guild || !message.member) {
      //     if (message.deletable) {
      //         message
      //             .delete()
      //             .catch((e) => logger.error(new Error(`failed to delete message: ${e}`)));
      //     }
      //     return false;
      // }
      // const portalVoiceConnection = client.voice?.connections
      //     .find(c => c.channel.guild.id === message.guild?.id);
      // if (portalVoiceConnection) {
      //     if (!portalVoiceConnection.channel.members.has(message.member.id)) {
      //         if (message.guild) {
      //             const portalVoiceConnection = client.voice?.connections
      //                 .find(c => c.channel.guild.id === message.guild?.id);
      //             const animate = portalVoiceConnection?.dispatcher
      //                 ? !portalVoiceConnection?.dispatcher.paused
      //                 : false;
      //             updateMusicMessage(
      //                 message.guild,
      //                 pGuild,
      //                 pGuild.musicQueue.length > 0
      //                     ? pGuild.musicQueue[0]
      //                     : undefined,
      //                 'you must be in the same channel as Portal',
      //                 animate
      //             ).catch(e => {
      //                 logger.error(new Error(e));
      //             });
      //         }
      //         if (message.deletable) {
      //             message
      //                 .delete()
      //                 .catch((e) => {
      //                     logger.error(new Error(`failed to send message: ${e}`));
      //                 });
      //         }
      //         return false;
      //     }
      // }
      // start(
      //     voiceConnection, client, message.member.user, message,
      //     message.guild, pGuild, message.content
      // )
      //     .then(r => {
      //         if (message.guild) {
      //             const portalVoiceConnection = client.voice?.connections
      //                 .find(c => c.channel.guild.id === message.guild?.id);
      //             const animate = portalVoiceConnection?.dispatcher
      //                 ? !portalVoiceConnection?.dispatcher.paused
      //                 : false;
      //             updateMusicMessage(
      //                 message.guild,
      //                 pGuild,
      //                 pGuild.musicQueue.length > 0
      //                     ? pGuild.musicQueue[0]
      //                     : undefined,
      //                 r,
      //                 animate
      //             ).catch(e => {
      //                 logger.error(new Error(e));
      //             });
      //         }
      //         if (message.deletable) {
      //             message
      //                 .delete()
      //                 .catch((e) => {
      //                     logger.error(new Error(`failed to send message: ${e}`));
      //                 });
      //         }
      //     })
      //     .catch(e => {
      //         if (message.guild) {
      //             updateMusicMessage(
      //                 message.guild,
      //                 pGuild,
      //                 pGuild.musicQueue.length > 0
      //                     ? pGuild.musicQueue[0]
      //                     : undefined,
      //                 `error while starting playback: ${e}`
      //             ).catch(e => {
      //                 logger.error(new Error(e));
      //             });
      //         }
      //         if (message.deletable) {
      //             message
      //                 .delete()
      //                 .catch((e) => {
      //                     logger.error(new Error(`failed to send message: ${e}`));
      //                 });
      //         }
      //     });
    }
    return true;
  }

  return false;
}
