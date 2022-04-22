import { Message, VoiceChannel } from "discord.js";
import { create_channel, delete_channel, get_options, is_announcement_channel, is_music_channel, is_url_only_channel } from "../../libraries/guild.library";
import { update_guild } from "../../libraries/mongo.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { PortalChannelTypes } from "../../data/enums/PortalChannel.enum";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";
import { message_help } from "../../libraries/help.library";
import { ChannelTypes } from "discord.js/typings/enums";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild) {
			return resolve({
				result: false,
				value: 'message guild could not be fetched'
			});
		}

		if (args.length === 0) {
			if (is_announcement_channel(message.channel.id, guild_object)) {
				update_guild(guild_object.id, 'announcement', 'null')
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'successfully removed announcement channel'
								: 'failed to remove announcement channel'
						});
					})
					.catch(() => {
						return resolve({
							result: false,
							value: 'failed to remove announcement channel'
						});
					});
			}
			if (is_music_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: 'this can\'t be set as an announcemennt channel for it is the music channel'
				});
			}
			if (is_url_only_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: 'this can\'t be set as the announcemennt channel for it is an url channel'
				});
			}
		}

		if (!is_announcement_channel(message.channel.id, guild_object)) {
			const announcement = <VoiceChannel>message.guild.channels.cache
				.find(channel => channel.id == guild_object.announcement);

			if (announcement) {
				delete_channel(PortalChannelTypes.announcement, announcement, message)
					.catch((e: any) => {
						return resolve({
							result: false,
							value: `failed to delete channel / ${e}`
						});
					});
			}

			if (args.length === 0) {
				update_guild(guild_object.id, 'announcement', message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'set as the anouncement channel successfully'
								: 'failed to set as the anouncement channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `an error occurred while setting channel / ${e}`
						});
					});

				return resolve({
					result: true,
					value: 'this is now the announcement channel'
				});
			}
			else if (args.length > 0) {
				let announcement_channel: string = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1);
				let announcement_category: string | null = args.join(' ').substring(args.join(' ').indexOf('|'));

				if (announcement_channel === '' && announcement_category !== '') {
					announcement_channel = announcement_category;
					announcement_category = null;
				}

				const announcement_options = get_options(message.guild, 'announcements channel (Portal/Users/Admins)', false, undefined, ChannelTypes.GUILD_NEWS);

				create_channel(
					message.guild, announcement_channel,
					announcement_options, announcement_category
				)
					.then(r_channel => {
						update_guild(guild_object.id, 'announcement', r_channel)
							.then(r_announcement => {
								return resolve({
									result: r_announcement,
									value: r_announcement
										? 'created announcement channel successfully'
										: 'failed to create a announcement channel'
								});
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `failed to create a announcement channel / ${e}`
								});
							});
					})
					.catch((e: any) => {
						return resolve(e);
					});
			} else {
				return resolve({
					result: false,
					value: message_help('commands', 'announcement')
				});
			}
		}
	});
};
