import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from "discord.js";
import { createEmded } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { MemberPrtl } from "../../types/classes/MemberPrtl.class";
import { ReturnPromise } from "../../types/classes/TypesPrtl.interface";

const embeds = (message: Message, member_object: MemberPrtl) => [
    createEmded(
        message.member
            ? message.member?.displayName
            : 'could not fetch name',
        null,
        '#ddff00',
        [
            {
                emote: 'Level',
                role: member_object.level,
                inline: true
            },
            {
                emote: 'Regex',
                role: (!member_object.regex || member_object.regex === 'null')
                    ? 'not set'
                    : member_object.regex,
                inline: true
            },
            {
                emote: 'Penalties',
                role: `${member_object.penalties ? member_object.penalties : 0}`,
                inline: true
            },
            {
                emote: 'Id',
                role: member_object.id,
                inline: false
            }
        ],
        message.member?.user.avatarURL(),
        null,
        true,
        null,
        null
    )
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whoami')
        .setDescription('returns who am I information'),
    async execute(
        message: Message, args: string[], guild_object: GuildPrtl
    ): Promise<ReturnPromise> {
        return new Promise((resolve, reject) => {
            const member_object = guild_object.member_list.find(m => m.id === message.member?.id);
            if (!member_object) {
                return resolve({
                    result: false,
                    value: 'could not find guild'
                });
            }

            message.channel
                .send({ embeds: embeds(message, member_object) })
                .then(() => {
                    return resolve({
                        result: true,
                        value: ''
                    });
                })
                .catch(e => {
                    return resolve({
                        result: true,
                        value: `could not send message: ${e}`
                    });
                });
        });
    }
};