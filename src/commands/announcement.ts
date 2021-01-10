import { Client, Message, VoiceChannel } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import {
	is_announcement_channel, is_spotify_channel, is_music_channel,
	included_in_url_list, delete_channel, create_channel, getOptions
} from "../libraries/guildOps";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		if (message.guild === null) {
			return resolve({ result: true, value: 'message guild could not be fetched' });
		}

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

		if (announcement) delete_channel(announcement, message);

		if (args.length === 0) {
			guild_object.announcement = message.channel.id;
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
							guild_object.announcement = response.value;
							return resolve({ result: true, value: 'announcement channel and category created' });
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
							guild_object.announcement = response.value;
							return resolve({ result: true, value: 'announcement channel created' });
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else {
				return resolve({
					result: false,
					value: 'you can run "./help announcement" for help',
				});
			}
		}
	});
};
