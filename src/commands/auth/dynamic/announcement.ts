import { Client, Message, VoiceChannel } from "discord.js";
import { create_channel, delete_channel, getOptions, included_in_url_list, is_announcement_channel, is_music_channel, is_spotify_channel } from "../../../libraries/guildOps";
import { insert_announcement, ChannelTypePrtl } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (message.guild === null)
			return resolve({ result: true, value: 'message guild could not be fetched' });

		if (args.length === 0) {
			if (is_announcement_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this already is, the Announcement channel',
				});
			}
			if (is_spotify_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as the Announcemennt channel for it is the Spotify channel',
				});
			}
			if (is_music_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a Announcemennt channel for it is the Music channel',
				});
			}
			if (included_in_url_list(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as the Announcemennt channel for it is an url channel',
				});
			}
		}

		const announcement = <VoiceChannel>message.guild.channels.cache
			.find(channel => channel.id == guild_object.announcement);

		if (announcement) delete_channel(ChannelTypePrtl.announcement, announcement, message);

		if (args.length === 0) {
			insert_announcement(guild_object.id, message.channel.id)
				.then(response => {
					return resolve({
						result: response, value: response
							? 'set as the anouncement channel successfully'
							: 'failed to set as the anouncement channel'
					});
				})
				.catch(error => {
					return resolve({
						result: false, value: 'failed to set as the anouncement channel'
					});
				});

			return resolve({
				result: true,
				value: 'this is now the Announcement channel',
			});
		}
		else if (args.length > 0) {
			const announcement_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			const announcement_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
			const announcement_options = getOptions(message.guild, 'announcements channel (Portal/Users/Admins)', false);

			if (announcement_channel !== '') {
				create_channel(
					message.guild, announcement_channel,
					announcement_options, announcement_category
				)
					.then(response => {
						if (response.result) {
							insert_announcement(guild_object.id, response.value)
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created announcement channel and category successfully'
											: 'failed to create a announcement channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create a announcement channel'
									});
								});
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else if (announcement_channel === '' && announcement_category !== '') {
				create_channel(
					message.guild, announcement_category,
					announcement_options, null
				)
					.then(response => {
						if (response.result) {
							insert_announcement(guild_object.id, response.value)
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created announcement channel successfully'
											: 'failed to create a announcement channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create a announcement channel'
									});
								});
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else {
				return resolve({
					result: false,
					value: 'you can run `./help announcement` for help',
				});
			}
		}
	});
};
