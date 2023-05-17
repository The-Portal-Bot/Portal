import { Channel, Client, Guild, GuildMember, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from "discord.js";
import event_config_json from '../config.event.json';
import { logger, messageReply, pad, timeElapsed } from "../libraries/help.library";
import { PGuild } from "../types/classes/PGuild.class";
import { ActiveCooldowns, CommandOptions, ReturnPromise } from "../types/classes/PTypes.interface";

export async function commandLoader(
    client: Client, message: Message, command: string, args: string[], type: string, command_options: CommandOptions,
    path_to_command: string, pGuild: PGuild, active_cooldowns: ActiveCooldowns
): Promise<void> {
    if (process.env.DEBUG!) {
        logger.info(`[command-debug] ${command}`);
    }

    if (type === 'none' && command_options.time === 0) {
        const commandReturn: ReturnPromise = await require(`../commands/${path_to_command}/${command}.js`).execute(message, args, pGuild, client)
            .catch((e: string) => {
                messageReply(false, message, e, command_options.delete.source, command_options.delete.reply)
                    .catch((e: any) => logger.error(new Error('failed to send message')));
            });

        if (commandReturn) {
            messageReply(commandReturn.result, message, commandReturn.value, command_options.delete.source, command_options.delete.reply)
                .catch((e: any) => logger.error(new Error('failed to send message')));
        }

        return;
    }

    const type_string = type === 'guild' ? 'guild' : 'member';

    const active = active_cooldowns[type_string]
        .find(active_current => {
            if (active_current.command === command) {
                if (type === 'member' && active_current.member === message.author.id) {
                    if (message.guild && active_current.guild === message.guild.id) {
                        return true;
                    }
                }

                if (type === 'guild') {
                    if (message.guild && active_current.guild === message.guild.id) {
                        return true;
                    }
                }
            }

            return false;
        });

    if (active) {
        const time = timeElapsed(active.timestamp, command_options.time);

        const type_for_msg = (type !== 'member')
            ? `, as it was used again in* **${message.guild?.name}**`
            : `.*`;

        const must_wait_msg = `you need to wait **${pad(time.remaining_min)}:` +
            `${pad(time.remaining_sec)}/${pad(time.timeout_min)}:` +
            `${pad(time.timeout_sec)}** *to use* **${command}** *again${type_for_msg}`;

        messageReply(false, message, must_wait_msg, true, true)
            .catch((e: any) => logger.error(new Error(`failed to reply to message: ${e}`)));

        return;
    }

    const commandReturn: ReturnPromise = await require(`../commands/${path_to_command}/${command}.js`).execute(message, args, pGuild, client)
        .catch((e: any) => logger.error(new Error(`in ${command} got error ${e}`)));

    if (commandReturn) {
        if (commandReturn.result) {
            if (message.guild) {
                active_cooldowns[type_string]
                    .push({
                        member: message.author.id,
                        guild: message.guild.id,
                        command: command,
                        timestamp: Date.now()
                    });

                if (command_options) {
                    setTimeout(() => {
                        active_cooldowns[type_string] = active_cooldowns[type_string]
                            .filter(active => active.command !== command);
                    }, command_options.time * 60 * 1000);
                }
            }
        }

        messageReply(commandReturn.result, message, commandReturn.value,
            command_options.delete.source, command_options.delete.reply)
            .catch(e => {
                logger.error(new Error(`in ${command} got error ${e}`));
            });
    } else {
        logger.error(new Error(`did not get response from command: ${command}`));
    }
}