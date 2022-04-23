import { Channel, Client, Guild, GuildMember, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from "discord.js";
import { ChannelTypes } from "discord.js/typings/enums";
import event_config_json from '../config.event.json';
import { isMessageDeleted, isUserAuthorised, logger, markMessageAsDeleted, messageReply } from "../libraries/help.library";
import { messageSpamCheck } from "../libraries/mod.library";
import { fetchGuildPredata, fetchGuildRest, insertMember } from "../libraries/mongo.library";
import { portalPreprocessor, commandDecypher } from "../libraries/preprocessor.library";
import { ActiveCooldowns, ReturnPormise, SpamCache } from "../types/classes/TypesPrtl.interface";
import { commandLoader } from "./command.handler";

async function eventLoader(event: string, args: any): Promise<void> {
    const commandReturn: ReturnPormise = await require(`../events/${event}.event.js`)(args)
        .catch((e: string) => {
            logger.error(`[event-rejected] ${event} | ${e}`);
        });

    if (commandReturn) {
        if ((event_config_json.find(e => e.name === event))) {
            logger.info(`[event-accepted] ${event} | ${commandReturn}`);
        } else if (process.env.DEBUG) {
            logger.info(`[event-accepted-debug] ${event} | ${commandReturn}`);
        }
    }
}

export async function eventHandler(client: Client, active_cooldowns: ActiveCooldowns = { guild: [], member: [] }, spam_cache: SpamCache[] = []) {
    // This event will run if the bot starts, and logs in, successfully.
    client.once('ready', () =>
        eventLoader('ready', {
            'client': client
        })
    );

    // This event triggers when the bot joins a guild.
    client.on('channelDelete', (channel: Channel | PartialDMChannel) => {
        eventLoader('channelDelete', {
            'channel': channel
        });
    });

    // This event triggers when the bot joins a guild
    client.on('guildCreate', (guild: Guild) =>
        eventLoader('guildCreate', {
            'client': client,
            'guild': guild
        })
    );

    // this event triggers when the bot is removed from a guild
    client.on('guildDelete', (guild: Guild) =>
        eventLoader('guildDelete', {
            'guild': guild
        })
    );

    // This event triggers when a new member joins a guild.
    client.on('guildMemberAdd', (member: GuildMember) => {
        eventLoader('guildMemberAdd', {
            'member': member
        })
    });

    // This event triggers when a new member leaves a guild.
    client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
        eventLoader('guildMemberRemove', {
            'member': member
        })
    });

    // This event triggers when a message is deleted
    client.on('messageDelete', (message: Message | PartialMessage) =>
        eventLoader('messageDelete', {
            'client': client,
            'message': message
        })
    );

    // This event triggers when a member reacts to a message
    client.on('messageReactionAdd', (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
        eventLoader('messageReactionAdd', {
            'client': client,
            'messageReaction': messageReaction,
            'user': user
        })
    );

    // This event triggers when a member joins or leaves a voice channel
    client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
        const new_channel = newState.channel; // join channel
        const old_channel = oldState.channel; // left channel

        // mute / unmute  defean user are ignored
        if ((old_channel && new_channel) && (new_channel.id === old_channel.id)) {
            return;
        }

        eventLoader('voiceStateUpdate', {
            'client': client,
            'oldState': oldState,
            'newState': newState
        });
    });

    // runs on every single message received, from anywhere
    client.on('messageCreate', async (message: Message) => {
        if (!message || !message.member || !message.guild) return;
        if (message.channel.type === ChannelTypes.DM.toString() || message.author.bot) return;

        fetchGuildPredata(message.guild.id, message.author.id)
            .then(async guild_object => {
                if (!guild_object) {
                    logger.error(new Error(`guild does not exist in Portal`));
                    return false;
                }

                if (guild_object.member_list.length === 0 && message.guild) {
                    insertMember(message.guild.id, message.author.id)
                        .then(() => {
                            if (message.guild) {
                                logger.info(`late-insert ${message.author.id} to ${message.guild.name} [${message.guild.id}]`);
                            }
                        })
                        .catch(e => {
                            logger.error(new Error(`failed to late-insert member: ${e}`));
                        });

                    return true;
                }

                if (await portalPreprocessor(message, guild_object)) {
                    // preprocessor has handled the message
                    messageSpamCheck(message, guild_object, spam_cache);

                    return true;
                } else {
                    messageSpamCheck(message, guild_object, spam_cache);

                    // Ignore any message that does not start with prefix
                    if (message.content.indexOf(guild_object.prefix) !== 0) {
                        if (message.content === 'prefix') {
                            messageReply(true, message, `portal's prefix is \`${guild_object.prefix}\``)
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

                        return false;
                    }

                    const command = commandDecypher(message, guild_object);

                    if (!command.command_options) {
                        return false;
                    }

                    if (command.command_options.auth && message.member) {
                        if (!isUserAuthorised(message.member)) {
                            messageReply(false, message, 'you are not authorised to use this command', true, true)
                                .catch((e: any) => {
                                    logger.error(new Error(`failed to send message: ${e}`));
                                });


                            return false;
                        }
                    }

                    if (!message.guild) {
                        logger.error(new Error('could not fetch guild of message'));

                        return false;
                    }

                    fetchGuildRest(message.guild.id)
                        .then(guild_object_rest => {
                            if (!guild_object_rest) {
                                logger.error(new Error('server is not in database'));
                                messageReply(false, message, 'server is not in database')
                                    .catch((e: any) => {
                                        logger.error(new Error(`failed to send message: ${e}`));
                                    });

                                return false;
                            }

                            guild_object.member_list = guild_object_rest.member_list;
                            guild_object.poll_list = guild_object_rest.poll_list;
                            guild_object.ranks = guild_object_rest.ranks;
                            guild_object.music_queue = guild_object_rest.music_queue;
                            guild_object.announcement = guild_object_rest.announcement;
                            guild_object.locale = guild_object_rest.locale;
                            guild_object.announce = guild_object_rest.announce;
                            guild_object.premium = guild_object_rest.premium;

                            if (!command.command_options) {
                                return false;
                            }

                            commandLoader(
                                client,
                                message,
                                command.cmd,
                                command.args,
                                command.type,
                                command.command_options,
                                command.path_to_command,
                                guild_object,
                                active_cooldowns
                            ).catch();
                        })
                        .catch(e => {
                            logger.error(new Error(`error while fetch guild restdata: ${e}`));
                            return false;
                        });
                }
            })
            .catch(e => {
                logger.error(new Error(`error while fetch guild predata: ${e}`));
                return false;
            });
    });
}