import { Client, Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
    client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        const guild = client.guilds.cache.find(g => g.id === message?.guild?.id);
        if (!guild)
            return resolve({ result: false, value: 'could not fetch guild' });

        let portal_state = [<Field>{ emote: 'Portals', role: '', inline: false }];

        const portals = guild_object.portal_list.map(p => {
            const voices = p.voice_list.map(v => {
                const channel = guild.channels.cache.find(c => c.id === v.id);
                return `> voice: ${channel ? channel.name : 'undefined'}`;
            }).join('\n');
            const channel = guild.channels.cache.find(c => c.id === p.id);

            return <Field>{ emote: `${channel ? channel.name : 'undefined'}`, role: voices, inline: true }
        });
        if (portals)
            portal_state = portal_state.concat(portals);

        portal_state.push(<Field>{ emote: 'Music / Spotify / Announcement', role: '', inline: false });

        const music = guild.channels.cache.find(c => c.id === guild_object.music_data.channel_id);
        if (music)
            portal_state.push(<Field>{
                emote: `${music ? music.name : 'undefined'} _(music)_`,
                role: 'the music channel can be used to play music',
                inline: true
            });

        const spotify = guild.channels.cache.find(c => c.id === guild_object.spotify);
        if (spotify)
            portal_state.push(<Field>{
                emote: `${spotify ? spotify.name : 'undefined'} _(spotify)_`,
                role: 'displays Music people in Portal\'s voice channels listen too',
                inline: true
            });

        const announcement = guild.channels.cache.find(c => c.id === guild_object.announcement);
        if (announcement)
            portal_state.push(<Field>{
                emote: `${announcement ? announcement.name : 'undefined'} _(announcement)_`,
                role: 'the announcement channel used by admins and portal',
                inline: true
            });

        portal_state.push(<Field>{ emote: 'Url-only', role: '', inline: false });

        const urls = guild_object.url_list.map(u_id => {
            const channel = guild.channels.cache.find(c => c.id === u_id);
            return <Field>{
                emote: `${channel ? channel.name : 'undefined'}`,
                role: 'these channels are url only',
                inline: true
            }
        });
        if (urls)
            portal_state = portal_state.concat(urls);

        message.channel.send(create_rich_embed(
            'Portal State',
            'current state of Portal',
            '#964B00',
            portal_state,
            null,
            null,
            true,
            null,
            null
        ));

        return resolve({ result: true, value: '' });
    });
};