import { Message, TextChannel } from "discord.js";
import { askForApproval, messageHelp } from "../../libraries/help.library";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('delete n number of messages'),
    async execute(
        message: Message, args: string[]
    ): Promise<ReturnPormise> {
        return new Promise((resolve) => {
            if (args.length !== 1) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'delete', 'you can only give one number as argument')
                });
            }

            const bulk_delete_length = +args[0];

            if (typeof bulk_delete_length !== "number") { // isNaN ?
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'delete', 'argument must always be number')
                });
            }

            if (bulk_delete_length <= 0) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'delete', 'you can delete one or more messages')
                });
            }

            if (bulk_delete_length > 97) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'delete', 'you can delete up-to 97 messages')
                });
            }

            if (!message.member) {
                return resolve({
                    result: true,
                    value: 'message author could not be fetched'
                });
            }

            askForApproval(
                message,
                message.member,
                `*${message.author}, are you sure you want to delete ` +
                `**${bulk_delete_length}** messages*, do you **(yes / no)** ?`
            )
                .then(result => {
                    if (result) {
                        (<TextChannel>message.channel)
                            .bulkDelete(bulk_delete_length + 3)
                            .then(messages => {
                                return resolve({
                                    result: true,
                                    value: `deleted ${messages.size - 1} messages`
                                });
                            })
                            .catch(e => {
                                return resolve({
                                    result: false,
                                    value: `error while bulk delete: ${e}`
                                });
                            });
                    } else {
                        return resolve({
                            result: false,
                            value: 'will not delete messages'
                        });
                    }
                })
                .catch(e => {
                    return resolve({
                        result: false,
                        value: `failed to focus: ${e}`
                    });
                });
        });
    }
};