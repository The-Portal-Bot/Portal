import { Message } from "discord.js";
import { askForApproval, isMod, messageHelp } from "../../libraries/help.library";
import { kick } from "../../libraries/user.library";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('kick a user'),
    async execute(
        message: Message, args: string[]
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            if (!message.member) {
                return resolve({
                    result: false,
                    value: 'message author could not be fetched'
                });
            }

            if (!isMod(message.member)) {
                return resolve({
                    result: false,
                    value: `you must be a Portal moderator to ban users`
                });
            }

            if (!message.guild) {
                return resolve({
                    result: false,
                    value: `user guild could not be fetched`
                });
            }

            let kickReason = args
                .join(' ')
                .substring(args.join(' ').indexOf('|') + 1)
                .replace(/\s/g, ' ')
                .trim();


            if (kickReason === '') {
                kickReason = 'kicked by admin'
            }

            if (message.mentions && message.mentions.members) {
                if (message.mentions.members.size === 0) {
                    return resolve({
                        result: false,
                        value: messageHelp('commands', 'kick', `you must tag a member`)
                    });
                }

                const memberToKick = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

                if (memberToKick) {
                    if (message.member === memberToKick) {
                        return resolve({
                            result: false,
                            value: messageHelp('commands', 'kick', `you can't kick on yourself`)
                        });
                    }

                    askForApproval(
                        message,
                        message.member,
                        `*${message.member}, are you sure you want to kick ` +
                        `user ${memberToKick}*, do you **(yes / no)** ?`
                    )
                        .then(result => {
                            if (result) {
                                kick(memberToKick, kickReason)
                                    .then(r => {
                                        return resolve({
                                            result: r,
                                            value: r
                                                ? `${memberToKick} has been kicked by ${message.author} ` +
                                                `because: *${kickReason}*`
                                                : `${memberToKick} is not kickable`
                                        });
                                    })
                                    .catch(e => {
                                        return resolve({
                                            result: false,
                                            value: `failed to kick member ${memberToKick}, ` +
                                                `Portal's role must be higher than member you want to kick: ${e}`
                                        });
                                    });
                            } else {
                                return resolve({
                                    result: false,
                                    value: `user ${memberToKick} will not be kicked`
                                });
                            }
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `failed to kick: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `could not find member`
                    });
                }

            } else {
                return resolve({
                    result: false,
                    value: `no user mentioned to kick`
                });
            }
        });
    }
};

