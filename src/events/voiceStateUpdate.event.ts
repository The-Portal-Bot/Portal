import { VoiceConnectionStatus, getVoiceConnection } from '@discordjs/voice';
import { Client, Guild, TextChannel, VoiceChannel, VoiceState } from 'discord.js';
import {
  createVoiceChannel,
  generateChannelName,
  includedInPChannels,
  includedInVoiceList,
} from '../libraries/guild.library';
import {
  isChannelDeleted,
  isGuildDeleted,
  updateMusicLyricsMessage,
  updateMusicMessage,
} from '../libraries/help.library';
import logger from '../libraries/log.library';
import { fetchGuild, removeVoice, setMusicData, updateGuild } from '../libraries/mongo.library';
import { updateTimestamp } from '../libraries/user.library';
import { PGuild } from '../types/classes/PGuild.class';
import { PChannel } from '../types/classes/PPortalChannel.class';

export default async function (args: { client: Client; newState: VoiceState; oldState: VoiceState }): Promise<string> {
  if (!args.newState?.guild) {
    return 'could not find guild in Portal';
  }

  const newChannel = args.newState.channel; // join channel
  const oldChannel = args.oldState.channel; // left channel

  const pGuild = await fetchGuild(args.newState?.guild.id);

  if (!pGuild) {
    return 'could not find guild in Portal';
  }

  if (!pGuild) {
    return 'could not find guild in Portal';
  }

  if (newChannel) {
    for (let i = 0; i < pGuild.pChannels.length; i++) {
      const p = pGuild.pChannels[i];

      if (p.id === newChannel.id) {
        if (p.noBots && args.newState.member?.user.bot) {
          args.newState.disconnect('voice channel does not allow bots')
            .catch((e) => {
              return `failed to kick: ${e}`;
            });

          channelEmptyCheck(newChannel as VoiceChannel, pGuild, args.client)
            .catch((e) => {
              logger.error(new Error(`failed to check channel state: ${e}`));
            });

          return 'portal channel does not allow bots';
        }
      }

      for (let i = 0; i < p.pVoiceChannels.length; i++) {
        const v = p.pVoiceChannels[i];

        if (v.id === newChannel.id) {
          if (v.noBots) {
            args.newState.disconnect('voice channel does not allow bots')
              .catch((e) => {
                return `failed to kick: ${e}`;
              });

            channelEmptyCheck(newChannel as VoiceChannel, pGuild, args.client)
              .catch((e) => {
                logger.error(new Error(`failed to check channel state: ${e}`));
              });

            return 'voice channel does not allow bots';
          }
        }
      }
    }
  }

  // if (args.client.voice && args.newState.member) {
  //     const newVoiceConnection = args.client.voice.connections
  //         .find((connection: VoiceConnection) =>
  //             !!newChannel && connection.channel.id === newChannel.id);

  //     if (newVoiceConnection && !args.newState.member.user.bot) {
  //         clientTalk(args.client, pGuild, 'userConnected');
  //     }

  //     const oldVoiceConnection = args.client.voice.connections
  //         .find((connection: VoiceConnection) =>
  //             !!oldChannel && connection.channel.id === oldChannel.id);

  //     if (oldVoiceConnection && !args.newState.member.user.bot) {
  //         clientTalk(args.client, pGuild, 'userDisconnected');
  //     }
  // }

  if (!oldChannel) {
    const response = await fromNull(newChannel as VoiceChannel | null, pGuild, args.newState);

    if (!response) {
      return 'failed to create voice channel';
    }

    return `member-${args.newState?.member?.id}: ${response}`;
  } else {
    const response = await fromExisting(oldChannel as VoiceChannel, newChannel as VoiceChannel | null, args.client, pGuild, args.newState);

    if (!response) {
      return 'failed to create voice channel';
    }

    return `member-${args.oldState?.member?.id}: ${response}`;
  }
}

// delete portal's voice channel
async function deleteVoiceChannel(channel: VoiceChannel | TextChannel, pGuild: PGuild): Promise<string> {
  if (!channel.deletable) {
    return `channel ${channel.name} (${channel.id}) is not deletable`;
  }

  for (const pChannel of pGuild.pChannels) {
    for (const pVoiceChannel of pChannel.pVoiceChannels) {
      if (pVoiceChannel.id === channel.id) {
        try {
          const deletedChannel = await channel.delete();
          const response = await removeVoice(pGuild.id, pChannel.id, pVoiceChannel.id);

          return response ? `channel (${deletedChannel.id}) deleted` : `channel (${deletedChannel.id}) failed to be deleted`;
        } catch (e) {
          return `channel ${channel.name} (${channel.id}) failed to be delete`;
        }
      }
    }
  }

  return `no portal channels found for ${channel.name} (${channel.id})`;
}

async function fiveMinuteRefresher(voiceChannel: VoiceChannel, portalList: PChannel[], guild: Guild, minutes: number): Promise<void> {
  if (isGuildDeleted(guild) || isChannelDeleted(voiceChannel)) {
    logger.info(`voice channel with id ${voiceChannel.id} is deleted, stopping refreshers`);
    return;
  }

  const pGuild = await fetchGuild(guild.id)
    .catch(() => {
      logger.error(new Error('failed to fetch guild'));
    });

  if (!pGuild) {
    return;
  }

  generateChannelName(voiceChannel, portalList, pGuild, guild)
    .catch(() => {
      logger.error(new Error('failed to generate channel name'));
    });

  setTimeout(() => {
    if (!isGuildDeleted(guild) && !isChannelDeleted(voiceChannel)) {
      generateChannelName(voiceChannel, portalList, pGuild, guild)
        .catch(() => {
          logger.error(new Error('failed to generate channel name'));
        });

      fiveMinuteRefresher(voiceChannel, portalList, guild, minutes);
    }
  }, minutes * 60 * 1000);
}

async function channelEmptyCheck(
  oldChannel: VoiceChannel | TextChannel,
  pGuild: PGuild,
  client: Client
): Promise<string> {
  if (oldChannel.members.size === 0 && includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
    return await deleteVoiceChannel(oldChannel, pGuild)
      .catch((e) => {
        return `an error occurred while deleting voice | ${e}`;
      });
  } else if (oldChannel.members.size === 1) {
    if (!client.voice) {
      return 'Portal is not connected';
    }

    const voiceConnection = getVoiceConnection(oldChannel.guild.id);

    if (!voiceConnection || [VoiceConnectionStatus.Destroyed, VoiceConnectionStatus.Disconnected].includes(voiceConnection.state.status)) {
      return 'Portal is not connected';
    }

    pGuild.musicQueue = [];
    updateGuild(pGuild.id, 'musicQueue', pGuild.musicQueue)
      .catch((e) => {
        return `failed to update guild: ${e}`;
      });
    voiceConnection.disconnect();

    if (pGuild.musicData.pinned) {
      pGuild.musicData.pinned = false;
      setMusicData(pGuild.id, pGuild.musicData)
        .catch((e) => {
          return `failed to set music data: ${e}`;
        });
    }

    updateMusicMessage(
      oldChannel.guild,
      pGuild,
      pGuild.musicQueue.length > 0 ? pGuild.musicQueue[0] : undefined,
      'left last',
      false
    )
      .catch((e) => {
        return `failed to update music message: ${e}`;
      });

    updateMusicLyricsMessage(oldChannel.guild, pGuild, '')
      .catch((e) => {
        return `failed to update music lyrics: ${e}`;
      });

    if (includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
      return await deleteVoiceChannel(oldChannel, pGuild)
        .catch((e) => {
          return `an error occurred while deleting voice | ${e}`;
        });
    } else {
      return 'Portal left voice channel';
    }
  }

  return 'channel is not handled by Portal';
}

async function fromNull(newChannel: VoiceChannel | null, pGuild: PGuild, newState: VoiceState): Promise<string> {
  if (!newChannel) {
    return 'strange, from null to null';
  }

  // joined from null
  if (includedInPChannels(newChannel.id, pGuild.pChannels)) {
    // joined portal channel
    const pChannel = pGuild.pChannels.find((p) => p.id === newChannel.id);

    if (!pChannel) {
      return 'null->existing (source: null | dest: portalList) / could not find pChannel';
    }

    await createVoiceChannel(newState, pChannel)
      .catch((e) => {
        return `null->existing (source: null | dest: portalList): ${e}`;
      });

    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(new Error(`failed to send message: ${e}`));
      });

    if (level) {
      newState.member
        ?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });
    }

    return 'null->existing (source: null | dest: portalList)';
  } else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) {
    // joined voice channel
    fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);
    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(new Error(`failed to send message: ${e}`));
      });

    if (level) {
      newState.member
        ?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });
    }

    return 'null->existing (source: null | dest: voiceList)';
  } else {
    // joined other channel
    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(new Error(`failed to send message: ${e}`));
      });

    if (level) {
      newState.member
        ?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });
    }

    return 'null->existing (source: null | dest: other channel)';
  }
}

async function fromExisting(
  oldChannel: VoiceChannel,
  newChannel: VoiceChannel | null,
  client: Client,
  pGuild: PGuild,
  newState: VoiceState
): Promise<string> {
  if (newChannel === null) {
    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(new Error(`failed to send message: ${e}`));
      });

    if (level) {
      newState.member
        ?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });
    }

    channelEmptyCheck(oldChannel, pGuild, client)
      .catch((e) => {
        logger.error(new Error(`failed to check channel state: ${e}`));
      });

    return 'existing->null';
  }

  // Moved from channel to channel
  const level = await updateTimestamp(newState, pGuild) // points for voice
    .catch((e) => {
      logger.error(new Error(`failed to send message: ${e}`));
    });

  if (level) {
    newState.member
      ?.send(`you reached level ${level} in ${newState.guild}!`)
      .catch((e) => {
        logger.error(new Error(`failed to send message: ${e}`));
      });
  }

  if (includedInPChannels(oldChannel.id, pGuild.pChannels)) {
    if (!includedInVoiceList(newChannel.id, pGuild.pChannels)) {
      return 'not handled by portal';
    }

    // has been handled before
    await fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);

    return 'existing->existing (source: portalList | dest: voiceList) / has been handled before';
  } else if (includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
    await channelEmptyCheck(oldChannel, pGuild, client)
      .catch((e) => {
        logger.error(new Error(`failed to check channel state: ${e}`));
      });

    if (includedInPChannels(newChannel.id, pGuild.pChannels)) {
      // moved from voice to portal
      const pChannel = pGuild.pChannels.find((p) => p.id === newChannel.id);

      if (!pChannel) {
        return 'could not find Portal in database';
      }

      await createVoiceChannel(newState, pChannel)
        .catch((e) => {
          return `an error occurred while creating voice channel: ${e}`;
        });

      return 'existing->existing (source: voiceList | dest: portalList) has been handled before';
    } else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) {
      // moved from voice to voice
      await fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);

      return 'existing->existing (source: voiceList | dest: voiceList)';
    } else {
      // moved from voice to other refresher(newChannel, pGuild.portalList, newState.guild, 5);
      return 'existing->existing (source: voiceList | dest: other)';
    }
  } else {
    // Joined portal channel
    if (includedInPChannels(newChannel.id, pGuild.pChannels)) {
      const pChannel = pGuild.pChannels.find((p) => p.id === newChannel.id);

      if (!pChannel) {
        return 'existing->existing (source: other voice | dest: portalList) / could not find portal in DB, contact Portal support';
      }

      await createVoiceChannel(newState, pChannel)
        .catch((e) => {
          return `existing->existing (source: other voice | dest: portalList ): ${e}`;
        });

      return 'existing->existing (source: other voice | dest: portalList)';
    } else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) {
      // left created channel and joins another created
      await fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);
      return 'existing->existing (source: other voice | dest: voiceList)';
    }
  }

  return 'existing->existing (source: other voice | dest: voiceList)';
}
