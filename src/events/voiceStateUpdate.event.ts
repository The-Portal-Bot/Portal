import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { Client, Guild, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import { createVoiceChannel, generateChannelName, includedInPChannels, includedInVoiceList } from "../libraries/guild.library";
import { isChannelDeleted, isGuildDeleted, logger, updateMusicLyricsMessage, updateMusicMessage } from "../libraries/help.library";
// import { client_talk } from "../libraries/localisation.library";
import { fetchGuild, removeVoice, setMusicData, updateGuild } from "../libraries/mongo.library";
import { update_timestamp } from "../libraries/user.library";
import { PGuild } from "../types/classes/PGuild.class";
import { PChannel } from "../types/classes/PPortalChannel.class";

// delete portal's voice channel
async function delete_voice_channel(
    channel: VoiceChannel | TextChannel, pGuild: PGuild
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!channel.deletable) {
            return reject(`channel ${channel.name} (${channel.id}) is not deletable`);
        } else {
            pGuild.pChannels.some(p =>
                p.voiceList.some(v => {
                    if (v.id === channel.id) {
                        channel
                            .delete()
                            .then(deleted_channel => {
                                removeVoice(pGuild.id, p.id, v.id)
                                    .then(r => {
                                        if (r) {
                                            return resolve(`channel (${deleted_channel.id}) deleted`);
                                        } else {
                                            return reject(`channel (${deleted_channel.id}) failed to be deleted`);
                                        }
                                    })
                                    .catch(e => {
                                        return reject(`channel (${deleted_channel.id}) failed to be delete: ${e}`);
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

function five_min_refresher(
    voice_channel: VoiceChannel, portal_list: PChannel[],
    guild: Guild, minutes: number
): void {
    fetchGuild(guild.id)
        .then(pGuild => {
            if (pGuild) {
                generateChannelName(voice_channel, portal_list, pGuild, guild)
                    .catch((e: any) => {
                        logger.error(new Error(`failed to generate channel name: ${e}`));
                    });

                setTimeout(() => {
                    if (!isGuildDeleted(guild) && !isChannelDeleted(voice_channel)) {
                        generateChannelName(voice_channel, portal_list, pGuild, guild)
                            .catch((e: any) => {
                                logger.error(new Error(`failed to generate channel name: ${e}`));
                            });

                        five_min_refresher(voice_channel, portal_list, guild, minutes);
                    }
                }, minutes * 60 * 1000);
            }
        })
        .catch((e: any) => {
            logger.error(new Error(`failed to fetch guild: ${e}`));
        });
}

async function channel_empty_check(
    old_channel: VoiceChannel | TextChannel, pGuild: PGuild, client: Client
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (old_channel.members.size === 0) {
            if (includedInVoiceList(old_channel.id, pGuild.pChannels)) {
                delete_voice_channel(old_channel, pGuild)
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
        else if (old_channel.members.size === 1) {
            if (!client.voice) {
                return resolve(`Portal is not connected`);
            }

            const voiceConnection = getVoiceConnection(old_channel.guild.id);

            if (!voiceConnection) {
                return resolve(`Portal is not connected`);
            }

            pGuild.musicQueue = [];
            updateGuild(pGuild.id, 'music_queue', pGuild.musicQueue)
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
                old_channel.guild,
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

            updateMusicLyricsMessage(old_channel.guild, pGuild, '')
                .catch(e => {
                    return reject(`failed to update music lyrics: ${e}`);
                });

            if (includedInVoiceList(old_channel.id, pGuild.pChannels)) {
                delete_voice_channel(old_channel, pGuild)
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

async function from_null(
    new_channel: VoiceChannel | null, pGuild: PGuild, newState: VoiceState
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (new_channel) { // joined from null
            if (includedInPChannels(new_channel.id, pGuild.pChannels)) { // joined portal channel
                const portal_object = pGuild.pChannels
                    .find(p => p.id === new_channel.id);

                if (!portal_object) {
                    return reject('null->existing (source: null | dest: portal_list) / could not find portal_object');
                }

                createVoiceChannel(newState, portal_object)
                    .then(() => {
                        update_timestamp(newState, pGuild) // points for voice
                            .then(level => {
                                if (level) {
                                    newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                                        .catch((e: any) => {
                                            logger.error(new Error(`failed to send message: ${e}`));
                                        });
                                }
                            })
                            .catch((e: any) => {
                                logger.error(new Error(`failed to send message: ${e}`));
                            });

                        return resolve('null->existing (source: null | dest: portal_list)');
                    })
                    .catch(e => {
                        return reject(`null->existing (source: null | dest: portal_list): ${e}`);
                    });
            }
            else if (includedInVoiceList(new_channel.id, pGuild.pChannels)) { // joined voice channel
                five_min_refresher(new_channel, pGuild.pChannels, newState.guild, 5);
                update_timestamp(newState, pGuild) // points for voice
                    .then(level => {
                        if (level) {
                            newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                                .catch((e: any) => {
                                    logger.error(new Error(`failed to send message: ${e}`));
                                });
                        }
                    })
                    .catch((e: any) => {
                        logger.error(new Error(`failed to send message: ${e}`));
                    });

                return resolve('null->existing (source: null | dest: voice_list)');
            }
            else { // joined other channel
                update_timestamp(newState, pGuild) // points for voice
                    .then(level => {
                        if (level) {
                            newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                                .catch((e: any) => {
                                    logger.error(new Error(`failed to send message: ${e}`));
                                });
                        }
                    })
                    .catch((e: any) => {
                        logger.error(new Error(`failed to send message: ${e}`));
                    });

                return resolve('null->existing (source: null | dest: other channel)');
            }
        } else {
            return reject('strange, from null to null');
        }
    });
}

async function from_existing(
    old_channel: VoiceChannel, new_channel: VoiceChannel | null, client: Client,
    pGuild: PGuild, newState: VoiceState
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (new_channel === null) {
            update_timestamp(newState, pGuild) // points for voice
                .then(level => {
                    if (level) {
                        newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                            .catch((e: any) => {
                                logger.error(new Error(`failed to send message: ${e}`));
                            });
                    }
                })
                .catch((e: any) => {
                    logger.error(new Error(`failed to send message: ${e}`));
                });

            channel_empty_check(old_channel, pGuild, client)
                .catch(e => {
                    logger.error(new Error(`failed to check channel state: ${e}`));
                });

            return resolve('existing->null');
        }
        else if (new_channel !== null) { // Moved from channel to channel
            update_timestamp(newState, pGuild) // points for voice
                .then(level => {
                    if (level) {
                        newState.member?.send(`you reached level ${level} in ${newState.guild}!`)
                            .catch((e: any) => {
                                logger.error(new Error(`failed to send message: ${e}`));
                            });
                    }
                })
                .catch((e: any) => {
                    logger.error(new Error(`failed to send message: ${e}`));
                });

            if (includedInPChannels(old_channel.id, pGuild.pChannels)) {
                if (includedInVoiceList(new_channel.id, pGuild.pChannels)) { // has been handled before
                    five_min_refresher(new_channel, pGuild.pChannels, newState.guild, 5);

                    return resolve('existing->existing (source: portal_list | dest: voice_list) / has been handled before');
                } else {
                    return resolve('not handled by portal');
                }
            }
            else if (includedInVoiceList(old_channel.id, pGuild.pChannels)) {
                channel_empty_check(old_channel, pGuild, client)
                    .catch(e => {
                        logger.error(new Error(`failed to check channel state: ${e}`));
                    });

                if (includedInPChannels(new_channel.id, pGuild.pChannels)) { // moved from voice to portal
                    const portal_object = pGuild.pChannels
                        .find(p => p.id === new_channel.id);

                    if (!portal_object) {
                        return reject('could not find Portal in database');
                    }

                    createVoiceChannel(newState, portal_object)
                        .then(() => {
                            return resolve('existing->existing (source: voice_list | dest: portal_list) has been handled before');
                        })
                        .catch(e => {
                            return reject(`an error occurred while creating voice channel: ${e}`);
                        });
                }
                else if (includedInVoiceList(new_channel.id, pGuild.pChannels)) { // moved from voice to voice
                    five_min_refresher(new_channel, pGuild.pChannels, newState.guild, 5);

                    return resolve('existing->existing (source: voice_list | dest: voice_list)');
                }
                else { // moved from voice to otherefresher(new_channel, pGuild.portal_list, newState.guild, 5);

                    return resolve('existing->existing (source: voice_list | dest: other)');
                }
            }
            else {
                // Joined portal channel
                if (includedInPChannels(new_channel.id, pGuild.pChannels)) {
                    const portal_object = pGuild.pChannels
                        .find(p => p.id === new_channel.id);

                    if (!portal_object) {
                        return reject('existing->existing (source: other voice | dest: portal_list) / could not find portal in DB, contact Portal support');
                    }

                    createVoiceChannel(newState, portal_object)
                        .then(() => {
                            return resolve('existing->existing (source: other voice | dest: portal_list)');
                        })
                        .catch(e => {
                            return reject(`existing->existing (source: other voice | dest: portal_list ): ${e}`);
                        });
                }
                else if (includedInVoiceList(new_channel.id, pGuild.pChannels)) { // left created channel and joins another created
                    five_min_refresher(new_channel, pGuild.pChannels, newState.guild, 5);

                    return resolve('existing->existing (source: other voice | dest: voice_list)');
                }
            }
        }
    });
}

module.exports = async (
    args: { client: Client, newState: VoiceState, oldState: VoiceState }
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (args.newState?.guild) {
            const new_channel = args.newState.channel; // join channel
            const old_channel = args.oldState.channel; // left channel

            fetchGuild(args.newState?.guild.id)
                .then(pGuild => {
                    if (pGuild) {
                        if (new_channel) {
                            for (let i = 0; i < pGuild.pChannels.length; i++) {
                                const p = pGuild.pChannels[i];

                                if (p.id === new_channel.id) {
                                    if (p.noBots && args.newState.member?.user.bot) {
                                        args.newState
                                            .disconnect('voice channel does not allow bots')
                                            .catch(e => {
                                                return reject(`failed to kick: ${e}`);
                                            });

                                        channel_empty_check(new_channel as VoiceChannel, pGuild, args.client)
                                            .catch(e => {
                                                logger.error(new Error(`failed to check channel state: ${e}`));
                                            });

                                        return reject(`portal channel does not allow bots`);
                                    }
                                }

                                for (let i = 0; i < p.voiceList.length; i++) {
                                    const v = p.voiceList[i];

                                    if (v.id === new_channel.id) {
                                        if (v.no_bots) {
                                            args.newState
                                                .disconnect('voice channel does not allow bots')
                                                .catch(e => {
                                                    return reject(`failed to kick: ${e}`);
                                                });

                                            channel_empty_check(new_channel as VoiceChannel, pGuild, args.client)
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
                        //     const new_voice_connection = args.client.voice.connections
                        //         .find((connection: VoiceConnection) =>
                        //             !!new_channel && connection.channel.id === new_channel.id);

                        //     if (new_voice_connection && !args.newState.member.user.bot) {
                        //         client_talk(args.client, pGuild, 'user_connected');
                        //     }

                        //     const old_voice_connection = args.client.voice.connections
                        //         .find((connection: VoiceConnection) =>
                        //             !!old_channel && connection.channel.id === old_channel.id);

                        //     if (old_voice_connection && !args.newState.member.user.bot) {
                        //         client_talk(args.client, pGuild, 'user_disconnected');
                        //     }
                        // }

                        if (!old_channel) {
                            from_null(new_channel as VoiceChannel | null, pGuild, args.newState)
                                .then(r => {
                                    return resolve(r);
                                })
                                .catch(e => {
                                    return reject(e);
                                })
                        } else {
                            from_existing(old_channel as VoiceChannel, new_channel as VoiceChannel | null, args.client, pGuild, args.newState)
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
