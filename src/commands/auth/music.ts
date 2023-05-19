import { SlashCommandBuilder } from '@discordjs/builders';
import { Message, TextChannel } from "discord.js";
import { PortalChannelTypes } from "../../data/enums/PortalChannel.enum";
import { createMusicChannel, deleteChannel, isAnnouncementChannel, isMusicChannel, isUrlOnlyChannel } from "../../libraries/guild.library";
import { createMusicLyricsMessage, createMusicMessage, logger, messageHelp } from "../../libraries/help.library";
import { setMusicData } from "../../libraries/mongo.library";
import { PGuild, MusicData } from "../../types/classes/PGuild.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('create music channel'),
    async execute(
        message: Message, args: string[], pGuild: PGuild
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            if (!message.guild) {
                return resolve({
                    result: false,
                    value: 'message\'s guild could not be fetched'
                });
            }

            if (args.length === 0) {
                if (isMusicChannel(message.channel.id, pGuild)) {
                    const music_data = new MusicData('null', 'null', 'null', [], false);
                    setMusicData(pGuild.id, music_data)
                        .then(() => {
                            return resolve({
                                result: true,
                                value: 'successfully removed music channel'
                            });
                        })
                        .catch(() => {
                            return resolve({
                                result: false,
                                value: 'failed to remove music channel'
                            });
                        });
                }
                if (isAnnouncementChannel(message.channel.id, pGuild)) {
                    return resolve({
                        result: false,
                        value: 'this can\'t be set as the music channel for it is the announcement channel'
                    });
                }
                if (isUrlOnlyChannel(message.channel.id, pGuild)) {
                    return resolve({
                        result: false,
                        value: 'this can\'t be set as the Music channel for it is an url channel'
                    });
                }
            }

            const music = message.guild.channels.cache.find(channel =>
                channel.id == pGuild.musicData.channelId);

            if (music) {
                deleteChannel(PortalChannelTypes.music, <TextChannel>music, message)
                    .catch((e: any) => {
                        return resolve({
                            result: false,
                            value: `failed to delete channel: ${e}`
                        });
                    });
            }

            if (args.length === 0) {
                pGuild.musicData.channelId = message.channel.id;
                const new_music = <TextChannel>message.guild.channels.cache.find(channel =>
                    channel.id == pGuild.musicData.channelId);

                if (!new_music) {
                    return resolve({
                        result: false,
                        value: 'channel could not be fetched'
                    });
                }

                createMusicMessage(new_music, pGuild)
                    .then(music_message_id => {
                        logger.log({ level: 'info', type: 'none', message: `created music message ${music_message_id}` });
                        createMusicLyricsMessage(new_music, pGuild, music_message_id)
                            .then(lyrics_message_id => {
                                logger.log({ level: 'info', type: 'none', message: `created lyrics message ${lyrics_message_id}` });
                                return resolve({
                                    result: false,
                                    value: `created lyrics message`,
                                });
                            })
                            .catch(e => {
                                logger.log({ level: 'error', type: 'none', message: new Error(`error creating lyrics message: ${e}`).message });
                                return resolve({
                                    result: false,
                                    value: `error creating lyrics message: ${e}`,
                                });
                            });
                    })
                    .catch(e => {
                        logger.log({ level: 'error', type: 'none', message: `failed to send music message: ${e}` });
                        return resolve({
                            result: false,
                            value: `failed to send music message: ${e}`,
                        });
                    });

                return resolve({
                    result: true,
                    value: 'this is now the Music channel'
                });
            }
            else if (args.length > 0) {
                const music_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
                const music_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

                let result = false;
                let value = null;

                if (music_channel !== '') {
                    createMusicChannel(message.guild, music_channel, music_category, pGuild)
                        .catch((e: any) => {
                            return resolve({
                                result: false,
                                value: `failed to create music channel: ${e}`
                            });
                        });
                    result = true;
                    value = 'music channel and category have been created';
                }
                else if (music_channel === '' && music_category !== '') {
                    createMusicChannel(message.guild, music_category, null, pGuild)
                        .catch((e: any) => {
                            return resolve({
                                result: false,
                                value: `failed to create music channel: ${e}`
                            });
                        });
                    result = true;
                    value = 'music channel has been created';
                }
                else {
                    return resolve({
                        result: false,
                        value: messageHelp('commands', 'music')
                    });
                }

                return resolve({
                    result: result,
                    value: value
                });
            }
        });
    }
};