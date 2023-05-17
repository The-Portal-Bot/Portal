import { Message } from "discord.js";
import { PGuild, MusicData } from "../types/classes/PGuild.class";
import { CommandOptions } from "../types/classes/PTypes.interface";
import { isUrlOnlyChannel, includedInIgnoreList } from "./guild.library";
import { logger, isUserIgnored, isMessageDeleted, markMessageAsDeleted, messageReply } from "./help.library";
import { remove_url, remove_ignore, set_music_data } from "./mongo.library";
import { add_points_message } from "./user.library";
import command_config_json from '../config.command.json';

/*
* Returns: true/false if processing must continue
*/
export async function portalPreprocessor(
    message: Message, guild_object: PGuild
): Promise<boolean> {
    if (!message.member) {
        logger.error(new Error('could not get member'));
        return true;
    }

    if (isUserIgnored(message.member)) {
        if (!handleUrlChannels(message, guild_object)) {
            if (guild_object.music_data.channel_id === message.channel.id) {
                message.member
                    .send('you can\'t play music when ignored')
                    .catch((e: any) => {
                        logger.error(new Error(`failed to send message: ${e}`));
                    });

                if (isMessageDeleted(message)) {
                    const deletedMessage = await message
                        .delete()
                        .catch((e: any) => {
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
        if (await handleUrlChannels(message, guild_object)) {
            return true;
        }
        else if (handleIgnoredChannels(message, guild_object)) {
            handleRankingSystem(message, guild_object);
            return true;
        }
        else if (handleMusicChannels(message, guild_object)) {
            handleRankingSystem(message, guild_object);
            return true;
        } else {
            handleRankingSystem(message, guild_object);

            // if (guild_object.profanity_level !== ProfanityLevelEnum.none) {
            //     // profanity check
            //     const profanities = isProfane(message.content, guild_object.profanity_level);
            //     if (profanities.length > 0) {
            //         message
            //             .react('🚩')
            //             .catch((e: any) => {
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

export function commandDecypher(
    message: Message, guild_object: PGuild
): {
    args: string[],
    cmd: string,
    path_to_command: string,
    command_options: CommandOptions | undefined,
    type: string
} {
    // separate command name and arguments
    const args = message.content.slice(guild_object.prefix.length).trim().split(/ +/g);

    const cmd_only = args.shift();
    if (!cmd_only) {
        return {
            args: [],
            cmd: '',
            path_to_command: '',
            command_options: undefined,
            type: ''
        };
    }
    const cmd = cmd_only.toLowerCase();

    let path_to_command = '';
    let command_options: CommandOptions | undefined = undefined;
    let type = 'none';

    command_config_json.some(category => {
        command_options = category.commands.
            find(command => command.name === cmd);

        if (command_options) {
            type = command_options.range;
            path_to_command = category.path;

            return true;
        }

        return false;
    });

    return {
        args: args,
        cmd: cmd,
        path_to_command: path_to_command,
        command_options: command_options,
        type: type
    };
}

export function handleRankingSystem(
    message: Message, guild_object: PGuild
): void {
    add_points_message(message, guild_object.member_list[0], guild_object.rank_speed)
        .then(level => {
            if (level) {
                messageReply(true, message, `you reached level ${level}!`)
                    .catch((e: any) => {
                        logger.error(new Error(`failed to send message: ${e}`));
                    });
            }
        })
        .catch(e => {
            logger.error(new Error(e));
        });
}

export async function handleUrlChannels(
    message: Message, guild_object: PGuild
): Promise<boolean> {
    if (isUrlOnlyChannel(message.channel.id, guild_object)) {
        if (message.content === './url') {
            remove_url(guild_object.id, message.channel.id)
                .then(r => {
                    messageReply(true, message, `removed url channel ${r ? 'successfully' : 'unsuccessfully'}`)
                        .catch((e: any) => {
                            logger.error(new Error(`failed to send message: ${e}`));
                        });
                })
                .catch(e => {
                    logger.error(new Error(`failed to remove url channel: ${e}`));
                });
        }
        else {
            message.author
                .send(`${message.channel} is a url-only channel`)
                .catch(e => {
                    logger.error(new Error(`failed to remove url channel: ${e}`));
                });

            if (isMessageDeleted(message)) {
                const deletedMessage = await message
                    .delete()
                    .catch((e: any) => {
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

export function handleIgnoredChannels(
    message: Message, guild_object: PGuild
): boolean {
    if (includedInIgnoreList(message.channel.id, guild_object)) {
        if (message.content === './ignore') {
            remove_ignore(guild_object.id, message.channel.id)
                .then(r => {
                    messageReply(true, message, `removed from ignored channels ${r ? 'successfully' : 'unsuccessfully'}`)
                        .catch((e: any) => {
                            logger.error(new Error(`failed to send message: ${e}`));
                        });
                })
                .catch(e => {
                    logger.error(new Error(`failed to remove ignored channel: ${e}`));
                });
        }

        return true;
    }

    return false;
}

export function handleMusicChannels(
    message: Message, guild_object: PGuild
): boolean {
    if (guild_object.music_data.channel_id === message.channel.id) {
        if (message.content === './music') {
            if (!message.guild) {
                logger.error(new Error(`failed to get guild from message`));
                return true;
            }

            const music_data = new MusicData('null', 'null', 'null', [], false);
            set_music_data(guild_object.id, music_data)
                .then(r => {
                    messageReply(true, message, `removed from ignored channels ${r ? 'successfully' : 'unsuccessfully'}`)
                        .catch((e: any) => logger.error(new Error(`failed to send message: ${e}`)));
                })
                .catch(e => logger.error(new Error(`failed to remove music channel: ${e}`)));
        } else {
            // if (!message.guild || !message.member) {
            //     if (message.deletable) {
            //         message
            //             .delete()
            //             .catch((e: any) => logger.error(new Error(`failed to delete message: ${e}`)));
            //     }

            //     return false;
            // }

            // const portal_voice_connection = client.voice?.connections
            //     .find(c => c.channel.guild.id === message.guild?.id);

            // if (portal_voice_connection) {
            //     if (!portal_voice_connection.channel.members.has(message.member.id)) {
            //         if (message.guild) {
            //             const portal_voice_connection = client.voice?.connections
            //                 .find(c => c.channel.guild.id === message.guild?.id);

            //             const animate = portal_voice_connection?.dispatcher
            //                 ? !portal_voice_connection?.dispatcher.paused
            //                 : false;

            //             update_music_message(
            //                 message.guild,
            //                 guild_object,
            //                 guild_object.music_queue.length > 0
            //                     ? guild_object.music_queue[0]
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
            //                 .catch((e: any) => {
            //                     logger.error(new Error(`failed to send message: ${e}`));
            //                 });
            //         }

            //         return false;
            //     }
            // }

            // start(
            //     voice_connection, client, message.member.user, message,
            //     message.guild, guild_object, message.content
            // )
            //     .then(r => {
            //         if (message.guild) {
            //             const portal_voice_connection = client.voice?.connections
            //                 .find(c => c.channel.guild.id === message.guild?.id);

            //             const animate = portal_voice_connection?.dispatcher
            //                 ? !portal_voice_connection?.dispatcher.paused
            //                 : false;

            //             update_music_message(
            //                 message.guild,
            //                 guild_object,
            //                 guild_object.music_queue.length > 0
            //                     ? guild_object.music_queue[0]
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
            //                 .catch((e: any) => {
            //                     logger.error(new Error(`failed to send message: ${e}`));
            //                 });
            //         }
            //     })
            //     .catch(e => {
            //         if (message.guild) {
            //             update_music_message(
            //                 message.guild,
            //                 guild_object,
            //                 guild_object.music_queue.length > 0
            //                     ? guild_object.music_queue[0]
            //                     : undefined,
            //                 `error while starting playback: ${e}`
            //             ).catch(e => {
            //                 logger.error(new Error(e));
            //             });
            //         }

            //         if (message.deletable) {
            //             message
            //                 .delete()
            //                 .catch((e: any) => {
            //                     logger.error(new Error(`failed to send message: ${e}`));
            //                 });
            //         }
            //     });
        }
        return true;
    }

    return false;
}