import { Client, Message } from "discord.js";
import { create_rich_embed, message_help } from "../../../libraries/help.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        const guild = client.guilds.cache.find(g => g.id === message?.guild?.id);
        if (!guild) {
            return resolve({
                result: false,
                value: message_help('commands', 'state', 'could not fetch guild')
            });
        }

        let portal_state = [<Field>{
            emote: 'Portal Channels',
            role: '',
            inline: false
        }];

        const portals = guild_object.portal_list.map(p => {
            const portal_channel = guild.channels.cache
                .find(c => c.id === p.id);
            const voices = p.voice_list
                .map((v, index_v) => {
                    const voice_channel = guild.channels.cache.find(c => c.id === v.id);
                    return `${index_v + 1}. ${voice_channel ? voice_channel.name : 'unavailable'}`;
                })
                .join('\n');

            return <Field>{
                emote: `${portal_channel ? portal_channel.name : 'unavailable'}`,
                role: voices ? voices : 'no voice',
                inline: true
            }
        });

        if (portals) {
            portal_state = portal_state.concat(portals);
        }

        portal_state.push(<Field>{
            emote: '',
            role: '',
            inline: false
        });

        const music = guild.channels.cache.find(c =>
            c.id === guild_object.music_data.channel_id);

        if (music) {
            portal_state.push(<Field>{
                emote: `Music channel`,
                role: `${music ? music.name : 'unavailable'}`,
                inline: true
            });
        } else {
            portal_state.push(<Field>{
                emote: `Music channel`,
                role: `none`,
                inline: true
            });
        }

        const announcement = guild.channels.cache.find(c =>
            c.id === guild_object.announcement);

        if (announcement) {
            portal_state.push(<Field>{
                emote: 'Announcement channel',
                role: `${announcement ? announcement.name : 'unavailable'}`,
                inline: true
            });
        } else {
            portal_state.push(<Field>{
                emote: `Announcement channel`,
                role: `none`,
                inline: true
            });
        }

        portal_state.push(<Field>{
            emote: '',
            role: '',
            inline: false
        });

        const urls = guild_object.url_list.map((u_id, index_u) => {
            const channel = guild.channels.cache.find(c =>
                c.id === u_id);
            return `${index_u + 1}. ${channel ? channel.name : 'unavailable'}`;
        });

        if (urls.length > 0) {
            const url_sum = <Field>{
                emote: `URL channels`,
                role: urls ? urls.join('\n') : 'unavailable',
                inline: true
            };

            portal_state = portal_state.concat(url_sum);
        } else {
            portal_state.push(<Field>{
                emote: `URL channels`,
                role: `none`,
                inline: true
            });
        }

        const ignore = guild_object.ignore_list.map((u_id, index_u) => {
            const channel = guild.channels.cache.find(c =>
                c.id === u_id);
            return `${index_u + 1}. ${channel ? channel.name : 'unavailable'}`;
        });

        if (ignore.length > 0) {
            const ignore_sum = <Field>{
                emote: `Ignored channels`,
                role: ignore ? ignore.join('\n') : 'unavailable',
                inline: true
            };

            portal_state = portal_state.concat(ignore_sum);
        } else {
            portal_state.push(<Field>{
                emote: `Ignored channels`,
                role: `none`,
                inline: true
            });
        }

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