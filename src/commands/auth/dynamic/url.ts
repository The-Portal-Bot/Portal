import { Message } from "discord.js";
import { create_channel, getOptions, is_url_only_channel, is_announcement_channel, is_music_channel, is_spotify_channel } from "../../../libraries/guildOps";
import { insert_url, remove_url } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

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
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'successfully removed url channel'
								: 'failed to remove url channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to remove url channel'
						});
					});
			}
			else if (is_announcement_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: 'this can\'t be set as a URL channel for it is the Announcement channel',
				});
			}
			else if (is_spotify_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: 'this can\'t be set as a URL channel for it is the Spotify channel',
				});
			}
			else if (is_music_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as a URL channel for it is the Music channel',
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
							value: 'failed to set as an url channel'
						});
					});
			}
		} else if (args.length > 0) {
			let url_channel: string = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			let url_category: string | null = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			if (url_channel === '' && url_category !== '') {
				url_channel = url_category;
				url_category = null;
			}

			const spotify_options = getOptions(message.guild, 'url only channel', true);

			create_channel(
				message.guild, url_channel,
				spotify_options, url_category
			)
				.then(r_create => {
					if (r_create.result) {
						insert_url(guild_object.id, r_create.value)
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
									value: 'failed to create a url channel'
								});
							});
					} else {
						return resolve(r_create);
					}
				})
				.catch(e => {
					return resolve(e);
				});
		}
		else {
			return resolve({
				result: false,
				value: 'you can run `./help url` for help'
			});
		}
	});
};
