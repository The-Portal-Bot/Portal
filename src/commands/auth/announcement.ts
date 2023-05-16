import { ChannelType, Message, VoiceChannel } from 'discord.js';
import {
    create_channel,
    delete_channel,
    get_options,
    is_announcement_channel,
    is_music_channel,
    is_url_only_channel,
} from '../../libraries/guild.library';
import { updateGuild } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { PortalChannelTypes } from '../../data/enums/PortalChannel.enum';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { messageHelp } from '../../libraries/help.library';
import { SlashCommandBuilder } from '@discordjs/builders';

async function doesChannelHaveUsage(message: Message, guild_object: PGuild) {
    if (is_announcement_channel(message.channel.id, guild_object)) {
        const response = await updateGuild(guild_object.id, 'announcement', 'null').catch(() => {
            return {
                result: true,
                value: 'failed to remove announcement channel',
            };
        });

        return {
            result: true,
            value: response ? 'successfully removed announcement channel' : 'failed to remove announcement channel',
        };
    }

    if (is_music_channel(message.channel.id, guild_object)) {
        return {
            result: true,
            value: "this can't be set as an announcement channel for it is the music channel",
        };
    }

    if (is_url_only_channel(message.channel.id, guild_object)) {
        return {
            result: true,
            value: "this can't be set as the announcement channel for it is an url channel",
        };
    }

    return {
        result: false,
        value: '',
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('makes an announcement channel')
        .addStringOption((option) =>
            option
                .setName('announcement')
                .setDescription('The announcement you want to make')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute(message: Message, args: string[], guild_object: PGuild): Promise<ReturnPromise> {
        if (!message.guild) {
            return {
                result: false,
                value: 'message guild could not be fetched',
            };
        }

        if (args.length === 0) {
            const response = await doesChannelHaveUsage(message, guild_object);
            if (response.result) {
                return {
                    result: false,
                    value: response.value,
                };
            }
        }

        const announcement = <VoiceChannel>(
            message.guild.channels.cache.find((channel) => channel.id == guild_object.announcement)
        );

        if (announcement) {
            delete_channel(PortalChannelTypes.announcement, announcement, message).catch((e: any) => {
                return {
                    result: false,
                    value: `failed to delete channel: ${e}`,
                };
            });
        }

        if (args.length === 0) {
            const response = await updateGuild(guild_object.id, 'announcement', message.channel.id);

            return {
                result: response,
                value: response
                    ? 'this is now the announcement channel'
                    : 'failed to set this as the announcement channel',
            };
        } else if (args.length > 0) {
            let announcement_channel: string = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1);
            let announcement_category: string | null = args.join(' ').substring(args.join(' ').indexOf('|'));

            if (announcement_channel === '' && announcement_category !== '') {
                announcement_channel = announcement_category;
                announcement_category = null;
            }

            const announcement_options = get_options(
                message.guild,
                'announcements channel (Portal/Users/Admins)',
                false,
                undefined,
                ChannelType.GuildAnnouncement
            );
            let createdChannelId: string;
            try {
                createdChannelId = await create_channel(
                    message.guild,
                    announcement_channel,
                    announcement_options,
                    announcement_category
                );
            } catch (e) {
                return Promise.reject(e);
            }

            try {
                const response = await updateGuild(guild_object.id, 'announcement', createdChannelId);
                return {
                    result: response,
                    value: response
                        ? 'created announcement channel successfully'
                        : 'failed to create a announcement channel',
                };
            } catch (e) {
                return {
                    result: false,
                    value: `failed to create a announcement channel: ${e}`,
                };
            }
        }

        return {
            result: false,
            value: messageHelp('commands', 'announcement'),
        };
    },
};
