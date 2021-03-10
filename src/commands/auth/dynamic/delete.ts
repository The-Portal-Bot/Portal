import { Message, TextChannel } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        if (args.length !== 1)
            return resolve({
                result: false,
                value: 'you can only give one number as argument, for more help run `./help delete`'
            });

        const bulk_delete_length = +args[0];

        if (typeof bulk_delete_length !== "number")
            return resolve({
                result: false,
                value: 'argument must always be number, for more help run `./help delete`'
            });

        if (bulk_delete_length <= 0)
            return resolve({
                result: false,
                value: 'number of messages to delete must be > 1, for more help run `./help delete`'
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