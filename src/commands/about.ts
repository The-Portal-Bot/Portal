import { Client, Message } from "discord.js";
import { create_rich_embed } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
    client: Client, message: Message, args: string[],
    guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
    return new Promise((resolve) => {
        message.channel.send(create_rich_embed(
            'About',
            'a portal to a managed discord server',
            '#1DB954',
            [{
                emote: 'Creator',
                role: '***Keybraker***',
                inline: true
            },
            {
                emote: 'Created',
                role: '***2020***',
                inline: true
            },
            {
                emote: 'Version',
                role: '***1.0.2***',
                inline: true
            },
            {
                emote: 'For help just type',
                role: './help',
                inline: false
            }],
            null,
            null,
            true,
            'https://portal-bot.xyz/',
            null)
        );

        return resolve({ result: true, value: 'about message.' });
    });
};