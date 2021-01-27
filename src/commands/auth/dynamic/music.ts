import { Client, Message, TextChannel } from "discord.js";
import { create_music_channel, delete_channel, included_in_url_list, is_announcement_channel, is_music_channel, is_spotify_channel } from "../../../libraries/guildOps";
import { create_music_message } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { ChannelTypePrtl } from "../../../libraries/mongoOps";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({ result: true, value: 'message\'s guild could not be fetched' });

		if (args.length === 0) {
			if (is_music_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this already is, the Music channel',
				});
			}
			if (is_spotify_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as the Music channel for it is the Spotify channel',
				});
			}
			if (is_announcement_channel(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as the Music channel for it is the Announcement channel',
				});
			}
			if (included_in_url_list(message.channel.id, guild_object)) {
				return resolve({
					result: true,
					value: 'this can\'t be set as the Music channel for it is an url channel',
				});
			}
		}

		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';
		const music = message.guild.channels.cache.find(channel =>
			channel.id == guild_object.music_data.channel_id);

		if (music) delete_channel(ChannelTypePrtl.music, <TextChannel>music, message);

		if (args.length === 0) {
			guild_object.music_data.channel_id = message.channel.id;
			const new_music = message.guild.channels.cache.find(channel =>
				channel.id == guild_object.music_data.channel_id);

			if (!new_music)
				return resolve({ result: false, value: 'channel could not be fetched' });

			create_music_message(<TextChannel>new_music, portal_icon_url, guild_object);

			return resolve({ result: true, value: 'this is now the Music channel' });
		}
		else if (args.length > 0) {
			const music_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			const music_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			let result = false;
			let value = null;

			if (music_channel !== '') {
				create_music_channel(message.guild, music_channel, music_category, guild_object);
				result = true;
				value = 'music channel and category have been created';
			}
			else if (music_channel === '' && music_category !== '') {
				create_music_channel(message.guild, music_category, null, guild_object);
				result = true;
				value = 'music channel has been created';
			}
			else {
				return resolve({
					result: false,
					value: 'you can run `./help music` for help',
				});
			}

			return resolve({
				result: result,
				value: value,
			});
		}
	});
};