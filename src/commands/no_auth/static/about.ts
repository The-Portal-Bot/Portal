import { Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/help.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";
import config from '../../../config.json';

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        message.channel.send(create_rich_embed(
            'About',
            null,
            '#1DB954',
            [{
                emote: 'Creator',
                role: 'Keybraker',
                inline: true
            },
            {
                emote: 'Created',
                role: '2020',
                inline: true
            },
            {
                emote: 'Version',
                role: config.version,
                inline: true
            },
            {
                emote: 'Website',
                role: 'https://portal-bot.xyz',
                inline: false
            },
            {
                emote: 'Upvote on top.gg',
                role: 'https://top.gg/bot/704400876860735569',
                inline: false
            },
            {
                emote: 'Official Server',
                role: 'https://discord.com/invite/nuKXgFXr5y',
                inline: false
            },
            {
                emote: 'Github',
                role: 'https://www.github.com/keybraker/Portal',
                inline: false
            }],
            null,
            null,
            true,
            'https://portal-bot.xyz',
            null)
        );

        return resolve({ result: true, value: '' });
    });
};