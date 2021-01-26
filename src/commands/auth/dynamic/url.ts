import { Client, Message } from "discord.js";
import { create_channel, getOptions, included_in_url_list, is_announcement_channel, is_music_channel, is_spotify_channel } from "../../../libraries/guildOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { insert_url } from "../../../libraries/mongoOps";

module.exports = async (
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({ result: true, value: 'guild could not be fetched' });

		if (args.length === 0) {
			if (included_in_url_list(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this already is a URL channel',
				});
			}
			else if (is_announcement_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a URL channel for it is the Announcement channel',
				});
			}
			else if (is_spotify_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a URL channel for it is the Spotify channel',
				});
			}
			else if (is_music_channel(message.channel.id, guild_object)) {
				resolve({
					result: true,
					value: 'this can\'t be set as a URL channel for it is the Music channel',
				});
			}
			else {
				insert_url(guild_object.id, message.channel.id)
					.then(response => {
						return resolve({
							result: response, value: response
								? 'set as an url channel successfully'
								: 'failed to set as an url channel'
						});
					})
					.catch(error => {
						return resolve({
							result: false, value: 'failed to set as an url channel'
						});
					});
			}
		} else if (args.length > 0) {
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
							insert_url(guild_object.id, response.value)
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created url channel and category successfully'
											: 'failed to create a url channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create a url channel'
									});
								});
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
							insert_url(guild_object.id, response.value)
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created url channel successfully'
											: 'failed to create a url channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create a url channel'
									});
								});
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
			}
			else {
				resolve({ result: false, value: 'you can run `./help url` for help' });
			}
		}
	});
};
