import { Client, Message, TextChannel } from "discord.js";
import {
	delete_channel, included_in_url_list, is_announcement_channel,
	is_music_channel, is_spotify_channel, getOptions, create_channel
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
			if (is_spotify_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: '*this already is, the Spotify channel.*'
				});
			}
			if (is_music_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: '*this can\'t be set as a Spotify channel for it is the Music channel.*'
				});
			}
			if (is_announcement_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: '*this can\'t be set as the Spotify channel for it is the Announcement channel.*'
				});
			}
			if (included_in_url_list(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: '*this can\'t be set as the Spotify channel for it is an url channel.*'
				});
			}
		}

		const spotify = message.guild.channels.cache
			.find(channel => channel.id == guild_object.spotify);

		if (spotify) delete_channel(<TextChannel>spotify, message);

		if (args.length === 0) {
			guild_object.spotify = message.channel.id;

			return resolve({
				result: true,
				value: '*this is now the Spotify channel.*'
			});
		}
		else if (args.length > 0) {
			const spotify_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			const spotify_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
			const spotify_options = getOptions(message.guild, 'displays music users in portal channels are listening too', false);

			if (spotify_channel !== '') {
				create_channel(
					message.guild, spotify_channel,
					spotify_options, spotify_category
				)
					.then(response => {
						if (response.result) {
							guild_object.spotify = response.value;
							return resolve({ result: true, value: 'spotify channel and category created' });
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else if (spotify_channel === '' && spotify_category !== '') {
				create_channel(
					message.guild, spotify_category,
					spotify_options, null
				)
					.then(response => {
						if (response.result) {
							guild_object.spotify = response.value;
							return resolve({ result: true, value: 'spotify channel created' });
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else {
				return resolve({
					result: false,
					value: '*you can run "./help spotify" for help.*'
				});
			}
		}
	});
};
