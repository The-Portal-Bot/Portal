import { Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

/* eslint-disable no-unused-vars */
const guld_mngr = require('../../../libraries/guildOps');

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        if (!message.guild) return resolve({
            result: false,
            value: 'purge failed'
        });
        if (message.guild.id !== '228667314252283904') {
            message.guild.channels.cache.forEach((value) => {
                if (value.deletable) {
                    value.delete()
                        .then(channel => console.log('Deleted the channel: ' + channel))
                        .catch(console.error);
                }
            });

            message.guild.channels.create('general voice', { type: 'voice', bitrate: 8 })
                .then(() => {
                    message?.guild?.channels.create('general text', { type: 'text' })
                        .then(value => { value.send('purge done').then(msg => { msg.delete({ timeout: 5000 }); }); })
                });

            guld_mngr.delete_guild(message.guild.id, guild_object);
            guld_mngr.insert_guild(message.guild.id, guild_object);

            return resolve({
                result: true,
                value: 'purge done'
            });
        }
        return resolve({
            result: false,
            value: 'purge failed'
        });
    });
};