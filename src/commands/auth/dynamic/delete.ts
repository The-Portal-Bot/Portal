import { Message, TextChannel } from "discord.js";
import { message_help } from "../../../libraries/help.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/classes/TypesPrtl.interface";

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

        if (typeof bulk_delete_length !== "number")
            return resolve({
                result: false,
                value: message_help('commands', 'delete', 'argument must always be number')
            });

        if (bulk_delete_length <= 0)
            return resolve({
                result: false,
                value: message_help('commands', 'delete', 'number of messages to delete must be > 1')
            });

        (<TextChannel>message.channel).bulkDelete(bulk_delete_length + 1)
            .then(messages => {
                return resolve({
                    result: true,
                    value: `deleted ${messages.size - 1}`
                });
            })
            .catch(error => {
                return resolve({
                    result: false,
                    value: `DL/BL/000: ${error}`
                });
            });
    });
};