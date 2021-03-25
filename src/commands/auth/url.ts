import { Message } from "discord.js";
import { create_channel, get_options, is_announcement_channel, is_music_channel, is_url_only_channel } from "../../libraries/guild.library";
import { message_help } from "../../libraries/help.library";
import { insert_url, remove_url } from "../../libraries/mongo.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({
				result: false,
				value: message_help('commands', 'url', 'guild could not be fetched')
			});

		if (args.length === 0) {
			if (is_url_only_channel(message.channel.id, guild_object)) {
				remove_url(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'successfully removed url channel'
								: message_help('commands', 'url', 'failed to remove url channel')
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: message_help('commands', 'url', 'failed to remove url channel')
						});
					});
			}
			else if (is_announcement_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: message_help('commands', 'url', 'this can\'t be set as a URL channel for it is the Announcement channel')
				});
			}
			else if (is_music_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: message_help('commands', 'url', 'this can\'t be set as a URL channel for it is the Music channel')
				});
			}
			else {
				insert_url(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'set as an url channel successfully'
								: message_help('commands', 'url', 'failed to set as an url channel')
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: message_help('commands', 'url', 'failed to set as an url channel')
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

			const url_options = get_options(message.guild, 'url only channel', true);

			create_channel(
				message.guild, url_channel, url_options, url_category
			)
				.then(r_create => {
					insert_url(guild_object.id, r_create)
						.then(r_url => {
							return resolve({
								result: r_url,
								value: r_url
									? 'created url channel and category successfully'
									: message_help('commands', 'url', 'failed to create a url channel')
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: message_help('commands', 'url', 'failed to create a url channel')
							});
						});
				})
				.catch(e => {
					return resolve(e);
				});
		}
		else {
			return resolve({
				result: false,
				value: message_help('commands', 'url', 'you can run `./help url` for help')
			});
		}
	});
};
