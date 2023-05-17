import { Client, Message } from "discord.js";
import { createEmbed } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import spam_config from "../../config.spam.json";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spam_rules')
        .setDescription('returns the current spam rules'),
    async execute(
        message: Message, args: string[], pGuild: PGuild, client: Client
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            const guild = client.guilds.cache
                .find(g => g.id === message?.guild?.id);

            if (!guild) {
                return resolve({
                    result: false,
                    value: 'could not fetch guild'
                });
            }

            const rules = `**Duplicate spam warning after ${spam_config.dupl_after}.**\n` +
                `**Spam warning after ${spam_config.warn_after}.**\n` +
                `**Mute after ${spam_config.mute_after} ${spam_config.mute_after === 1 ? `warning` : `warnings`} ` +
                `for ${spam_config.mute_period} ${spam_config.mute_period === 1 ? `minute` : `minutes`}.**\n\n` +
                `${pGuild.kickAfter && pGuild.kickAfter > 0
                    ? `***Member kicked after ${pGuild.kickAfter} ${spam_config.mute_after === 1 ? `penalty` : `penalties`}.***\n`
                    : `***Automatic kick has not been set yet.***\n`
                }` +
                `${pGuild.banAfter && pGuild.banAfter > 0
                    ? `***Member banned after ${pGuild.banAfter} ${spam_config.mute_after === 1 ? `penalty` : `penalties`}.***`
                    : `***Automatic ban has not been set yet.***`
                }`
                ;

            message.channel
                .send({
                    embeds: [
                        createEmbed(
                            'Spam Rules',
                            rules,
                            '#006996',
                            null,
                            null,
                            null,
                            true,
                            null,
                            null
                        )
                    ]
                })
                .catch(e => {
                    return resolve({
                        result: true,
                        value: `failed to send message: ${e}`
                    });
                });

            return resolve({
                result: true,
                value: ''
            });
        });
    }
};