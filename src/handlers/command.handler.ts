import { Channel, Client, Guild, GuildMember, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from "discord.js";
// import eventConfigJson from '../config.event.json';
import { logger, messageReply, pad, timeElapsed } from "../libraries/help.library";
import { PGuild } from "../types/classes/PGuild.class";
import { ActiveCooldowns, CommandOptions, ReturnPromise } from "../types/classes/PTypes.interface";

export async function commandLoader(
    client: Client, message: Message, command: string, args: string[], type: string, commandOptions: CommandOptions,
    pathToCommand: string, pGuild: PGuild, activeCooldowns: ActiveCooldowns
): Promise<void> {
    if (process.env.DEBUG!) {
        logger.info(`[command-debug] ${command}`);
    }

    if (type === 'none' && commandOptions.time === 0) {
        const commandReturn: ReturnPromise = await require(`../commands/${pathToCommand}/${command}.js`).execute(message, args, pGuild, client)
            .catch((e: string) => {
                messageReply(false, message, e, commandOptions.delete.source, commandOptions.delete.reply)
                    .catch((e: any) => logger.error(new Error('failed to send message')));
            });

        if (commandReturn) {
            messageReply(commandReturn.result, message, commandReturn.value, commandOptions.delete.source, commandOptions.delete.reply)
                .catch((e: any) => logger.error(new Error('failed to send message')));
        }

        return;
    }

    const typeString = type === 'guild' ? 'guild' : 'member';

    const active = activeCooldowns[typeString]
        .find(activeCurrent => {
            if (activeCurrent.command === command) {
                if (type === 'member' && activeCurrent.member === message.author.id) {
                    if (message.guild && activeCurrent.guild === message.guild.id) {
                        return true;
                    }
                }

                if (type === 'guild') {
                    if (message.guild && activeCurrent.guild === message.guild.id) {
                        return true;
                    }
                }
            }

            return false;
        });

    if (active) {
        const time = timeElapsed(active.timestamp, commandOptions.time);

        const typeForMsg = (type !== 'member')
            ? `, as it was used again in* **${message.guild?.name}**`
            : `.*`;

        const mustWaitMsg = `you need to wait **${pad(time.remainingMin)}:` +
            `${pad(time.remainingSec)}/${pad(time.timeoutMin)}:` +
            `${pad(time.timeoutSec)}** *to use* **${command}** *again${typeForMsg}`;

        messageReply(false, message, mustWaitMsg, true, true)
            .catch((e: any) => logger.error(new Error(`failed to reply to message: ${e}`)));

        return;
    }

    const commandReturn: ReturnPromise = await require(`../commands/${pathToCommand}/${command}.js`).execute(message, args, pGuild, client)
        .catch((e: any) => logger.error(new Error(`in ${command} got error ${e}`)));

    if (commandReturn) {
        if (commandReturn.result) {
            if (message.guild) {
                activeCooldowns[typeString]
                    .push({
                        member: message.author.id,
                        guild: message.guild.id,
                        command: command,
                        timestamp: Date.now()
                    });

                if (commandOptions) {
                    setTimeout(() => {
                        activeCooldowns[typeString] = activeCooldowns[typeString]
                            .filter(active => active.command !== command);
                    }, commandOptions.time * 60 * 1000);
                }
            }
        }

        messageReply(commandReturn.result, message, commandReturn.value,
            commandOptions.delete.source, commandOptions.delete.reply)
            .catch(e => {
                logger.error(new Error(`in ${command} got error ${e}`));
            });
    } else {
        logger.error(new Error(`did not get response from command: ${command}`));
    }
}