import { Message } from "discord.js";
import { createEmbed, messageHelp } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { PMember } from "../../types/classes/PMember.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

function compare(
    member_a: PMember, member_b: PMember
) {
    return member_b.level === member_a.level
        ? member_b.points > member_a.points ? 1 : -1
        : member_b.level > member_a.level ? 1 : -1;
}



module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('returns server\'s leaderboard'),
    async execute(
        message: Message, args: string[], guild_object: PGuild
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            const member_list = guild_object.pMembers;

            if (!member_list) {
                return resolve({
                    result: false,
                    value: 'server has no members'
                });
            }

            const requested_number = +args[0];
            if (args.length > 0 && isNaN(requested_number)) {
                return resolve({
                    result: false,
                    value: `${args[0]} is not a number`
                });
            }

            if (requested_number <= 0) {
                return resolve({
                    result: false,
                    value: `${args[0]} must be at least 1`
                });
            }

            let entries = member_list.length >= requested_number
                ? requested_number > 25 ? 24 : requested_number
                : member_list.length > 25 ? 24 : member_list.length;

            if (entries <= 0) {
                return resolve({
                    result: false,
                    value: messageHelp('commands',
                        'leaderboard',
                        'leaderboard entries must be at least one'
                    )
                });
            }

            if (guild_object.pMembers) {
                const member_levels: Field[] = [];
                member_list
                    .sort(compare)
                    .forEach((member_object, i) => {
                        if (message.guild && entries > i) {
                            const this_member = message.guild.members.cache
                                .find(member => member.id === member_object.id);

                            if (this_member) {
                                member_levels.push(
                                    {
                                        emote: `${i + 1}. ${this_member.displayName}`,
                                        role: `level ${member_object.level}\t|\tpoints: ${Math.round(member_object.points)}`,
                                        inline: false
                                    }
                                );

                                entries--;
                            } else {
                                resolve({
                                    result: false,
                                    value: 'a member has been stored incorrectly'
                                });
                            }
                        }
                    });

                message.channel
                    .send({
                        embeds: [
                            createEmbed(
                                'LEADERBOARD',
                                '[Ranking System](https://portal-bot.xyz/docs/ranking)',
                                '#00FFFF',
                                member_levels,
                                null,
                                null,
                                true,
                                null,
                                null)
                        ]
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `failed to send message: ${e}`
                        });
                    });

                return resolve({
                    result: true,
                    value: ''
                });
            }
            else {
                resolve({
                    result: false,
                    value: 'there are no members for this server'
                });
            }
        });
    }
}