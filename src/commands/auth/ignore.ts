import { Message } from "discord.js";
import { includedInIgnoreList } from "../../libraries/guild.library";
import { messageHelp } from "../../libraries/help.library";
import { insert_ignore, remove_ignore } from "../../libraries/mongo.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ignore')
        .setDescription('ignore user or channel from spam'),
    async execute(
        message: Message, args: string[], guild_object: PGuild
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            if (!message.guild) {
                return resolve({
                    result: false,
                    value: 'guild could not be fetched'
                });
            }

            if (args.length === 0) { // channel ignore
                if (includedInIgnoreList(message.channel.id, guild_object)) {
                    remove_ignore(guild_object.id, message.channel.id)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? 'successfully removed ignore channel'
                                    : 'failed to remove ignore channel'
                            });
                        })
                        .catch(() => {
                            return resolve({
                                result: false,
                                value: 'failed to remove ignore channel'
                            });
                        });
                }
                else {
                    insert_ignore(guild_object.id, message.channel.id)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? 'set as an ignore channel successfully'
                                    : 'failed to set as an ignore channel'
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `failed to set as an ignore channel: ${e}`
                            });
                        });
                }
            }
            else {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'ignore')
                });
            }
        });
    }
};
