import {
  getVoiceConnection,
  VoiceConnectionStatus,
} from "npm:@discordjs/voice";
import type {
  Client,
  Guild,
  TextChannel,
  VoiceChannel,
  VoiceState,
} from "npm:discord.js";

import {
  createVoiceChannel,
  generateChannelName,
  includedInPChannels,
  includedInVoiceList,
} from "../libraries/guild.library.ts";
import {
  isChannelDeleted,
  isGuildDeleted,
  updateMusicLyricsMessage,
  updateMusicMessage,
} from "../libraries/help.library.ts";
import {
  fetchGuild,
  removeVoice,
  setMusicData,
  updateGuild,
} from "../libraries/mongo.library.ts";
import { updateTimestamp } from "../libraries/user.library.ts";
import type { PGuild } from "../types/classes/PGuild.class.ts";
import type { PChannel } from "../types/classes/PPortalChannel.class.ts";
import logger from "../utilities/log.utility.ts";

export async function voiceStateUpdate(
  client: Client,
  oldState: VoiceState,
  newState: VoiceState,
): Promise<void> {
  logger.info(
    `voiceStateUpdate event triggered with ${oldState.channelId} to ${newState.channelId}`,
  );
  if (newState.channel?.id === oldState.channel?.id) {
    return;
  }

  if (!newState?.guild) {
    logger.warn("could not find guild in Portal");
    return;
  }

  const newChannel = newState.channel; // join channel
  const oldChannel = oldState.channel; // left channel

  const pGuild = await fetchGuild(newState?.guild.id);

  if (!pGuild) {
    logger.warn("could not find guild in Portal");
    return;
  }

  if (!pGuild) {
    logger.warn("could not find guild in Portal");
    return;
  }

  if (newChannel) {
    for (let i = 0; i < pGuild.pChannels.length; i++) {
      const p = pGuild.pChannels[i];

      if (p.id === newChannel.id) {
        if (p.noBots && newState.member?.user.bot) {
          newState.disconnect("voice channel does not allow bots").catch(
            (e) => {
              logger.error(`failed to kick: ${e}`);
              return;
            },
          );

          channelEmptyCheck(newChannel as VoiceChannel, pGuild, client).catch(
            (e) => {
              logger.error(`failed to check channel state: ${e}`);
            },
          );

          logger.warn("portal channel does not allow bots");
          return;
        }
      }

      for (let i = 0; i < p.pVoiceChannels.length; i++) {
        const v = p.pVoiceChannels[i];

        if (v.id === newChannel.id) {
          if (v.noBots) {
            newState.disconnect("voice channel does not allow bots").catch(
              (e) => {
                logger.error(`failed to kick: ${e}`);
                return;
              },
            );

            channelEmptyCheck(newChannel as VoiceChannel, pGuild, client).catch(
              (e) => {
                logger.error(`failed to check channel state: ${e}`);
              },
            );

            logger.warn("voice channel does not allow bots");
            return;
          }
        }
      }
    }
  }

  // if (client.voice && newState.member) {
  //   const newVoiceConnection = client.voice.connections
  //     .find((connection: VoiceConnection) =>
  //       !!newChannel && connection.channel.id === newChannel.id);

  //   if (newVoiceConnection && !newState.member.user.bot) {
  //     clientTalk(client, pGuild, 'userConnected');
  //   }

  //   const oldVoiceConnection = client.voice.connections
  //     .find((connection: VoiceConnection) =>
  //       !!oldChannel && connection.channel.id === oldChannel.id);

  //   if (oldVoiceConnection && !newState.member.user.bot) {
  //     clientTalk(client, pGuild, 'userDisconnected');
  //   }
  // }

  if (!oldChannel) {
    const response = await fromNull(
      newChannel as VoiceChannel | null,
      pGuild,
      newState,
    );

    if (!response) {
      logger.warn("failed to create voice channel");
      return;
    }

    logger.info(`member-${newState?.member?.id}: ${response}`);
    return;
  } else {
    const response = await fromExisting(
      oldChannel as VoiceChannel,
      newChannel as VoiceChannel | null,
      client,
      pGuild,
      newState,
    );

    if (!response) {
      logger.warn("failed to create voice channel");
      return;
    }

    logger.info(`member-${oldState?.member?.id}: ${response}`);
    return;
  }
}

// delete portal's voice channel
async function deleteVoiceChannel(
  channel: VoiceChannel | TextChannel,
  pGuild: PGuild,
): Promise<string> {
  if (!channel.deletable) {
    return `channel ${channel.name} (${channel.id}) is not deletable`;
  }

  for (const pChannel of pGuild.pChannels) {
    for (const pVoiceChannel of pChannel.pVoiceChannels) {
      if (pVoiceChannel.id === channel.id) {
        try {
          const deletedChannel = await channel.delete();
          const response = await removeVoice(
            pGuild.id,
            pChannel.id,
            pVoiceChannel.id,
          );

          return response
            ? `channel (${deletedChannel.id}) deleted`
            : `channel (${deletedChannel.id}) failed to be deleted`;
        } catch (e) {
          logger.error(`failed to delete channel: ${e}`);
          return `channel ${channel.name} (${channel.id}) failed to be delete`;
        }
      }
    }
  }

  return `no portal channels found for ${channel.name} (${channel.id})`;
}

async function fiveMinuteRefresher(
  voiceChannel: VoiceChannel,
  portalList: PChannel[],
  guild: Guild,
  minutes: number,
): Promise<void> {
  if (isGuildDeleted(guild) || isChannelDeleted(voiceChannel)) {
    logger.info(
      `voice channel with id ${voiceChannel.id} is deleted, stopping refreshers`,
    );
    return;
  }

  const pGuild = await fetchGuild(guild.id).catch(() => {
    logger.error("failed to fetch guild");
  });

  if (!pGuild) {
    return;
  }

  generateChannelName(voiceChannel, portalList, pGuild, guild).catch(() => {
    logger.error("failed to generate channel name");
  });

  setTimeout(
    () => {
      if (!isGuildDeleted(guild) && !isChannelDeleted(voiceChannel)) {
        generateChannelName(voiceChannel, portalList, pGuild, guild).catch(
          () => {
            logger.error("failed to generate channel name");
          },
        );

        fiveMinuteRefresher(voiceChannel, portalList, guild, minutes);
      }
    },
    minutes * 60 * 1000,
  );
}

async function channelEmptyCheck(
  oldChannel: VoiceChannel | TextChannel,
  pGuild: PGuild,
  client: Client,
): Promise<string> {
  if (
    oldChannel.members.size === 0 &&
    includedInVoiceList(oldChannel.id, pGuild.pChannels)
  ) {
    return await deleteVoiceChannel(oldChannel, pGuild).catch((e) => {
      return `an error occurred while deleting voice | ${e}`;
    });
  } else if (oldChannel.members.size === 1) {
    if (!client.voice) {
      return "Portal is not connected";
    }

    const voiceConnection = getVoiceConnection(oldChannel.guild.id);

    if (
      !voiceConnection ||
      [VoiceConnectionStatus.Destroyed, VoiceConnectionStatus.Disconnected]
        .includes(voiceConnection.state.status)
    ) {
      return "Portal is not connected";
    }

    pGuild.musicQueue = [];
    updateGuild(pGuild.id, "musicQueue", pGuild.musicQueue).catch((e) => {
      return `failed to update guild: ${e}`;
    });
    voiceConnection.disconnect();

    if (pGuild.musicData.pinned) {
      pGuild.musicData.pinned = false;
      setMusicData(pGuild.id, pGuild.musicData).catch((e) => {
        return `failed to set music data: ${e}`;
      });
    }

    updateMusicMessage(
      oldChannel.guild,
      pGuild,
      pGuild.musicQueue.length > 0 ? pGuild.musicQueue[0] : undefined,
      "left last",
      false,
    ).catch((e) => {
      return `failed to update music message: ${e}`;
    });

    updateMusicLyricsMessage(oldChannel.guild, pGuild, "").catch((e) => {
      return `failed to update music lyrics: ${e}`;
    });

    if (includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
      return await deleteVoiceChannel(oldChannel, pGuild).catch((e) => {
        return `an error occurred while deleting voice | ${e}`;
      });
    } else {
      return "Portal left voice channel";
    }
  }

  return "channel is not handled by Portal";
}

async function fromNull(
  newChannel: VoiceChannel | null,
  pGuild: PGuild,
  newState: VoiceState,
): Promise<string> {
  if (!newChannel) {
    return "strange, from null to null";
  }

  // joined from null
  if (includedInPChannels(newChannel.id, pGuild.pChannels)) {
    // joined portal channel
    const pChannel = pGuild.pChannels.find((p) => p.id === newChannel.id);

    if (!pChannel) {
      return "null->existing (source: null | dest: portalList) / could not find pChannel";
    }

    await createVoiceChannel(newState, pChannel).catch((e) => {
      return `null->existing (source: null | dest: portalList): ${e}`;
    });

    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(`failed to send message: ${e}`);
      });

    if (level) {
      newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(`failed to send message: ${e}`);
        });
    }

    return "null->existing (source: null | dest: portalList)";
  } else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) {
    // joined voice channel
    fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);
    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(`failed to send message: ${e}`);
      });

    if (level) {
      newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(`failed to send message: ${e}`);
        });
    }

    return "null->existing (source: null | dest: voiceList)";
  } else {
    // joined other channel
    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(`failed to send message: ${e}`);
      });

    if (level) {
      newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(`failed to send message: ${e}`);
        });
    }

    return "null->existing (source: null | dest: other channel)";
  }
}

async function fromExisting(
  oldChannel: VoiceChannel,
  newChannel: VoiceChannel | null,
  client: Client,
  pGuild: PGuild,
  newState: VoiceState,
): Promise<string> {
  if (newChannel === null) {
    const level = await updateTimestamp(newState, pGuild) // points for voice
      .catch((e) => {
        logger.error(`failed to send message: ${e}`);
      });

    if (level) {
      newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
        .catch((e) => {
          logger.error(`failed to send message: ${e}`);
        });
    }

    channelEmptyCheck(oldChannel, pGuild, client).catch((e) => {
      logger.error(`failed to check channel state: ${e}`);
    });

    return "existing->null";
  }

  // Moved from channel to channel
  const level = await updateTimestamp(newState, pGuild) // points for voice
    .catch((e) => {
      logger.error(`failed to send message: ${e}`);
    });

  if (level) {
    newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
      .catch((e) => {
        logger.error(`failed to send message: ${e}`);
      });
  }

  if (includedInPChannels(oldChannel.id, pGuild.pChannels)) {
    if (!includedInVoiceList(newChannel.id, pGuild.pChannels)) {
      return "not handled by portal";
    }

    // has been handled before
    await fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);

    return "existing->existing (source: portalList | dest: voiceList) / has been handled before";
  } else if (includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
    await channelEmptyCheck(oldChannel, pGuild, client).catch((e) => {
      logger.error(`failed to check channel state: ${e}`);
    });

    if (includedInPChannels(newChannel.id, pGuild.pChannels)) {
      // moved from voice to portal
      const pChannel = pGuild.pChannels.find((p) => p.id === newChannel.id);

      if (!pChannel) {
        return "could not find Portal in database";
      }

      await createVoiceChannel(newState, pChannel).catch((e) => {
        return `an error occurred while creating voice channel: ${e}`;
      });

      return "existing->existing (source: voiceList | dest: portalList) has been handled before";
    } else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) {
      // moved from voice to voice
      await fiveMinuteRefresher(
        newChannel,
        pGuild.pChannels,
        newState.guild,
        5,
      );

      return "existing->existing (source: voiceList | dest: voiceList)";
    } else {
      // moved from voice to other refresher(newChannel, pGuild.portalList, newState.guild, 5);
      return "existing->existing (source: voiceList | dest: other)";
    }
  } else {
    // Joined portal channel
    if (includedInPChannels(newChannel.id, pGuild.pChannels)) {
      const pChannel = pGuild.pChannels.find((p) => p.id === newChannel.id);

      if (!pChannel) {
        return "existing->existing (source: other voice | dest: portalList) / could not find portal in DB, contact Portal support";
      }

      await createVoiceChannel(newState, pChannel).catch((e) => {
        return `existing->existing (source: other voice | dest: portalList ): ${e}`;
      });

      return "existing->existing (source: other voice | dest: portalList)";
    } else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) {
      // left created channel and joins another created
      await fiveMinuteRefresher(
        newChannel,
        pGuild.pChannels,
        newState.guild,
        5,
      );
      return "existing->existing (source: other voice | dest: voiceList)";
    }
  }

  return "existing->existing (source: other voice | dest: voiceList)";
}
