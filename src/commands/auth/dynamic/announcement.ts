import { Message, VoiceChannel } from "discord.js";
import { create_channel, delete_channel, getOptions, included_in_url_list, is_announcement_channel, is_music_channel, is_spotify_channel } from "../../../libraries/guildOps";
import { ChannelTypePrtl, insert_announcement } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (message.guild === null)
			return resolve({
				result: false,
				value: 'message guild could not be fetched'
			});

		if (args.length === 0) {
			if (is_announcement_channel(message.channel.id, guild_object)) {
				console.log('this already is, the announcement channel');
				return resolve({
					result: false,
					value: 'this already is, the announcement channel'
				});
			}
			if (is_spotify_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: 'this can\'t be set as the announcemennt channel for it is the spotify channel'
				});
			}
			if (is_music_channel(message.channel.id, guild_object)) {
				resolve({
					result: false,
					value: 'this can\'t be set as an announcemennt channel for it is the music channel'
				});
			}
			if (included_in_url_list(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: 'this can\'t be set as the announcemennt channel for it is an url channel'
				});
			}
		}

		const announcement = <VoiceChannel>message.guild.channels.cache
			.find(channel => channel.id == guild_object.announcement);

		if (announcement) delete_channel(ChannelTypePrtl.announcement, announcement, message);

		if (args.length === 0) {
			insert_announcement(guild_object.id, message.channel.id)
				.then(r => {
					return resolve({
						result: r, value: r
							? 'set as the anouncement channel successfully'
							: 'failed to set as the anouncement channel'
					});
				})
				.catch(e => {
					return resolve({
						result: false, value: 'failed to set as the anouncement channel'
					});
				});

			return resolve({
				result: true,
				value: 'this is now the Announcement channel'
			});
		}
		else if (args.length > 0) {
			let announcement_channel: string = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			let announcement_category: string | null = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			if (announcement_channel === '' && announcement_category !== '') {
				announcement_channel = announcement_category;
				announcement_category = null;
			}

			const announcement_options = getOptions(message.guild, 'announcements channel (Portal/Users/Admins)', false);

			create_channel(
				message.guild, announcement_channel,
				announcement_options, announcement_category
			)
				.then(r_channel => {
					if (r_channel.result) {
						insert_announcement(guild_object.id, r_channel.value)
							.then(r_announcement => {
								return resolve({
									result: r_announcement, value: r_announcement
										? 'created announcement channel and category successfully'
										: 'failed to create a announcement channel'
								});
							})
							.catch(e => {
								return resolve({
									result: false, value: 'failed to create a announcement channel'
								});
							});
					} else {
						return resolve(r_channel);
					}
				})
				.catch(e => { return resolve(e); });
		} else {
			return resolve({
				result: false,
				value: 'you can run `./help announcement` for help'
			});
		}
	});
};
