import { Channel, ChannelType, Client, Guild, GuildMember, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from "discord.js";
import event_config_json from '../config.event.json';
import { isMessageDeleted, isUserAuthorised, logger, markMessageAsDeleted, messageReply } from "../libraries/help.library";
import { messageSpamCheck } from "../libraries/mod.library";
import { fetchGuildPreData, fetchGuildRest, insertMember } from "../libraries/mongo.library";
import { portalPreprocessor, commandDecypher } from "../libraries/preprocessor.library";
import { ActiveCooldowns, ReturnPromise, SpamCache } from "../types/classes/PTypes.interface";
import { commandLoader } from "./command.handler";

async function eventLoader(event: string, args: any): Promise<void> {
    const commandReturn: ReturnPromise = await require(`../events/${event}.event.js`)(args)
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

    // This event will run when a slash command is called.
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        await interaction.reply({ content: 'Slash commands under construction', ephemeral: true });
    });

    // runs on every single message received, from anywhere
    client.on('messageCreate', async (message: Message) => {
        handleCommand(client, message, active_cooldowns, spam_cache);
    });
}

async function handleCommand(client: Client, message: Message, active_cooldowns: ActiveCooldowns = { guild: [], member: [] }, spam_cache: SpamCache[] = []) {
    if (!message || !message.member || !message.guild) return;
    if (message.channel.type === ChannelType.DM || message.author.bot) return;

    fetchGuildPreData(message.guild.id, message.author.id)
        .then(async pGuild => {
            if (!pGuild) {
                logger.error(new Error(`guild does not exist in Portal`));
                return false;
            }

            if (pGuild.pMembers.length === 0 && message.guild) {
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

            if (await portalPreprocessor(message, pGuild)) {
                // preprocessor has handled the message
                messageSpamCheck(message, pGuild, spam_cache);

                return true;
            } else {
                messageSpamCheck(message, pGuild, spam_cache);

                // Ignore any message that does not start with prefix
                if (message.content.indexOf(pGuild.prefix) !== 0) {
                    if (message.content === 'prefix') {
                        messageReply(true, message, `portal's prefix is \`${pGuild.prefix}\``)
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

                const command = commandDecypher(message, pGuild);

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

                        pGuild.pMembers = guild_object_rest.pMembers;
                        pGuild.pollList = guild_object_rest.pollList;
                        pGuild.ranks = guild_object_rest.ranks;
                        pGuild.musicQueue = guild_object_rest.musicQueue;
                        pGuild.announcement = guild_object_rest.announcement;
                        pGuild.locale = guild_object_rest.locale;
                        pGuild.announce = guild_object_rest.announce;
                        pGuild.premium = guild_object_rest.premium;

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
                            pGuild,
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
}