import { Client, Message } from "discord.js";
import {
	create_channel, getOptions, included_in_url_list,
	is_announcement_channel, is_music_channel, is_spotify_channel
} from "../libraries/guildOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		if (!message.guild) {
			return resolve({ result: true, value: 'guild could not be fetched' });
		}

		if (args.length === 0) {
			if (included_in_url_list(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this already is a URL channel',
				});
			}
			if (is_announcement_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a URL channel for it is the Announcement channel',
				});
			}
			if (is_spotify_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a URL channel for it is the Spotify channel',
				});
			}
			if (is_music_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a URL channel for it is the Music channel',
				});
			}
		}

		if (args.length === 0) {
			guild_object.url_list.push(message.channel.id);

			resolve({ result: true, value: 'this is now the url channel' });
		}
		else if (args.length > 0) {
			const url_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			const url_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
			const spotify_options = getOptions(message.guild, 'url only channel', true);

			if (url_channel !== '') {
				create_channel(
					message.guild, url_channel,
					spotify_options, url_category
				)
					.then(response => {
						if (response.result) {
							guild_object.url_list.push(response.value);
							return resolve({ result: true, value: 'url channel and category created' });
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else if (url_channel === '' && url_category !== '') {
				create_channel(
					message.guild, url_category,
					spotify_options, null
				)
					.then(response => {
						if (response.result) {
							guild_object.url_list.push(response.value);
							return resolve({ result: true, value: 'url channel created' });
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else {
				resolve({ result: false, value: 'you can run "./help url" for help' });
			}
		}
	});
};
