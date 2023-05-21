import { Channel, ChannelType, Client, Guild, GuildMember, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from "discord.js";
import eventConfigJson from '../config.event.json';
import { isMessageDeleted, isUserAuthorised, logger, markMessageAsDeleted, messageReply } from "../libraries/help.library";
import { messageSpamCheck } from "../libraries/mod.library";
import { fetchGuildPreData, fetchGuildRest, insertMember } from "../libraries/mongo.library";
import { portalPreprocessor, commandDecipher } from "../libraries/preprocessor.library";
import { ActiveCooldowns, ReturnPromise, SpamCache } from "../types/classes/PTypes.interface";
import { commandLoader } from "./command.handler";

async function eventLoader(event: string, args: any): Promise<void> {
    const commandReturn: ReturnPromise = await require(`../events/${event}.event.js`)(args)
        .catch((e: string) => {
            logger.error(`[event-rejected] ${event} | ${e}`);
        });

    if (commandReturn) {
        if ((eventConfigJson.find(e => e.name === event))) {
            logger.info(`[event-accepted] ${event} | ${commandReturn}`);
        } else if (process.env.DEBUG) {
            logger.info(`[event-accepted-debug] ${event} | ${commandReturn}`);
        }
    }
}

export async function eventHandler(client: Client, activeCooldowns: ActiveCooldowns = { guild: [], member: [] }, spamCache: SpamCache[] = []) {
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
        const newChannel = newState.channel; // join channel
        const oldChannel = oldState.channel; // left channel

        // mute / unmute deafen user are ignored
        if ((oldChannel && newChannel) && (newChannel.id === oldChannel.id)) {
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
        handleCommand(client, message, activeCooldowns, spamCache);
    });
}

async function handleCommand(client: Client, message: Message, activeCooldowns: ActiveCooldowns = { guild: [], member: [] }, spamCache: SpamCache[] = []) {
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
                messageSpamCheck(message, pGuild, spamCache);

                return true;
            } else {
                messageSpamCheck(message, pGuild, spamCache);

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

                const command = commandDecipher(message, pGuild);

                if (!command.commandOptions) {
                    return false;
                }

                if (command.commandOptions.auth && message.member) {
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
                    .then(pGuild => {
                        if (!pGuild) {
                            logger.error(new Error('server is not in database'));
                            messageReply(false, message, 'server is not in database')
                                .catch((e: any) => {
                                    logger.error(new Error(`failed to send message: ${e}`));
                                });

                            return false;
                        }

                        pGuild.pMembers = pGuild.pMembers;
                        pGuild.pPolls = pGuild.pPolls;
                        pGuild.ranks = pGuild.ranks;
                        pGuild.musicQueue = pGuild.musicQueue;
                        pGuild.announcement = pGuild.announcement;
                        pGuild.locale = pGuild.locale;
                        pGuild.announce = pGuild.announce;
                        pGuild.premium = pGuild.premium;

                        if (!command.commandOptions) {
                            return false;
                        }

                        commandLoader(
                            client,
                            message,
                            command.cmd,
                            command.args,
                            command.type,
                            command.commandOptions,
                            command.pathToCommand,
                            pGuild,
                            activeCooldowns
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