import { Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        const member_object = guild_object.member_list.find(m => m.id === message.member?.id);
        if (!member_object) return resolve({ result: false, value: 'could not find guild, please contact portal support' });

        message.channel.send(create_rich_embed(
            message.member ? message.member?.displayName : 'could not fetch name',
            'Portal member card',
            '#42f5d7',
            [
                {
                    emote: 'Id',
                    role: member_object.id,
                    inline: false
                },
                {
                    emote: 'Level',
                    role: member_object.level,
                    inline: false
                },
                {
                    emote: 'Regex',
                    role: member_object.regex ? 'not set' : member_object.regex,
                    inline: false
                },
                {
                    emote: 'DJ',
                    role: member_object.dj ? 'true' : 'false',
                    inline: false
                },
                {
                    emote: 'Admin',
                    role: member_object.admin ? 'true' : 'false',
                    inline: false
                },
                {
                    emote: 'Ignored',
                    role: member_object.ignored ? 'true' : 'false',
                    inline: false
                }
            ],
            message.member?.user.avatarURL(),
            null,
            true,
            null,
            null)
        );

        return resolve({ result: true, value: '' });
    });
};