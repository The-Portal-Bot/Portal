import { Client, Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        const guild = client.guilds.cache.find(g => g.id === message?.guild?.id);
        if (!guild) return resolve({ result: false, value: 'could not fetch guild' });

        let portal_state = [<Field>{ emote: 'Portal Channels', role: '', inline: false }];

        const portals = guild_object.portal_list.map(p => {
            const voices = p.voice_list.map((v, index_v) => {
                const voice_channel = guild.channels.cache.find(c => c.id === v.id);
                return `${index_v + 1}. ${voice_channel ? voice_channel.name : 'removed'}`;
            }).join('\n');
            const portal_channel = guild.channels.cache.find(c => c.id === p.id);

            return <Field>{ emote: `${portal_channel ? portal_channel.name : 'removed'}`, role: voices, inline: true }
        });
        if (portals)
            portal_state = portal_state.concat(portals);

        portal_state.push(<Field>{ emote: '', role: '', inline: false });

        const music = guild.channels.cache.find(c => c.id === guild_object.music_data.channel_id);
        if (music)
            portal_state.push(<Field>{
                emote: `Music channel`,
                role: `${music ? music.name : 'removed'}`,
                inline: true
            });

        const spotify = guild.channels.cache.find(c => c.id === guild_object.spotify);
        if (spotify)
            portal_state.push(<Field>{
                emote: 'Spotify channel',
                role: `${spotify ? spotify.name : 'removed'}`,
                inline: true
            });

        const announcement = guild.channels.cache.find(c => c.id === guild_object.announcement);
        if (announcement)
            portal_state.push(<Field>{
                emote: 'Announcement channel',
                role: `${announcement ? announcement.name : 'removed'}`,
                inline: true
            });

        const urls = guild_object.url_list.map((u_id, index_u) => {
            const channel = guild.channels.cache.find(c => c.id === u_id);
            return `${index_u + 1}. ${channel ? channel.name : 'removed'}`;
        });

        const url_sum = <Field>{
            emote: `Url channels`,
            role: urls.join('\n'),
            inline: false
        };

        if (url_sum)
            portal_state = portal_state.concat(url_sum);

        const ignores = guild_object.ignore_list.map((u_id, index_u) => {
            const channel = guild.channels.cache.find(c => c.id === u_id);
            return `${index_u + 1}. ${channel ? channel.name : 'removed'}`;
        });

        const ignore_sum = <Field>{
            emote: `ignore channels`,
            role: ignores.join('\n'),
            inline: false
        };

        if (ignore_sum)
            portal_state = portal_state.concat(ignore_sum);

        message.channel.send(create_rich_embed(
            'Portal state - current state of Portal',
            null,
            '#964B00',
            portal_state,
            null,
            null,
            true,
            null,
            null
        ));

        return resolve({
            result: true,
            value: ''
        });
    });
};