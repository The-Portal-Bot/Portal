import { Message, TextChannel } from "discord.js";
import { ask_for_approval, message_help } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        if (args.length !== 1) {
            return resolve({
                result: false,
                value: message_help('commands', 'delete', 'you can only give one number as argument')
            });
        }

        const bulk_delete_length = +args[0];

        if (typeof bulk_delete_length !== "number") { // isNaN ?
            return resolve({
                result: false,
                value: message_help('commands', 'delete', 'argument must always be number')
            });
        }

        if (bulk_delete_length <= 0) {
            return resolve({
                result: false,
                value: message_help('commands', 'delete', 'number of messages to delete must be > 1')
            });
        }

        if (!message.member) {
            return resolve({
                result: true,
                value: 'message author could not be fetched'
            });
        }

        ask_for_approval(
            message,
            message.member,
            `*${message.author}, are you sure you want to delete ` +
            `**${bulk_delete_length}** messages*, do you **(yes / no)** ?`
        )
            .then(result => {
                if (result) {
                    (<TextChannel>message.channel)
                        .bulkDelete(bulk_delete_length + 1)
                        .then(messages => {
                            return resolve({
                                result: true,
                                value: `deleted ${messages.size - 1} messages`
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `error while bulk delete / ${e}`
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
                    value: `failed to focus / ${e}`
                });
            });
    });
};