import { Message } from "discord.js";
import { create_channel, get_options, is_announcement_channel, is_music_channel, is_url_only_channel } from "../../libraries/guild.library";
import { messageHelp } from "../../libraries/help.library";
import { insert_url, remove_url } from "../../libraries/mongo.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        if (!message.guild)
            return resolve({
                result: false,
                value: 'guild could not be fetched'
            });

        if (args.length === 0) {
            if (is_url_only_channel(message.channel.id, guild_object)) {
                remove_url(guild_object.id, message.channel.id)
                    .then((r: boolean) => {
                        return resolve({
                            result: r,
                            value: r
                                ? 'successfully removed url channel'
                                : 'failed to remove url channel'
                        });
                    })
                    .catch((e: string) => {
                        return resolve({
                            result: false,
                            value: `failed to remove url channel: ${e}`
                        });
                    });
            }
            else if (is_announcement_channel(message.channel.id, guild_object)) {
                return resolve({
                    result: false,
                    value: 'this can\'t be set as a URL channel for it is the Announcement channel'
                });
            }
            else if (is_music_channel(message.channel.id, guild_object)) {
                return resolve({
                    result: true,
                    value: 'this can\'t be set as a URL channel for it is the Music channel'
                });
            }
            else {
                insert_url(guild_object.id, message.channel.id)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? 'set as an url channel successfully'
                                : 'failed to set as an url channel'
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `failed to set as an url channel: ${e}`
                        });
                    });
            }
        } else if (args.length > 0) {
            let url_channel: string = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1);
            let url_category: string | null = args.join(' ').substring(args.join(' ').indexOf('|'));

            if (url_channel === '' && url_category !== '') {
                url_channel = url_category;
                url_category = null;
            }

            const url_options = get_options(message.guild, 'url only channel');

            create_channel(
                message.guild, url_channel, url_options, url_category
            )
                .then(r_create => {
                    insert_url(guild_object.id, r_create)
                        .then(r_url => {
                            return resolve({
                                result: r_url,
                                value: r_url
                                    ? 'created url channel and category successfully'
                                    : 'failed to create a url channel'
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `failed to create a url channel: ${e}`
                            });
                        });
                })
                .catch((e: any) => {
                    return resolve(e);
                });
        }
        else {
            return resolve({
                result: false,
                value: messageHelp('commands', 'url')
            });
        }
    });
};
