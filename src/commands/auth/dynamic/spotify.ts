import { Client, Message, TextChannel } from "discord.js";
import { create_channel, delete_channel, getOptions, included_in_url_list, is_announcement_channel, is_music_channel, is_spotify_channel } from "../../../libraries/guildOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { insert_spotify, ChannelTypePrtl } from "../../../libraries/mongoOps";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({
				result: true,
				value: 'guild could not be fetched'
			});

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

		if (spotify) delete_channel(ChannelTypePrtl.spotify, <TextChannel>spotify, message);

		if (args.length === 0) {
			insert_spotify(guild_object.id, message.channel.id)
				.then(r => {
					return resolve({
						result: r, value: r
							? 'set as the spotify channel successfully'
							: 'failed to set as the spotify channel'
					});
				})
				.catch(e => {
					return resolve({
						result: false, value: 'failed to set as the spotify channel'
					});
				});

			return resolve({
				result: true,
				value: 'this is now the Spotify channel'
			});
		} else if (args.length > 0) {
			let spotify_channel: string = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			let spotify_category: string | null = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			if (spotify_channel === '' && spotify_category !== '') {
				spotify_channel = spotify_category;
				spotify_category = null;
			}

			const spotify_options = getOptions(message.guild, 'displays song from spotify users in portal channels are listening too', false);

			create_channel(
				message.guild, spotify_channel,
				spotify_options, spotify_category
			)
				.then(r_create => {
					if (r_create.result) {
						insert_spotify(guild_object.id, r_create.value)
							.then(r_spotify => {
								return resolve({
									result: r_spotify, value: r_spotify
										? 'created spotify channel successfully'
										: 'failed to create a spotify channel'
								});
							})
							.catch(e => {
								return resolve({
									result: false, value: 'failed to create a spotify channel'
								});
							});
					} else {
						return resolve(r_create);
					}
				})
				.catch(e => { return resolve(e); });

		} else {
			return resolve({
				result: false,
				value: 'you can run `./help spotify` for help'
			});
		}
	});
};
