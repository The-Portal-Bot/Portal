import { Message } from "discord.js";
import { create_rich_embed } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        const member_object = guild_object.member_list.find(m => m.id === message.member?.id);
        if (!member_object) {
            return resolve({
                result: false,
                value: 'could not find guild, please contact portal support'
            });
        }

        message.channel
            .send(
                create_rich_embed(
                    message.member
                        ? message.member?.displayName
                        : 'could not fetch name',
                    'Portal member card',
                    '#ddff00',
                    [
                        {
                            emote: 'Id',
                            role: member_object.id,
                            inline: false
                        },
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
                        }
                    ],
                    message.member?.user.avatarURL(),
                    null,
                    true,
                    null,
                    null
                )
            )
            .catch(e => {
                return resolve({
                    result: true,
                    value: `failed to send message / ${e}`
                });
            });

        return resolve({
            result: true,
            value: ''
        });
    });
};