import { getVoiceConnection } from "@discordjs/voice";
import { Client, Guild, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import { createVoiceChannel, generateChannelName, includedInPChannels, includedInVoiceList } from "../libraries/guild.library";
import { isChannelDeleted, isGuildDeleted, logger, updateMusicLyricsMessage, updateMusicMessage } from "../libraries/help.library";
// import { clientTalk } from "../libraries/localisation.library";
import { fetchGuild, removeVoice, setMusicData, updateGuild } from "../libraries/mongo.library";
import { updateTimestamp } from "../libraries/user.library";
import { PGuild } from "../types/classes/PGuild.class";
import { PChannel } from "../types/classes/PPortalChannel.class";

// delete portal's voice channel
async function deleteVoiceChannel(
  channel: VoiceChannel | TextChannel, pGuild: PGuild
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!channel.deletable) {
      return reject(`channel ${channel.name} (${channel.id}) is not deletable`);
    } else {
      pGuild.pChannels.some(p =>
        p.pVoiceChannels.some(v => {
          if (v.id === channel.id) {
            channel
              .delete()
              .then(deletedChannel => {
                removeVoice(pGuild.id, p.id, v.id)
                  .then(r => {
                    if (r) {
                      return resolve(`channel (${deletedChannel.id}) deleted`);
                    } else {
                      return reject(`channel (${deletedChannel.id}) failed to be deleted`);
                    }
                  })
                  .catch(e => {
                    return reject(`channel (${deletedChannel.id}) failed to be delete: ${e}`);
                  });
              })
              .catch(e => {
                return reject(`channel ${channel.name} (${channel.id}) failed to be delete: ${e}`);
              });

            return true;
          }

          return false;
        })
      );
    }
  });
}

function fiveMinuteRefresher(
  voiceChannel: VoiceChannel, portalList: PChannel[],
  guild: Guild, minutes: number
): void {
  fetchGuild(guild.id)
    .then(pGuild => {
      if (pGuild) {
        generateChannelName(voiceChannel, portalList, pGuild, guild)
          .catch((e) => {
            logger.error(new Error(`failed to generate channel name: ${e}`));
          });

        setTimeout(() => {
          if (!isGuildDeleted(guild) && !isChannelDeleted(voiceChannel)) {
            generateChannelName(voiceChannel, portalList, pGuild, guild)
              .catch((e) => {
                logger.error(new Error(`failed to generate channel name: ${e}`));
              });

            fiveMinuteRefresher(voiceChannel, portalList, guild, minutes);
          }
        }, minutes * 60 * 1000);
      }
    })
    .catch((e) => {
      logger.error(new Error(`failed to fetch guild: ${e}`));
    });
}

async function channelEmptyCheck(
  oldChannel: VoiceChannel | TextChannel, pGuild: PGuild, client: Client
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (oldChannel.members.size === 0) {
      if (includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
        deleteVoiceChannel(oldChannel, pGuild)
          .then(response => {
            return resolve(response);
          })
          .catch(e => {
            return reject(`an error occurred while deleting voice | ${e}`);
          });
      } else {
        return resolve(`channel is not handled by Portal`);
      }
    }
    else if (oldChannel.members.size === 1) {
      if (!client.voice) {
        return resolve(`Portal is not connected`);
      }

      const voiceConnection = getVoiceConnection(oldChannel.guild.id);

      if (!voiceConnection) {
        return resolve(`Portal is not connected`);
      }

      pGuild.musicQueue = [];
      updateGuild(pGuild.id, 'musicQueue', pGuild.musicQueue)
        .catch(e => {
          return reject(`failed to update guild: ${e}`);
        });
      voiceConnection.disconnect();

      if (pGuild.musicData.pinned) {
        pGuild.musicData.pinned = false;
        setMusicData(pGuild.id, pGuild.musicData)
          .catch(e => {
            return reject(`failed to set music data: ${e}`);
          });
      }

      updateMusicMessage(
        oldChannel.guild,
        pGuild,
        pGuild.musicQueue.length > 0
          ? pGuild.musicQueue[0]
          : undefined,
        'left last',
        false
      )
        .catch(e => {
          return reject(`failed to update music message: ${e}`);
        });

      updateMusicLyricsMessage(oldChannel.guild, pGuild, '')
        .catch(e => {
          return reject(`failed to update music lyrics: ${e}`);
        });

      if (includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
        deleteVoiceChannel(oldChannel, pGuild)
          .then(response => {
            return resolve(response);
          })
          .catch(e => {
            return reject(`an error occurred while deleting voice | ${e}`)
          });
      } else {
        return resolve('Portal left voice channel');
      }

    }
  });
}

async function fromNull(
  newChannel: VoiceChannel | null, pGuild: PGuild, newState: VoiceState
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (newChannel) { // joined from null
      if (includedInPChannels(newChannel.id, pGuild.pChannels)) { // joined portal channel
        const pChannel = pGuild.pChannels
          .find(p => p.id === newChannel.id);

        if (!pChannel) {
          return reject('null->existing (source: null | dest: portalList) / could not find pChannel');
        }

        createVoiceChannel(newState, pChannel)
          .then(() => {
            updateTimestamp(newState, pGuild) // points for voice
              .then(level => {
                if (level) {
                  newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                    .catch((e) => {
                      logger.error(new Error(`failed to send message: ${e}`));
                    });
                }
              })
              .catch((e) => {
                logger.error(new Error(`failed to send message: ${e}`));
              });

            return resolve('null->existing (source: null | dest: portalList)');
          })
          .catch(e => {
            return reject(`null->existing (source: null | dest: portalList): ${e}`);
          });
      }
      else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) { // joined voice channel
        fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);
        updateTimestamp(newState, pGuild) // points for voice
          .then(level => {
            if (level) {
              newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                .catch((e) => {
                  logger.error(new Error(`failed to send message: ${e}`));
                });
            }
          })
          .catch((e) => {
            logger.error(new Error(`failed to send message: ${e}`));
          });

        return resolve('null->existing (source: null | dest: voiceList)');
      }
      else { // joined other channel
        updateTimestamp(newState, pGuild) // points for voice
          .then(level => {
            if (level) {
              newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                .catch((e) => {
                  logger.error(new Error(`failed to send message: ${e}`));
                });
            }
          })
          .catch((e) => {
            logger.error(new Error(`failed to send message: ${e}`));
          });

        return resolve('null->existing (source: null | dest: other channel)');
      }
    } else {
      return reject('strange, from null to null');
    }
  });
}

async function fromExisting(
  oldChannel: VoiceChannel, newChannel: VoiceChannel | null, client: Client,
  pGuild: PGuild, newState: VoiceState
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (newChannel === null) {
      updateTimestamp(newState, pGuild) // points for voice
        .then(level => {
          if (level) {
            newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
              .catch((e) => {
                logger.error(new Error(`failed to send message: ${e}`));
              });
          }
        })
        .catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });

      channelEmptyCheck(oldChannel, pGuild, client)
        .catch(e => {
          logger.error(new Error(`failed to check channel state: ${e}`));
        });

      return resolve('existing->null');
    }
    else if (newChannel !== null) { // Moved from channel to channel
      updateTimestamp(newState, pGuild) // points for voice
        .then(level => {
          if (level) {
            newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
              .catch((e) => {
                logger.error(new Error(`failed to send message: ${e}`));
              });
          }
        })
        .catch((e) => {
          logger.error(new Error(`failed to send message: ${e}`));
        });

      if (includedInPChannels(oldChannel.id, pGuild.pChannels)) {
        if (includedInVoiceList(newChannel.id, pGuild.pChannels)) { // has been handled before
          fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);

          return resolve('existing->existing (source: portalList | dest: voiceList) / has been handled before');
        } else {
          return resolve('not handled by portal');
        }
      }
      else if (includedInVoiceList(oldChannel.id, pGuild.pChannels)) {
        channelEmptyCheck(oldChannel, pGuild, client)
          .catch(e => {
            logger.error(new Error(`failed to check channel state: ${e}`));
          });

        if (includedInPChannels(newChannel.id, pGuild.pChannels)) { // moved from voice to portal
          const pChannel = pGuild.pChannels
            .find(p => p.id === newChannel.id);

          if (!pChannel) {
            return reject('could not find Portal in database');
          }

          createVoiceChannel(newState, pChannel)
            .then(() => {
              return resolve('existing->existing (source: voiceList | dest: portalList) has been handled before');
            })
            .catch(e => {
              return reject(`an error occurred while creating voice channel: ${e}`);
            });
        }
        else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) { // moved from voice to voice
          fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);

          return resolve('existing->existing (source: voiceList | dest: voiceList)');
        }
        else { // moved from voice to otherefresher(newChannel, pGuild.portalList, newState.guild, 5);

          return resolve('existing->existing (source: voiceList | dest: other)');
        }
      }
      else {
        // Joined portal channel
        if (includedInPChannels(newChannel.id, pGuild.pChannels)) {
          const pChannel = pGuild.pChannels
            .find(p => p.id === newChannel.id);

          if (!pChannel) {
            return reject('existing->existing (source: other voice | dest: portalList) / could not find portal in DB, contact Portal support');
          }

          createVoiceChannel(newState, pChannel)
            .then(() => {
              return resolve('existing->existing (source: other voice | dest: portalList)');
            })
            .catch(e => {
              return reject(`existing->existing (source: other voice | dest: portalList ): ${e}`);
            });
        }
        else if (includedInVoiceList(newChannel.id, pGuild.pChannels)) { // left created channel and joins another created
          fiveMinuteRefresher(newChannel, pGuild.pChannels, newState.guild, 5);

          return resolve('existing->existing (source: other voice | dest: voiceList)');
        }
      }
    }
  });
}

export default async (
  args: { client: Client, newState: VoiceState, oldState: VoiceState }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (args.newState?.guild) {
      const newChannel = args.newState.channel; // join channel
      const oldChannel = args.oldState.channel; // left channel

      fetchGuild(args.newState?.guild.id)
        .then(pGuild => {
          if (pGuild) {
            if (newChannel) {
              for (let i = 0; i < pGuild.pChannels.length; i++) {
                const p = pGuild.pChannels[i];

                if (p.id === newChannel.id) {
                  if (p.noBots && args.newState.member?.user.bot) {
                    args.newState
                      .disconnect('voice channel does not allow bots')
                      .catch(e => {
                        return reject(`failed to kick: ${e}`);
                      });

                    channelEmptyCheck(newChannel as VoiceChannel, pGuild, args.client)
                      .catch(e => {
                        logger.error(new Error(`failed to check channel state: ${e}`));
                      });

                    return reject(`portal channel does not allow bots`);
                  }
                }

                for (let i = 0; i < p.pVoiceChannels.length; i++) {
                  const v = p.pVoiceChannels[i];

                  if (v.id === newChannel.id) {
                    if (v.noBots) {
                      args.newState
                        .disconnect('voice channel does not allow bots')
                        .catch(e => {
                          return reject(`failed to kick: ${e}`);
                        });

                      channelEmptyCheck(newChannel as VoiceChannel, pGuild, args.client)
                        .catch(e => {
                          logger.error(new Error(`failed to check channel state: ${e}`));
                        });

                      return reject(`voice channel does not allow bots`);
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
              fromNull(newChannel as VoiceChannel | null, pGuild, args.newState)
                .then(r => {
                  return resolve(r);
                })
                .catch(e => {
                  return reject(e);
                })
            } else {
              fromExisting(oldChannel as VoiceChannel, newChannel as VoiceChannel | null, args.client, pGuild, args.newState)
                .then(r => {
                  return resolve(r);
                })
                .catch(e => {
                  return reject(e);
                });
            }
          } else {
            return reject('could not find guild in Portal');
          }
        })
        .catch(e => {
          return reject(`could not find guild in Portal (${e})`);
        });
    } else {
      return reject('could fnot find guild in Portal');
    }
  });
}
