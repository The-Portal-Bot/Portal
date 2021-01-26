import { Client, Message, TextChannel } from "discord.js";
import { create_channel, delete_channel, getOptions, included_in_url_list, is_announcement_channel, is_music_channel, is_spotify_channel } from "../../../libraries/guildOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { insert_spotify } from "../../../libraries/mongoOps";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({ result: true, value: 'guild could not be fetched' });

		if (args.length === 0) {
			if (is_spotify_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this already is, the Spotify channel'
				});
			}
			else if (is_music_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a Spotify channel for it is the Music channel'
				});
			}
			else if (is_announcement_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as the Spotify channel for it is the Announcement channel'
				});
			}
			else if (included_in_url_list(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as the Spotify channel for it is an url channel'
				});
			}
		}

		const spotify = message.guild.channels.cache
			.find(channel => channel.id == guild_object.spotify);

		if (spotify) delete_channel(<TextChannel>spotify, message);

		if (args.length === 0) {
			insert_spotify(guild_object.id, message.channel.id)
				.then(response => {
					return resolve({
						result: response, value: response
							? 'set as the spotify channel successfully'
							: 'failed to set as the spotify channel'
					});
				})
				.catch(error => {
					return resolve({
						result: false, value: 'failed to set as the spotify channel'
					});
				});

			return resolve({
				result: true,
				value: 'this is now the Spotify channel'
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
							insert_spotify(guild_object.id, response.value)
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created spotify channel successfully'
											: 'failed to create a spotify channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create a spotify channel'
									});
								});
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
							insert_spotify(guild_object.id, response.value)
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created spotify channel successfully'
											: 'failed to create a spotify channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create a spotify channel'
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
					value: 'you can run `./help spotify` for help'
				});
			}
		}
	});
};
