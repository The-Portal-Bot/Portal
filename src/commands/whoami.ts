import { Client, Message } from "discord.js";
import { create_rich_embed } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
    client: Client, message: Message, args: string[],
    guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
    return new Promise((resolve) => {
        const guild_object = guild_list.find(g => g.id === message.guild?.id);
        if (!guild_object) return resolve({ result: false, value: 'could not find guild, please contact portal support' });
        const member_object = guild_object.member_list.find(m => m.id === message.member?.id);
        if (!member_object) return resolve({ result: false, value: 'could not find guild, please contact portal support' });

        message.channel.send(create_rich_embed(
            message.member ? message.member?.displayName : 'could not fetch name',
            'member portal card',
            '#42f5d7',
            [
                {
                    emote: 'id',
                    role: member_object.id,
                    inline: false
                },
                {
                    emote: 'level',
                    role: member_object.level,
                    inline: false
                },
                {
                    emote: 'regex',
                    role: member_object.regex ? 'not set' : member_object.regex,
                    inline: false
                },
                {
                    emote: 'DJ',
                    role: member_object.dj ? 'true' : 'false',
                    inline: false
                },
                {
                    emote: 'admin',
                    role: member_object.admin ? 'true' : 'false',
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