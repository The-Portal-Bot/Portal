import { Client, Message } from "discord.js";
import { create_rich_embed } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { Field } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
    client: Client, message: Message, args: string[],
    guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
    return new Promise((resolve) => {
        const guild = client.guilds.cache.find(g => g.id === message?.guild?.id);
        if (!guild)
            return resolve({ result: false, value: 'could not fetch guild' });

        const portal_object = guild_list.find(g => g.id === message?.guild?.id);
        if (!portal_object)
            return resolve({ result: false, value: 'could not find guild please contact portal support' });

        let portal_tree = portal_object.portal_list.map(p => {
            const voices = p.voice_list.map(v => {
                const channel = guild.channels.cache.find(c => c.id === v.id);
                return `> voice: ${channel ? channel.name : 'undefined'}`;
            }).join('\n');
            const channel = guild.channels.cache.find(c => c.id === p.id);

            return <Field>{ emote: `portal: ${channel ? channel.name : 'undefined'}`, role: voices, inline: true }
        });

        const spotify = guild.channels.cache.find(c => c.id === portal_object.spotify);
        if (spotify)
            portal_tree.push(<Field>{
                emote: `spotify: ${spotify ? spotify.name : 'undefined'}`,
                role: 'displays Music people in Portal\'s voice channels listen too',
                inline: false
            });

        const announcement = guild.channels.cache.find(c => c.id === portal_object.announcement);
        if (announcement)
            portal_tree.push(<Field>{
                emote: `announcement: ${announcement ? announcement.name : 'undefined'}`,
                role: 'the announcement channel used by admins and portal',
                inline: false
            });

        const urls = portal_object.url_list.map(u_id => {
            const channel = guild.channels.cache.find(c => c.id === u_id);
            return <Field>{
                emote: `url: ${channel ? channel.name : 'undefined'}`,
                role: 'these channels are url only',
                inline: true
            }
        });
        console.log('urls :>> ', urls);
        if(urls)
            portal_tree = portal_tree.concat(urls);

        message.channel.send(create_rich_embed(
            'Portal Tree',
            'A tree of what portal controls in this server',
            '#964B00',
            portal_tree,
            null,
            null,
            true,
            null,
            null)
        );

        return resolve({ result: true, value: '' });
    });
};