import { Message } from "discord.js";
import { createEmbed } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('returns your level'),
    async execute(
        message: Message, args: string[], guild_object: PGuild
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            const member_object = guild_object.member_list.find(m => m.id === message.member?.id);
            if (!member_object) {
                return resolve({
                    result: true,
                    value: 'could not find member'
                });
            }

            message.channel
                .send({
                    embeds: [
                        createEmbed(
                            null,
                            null,
                            '#00FFFF',
                            [
                                { emote: 'Level', role: `${member_object.level}`, inline: true },
                                { emote: 'Points', role: `${Math.round(member_object.points)}`, inline: true },
                                // { emote: '', role: '', inline: false },
                                // { emote: 'Rank', role: `${member_object.rank}`, inline: true },
                                { emote: 'Tier', role: `${member_object.tier}`, inline: true },
                            ],
                            null,
                            message.member,
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