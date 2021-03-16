import { Message, TextChannel } from "discord.js";
import { PortalChannelTypes } from "../../../data/enums/PortalChannel.enum";
import { create_music_channel, delete_channel, is_announcement_channel, is_music_channel, is_url_only_channel } from "../../../libraries/guild.library";
import { create_music_message, message_help } from "../../../libraries/help.library";
import { set_music_data } from "../../../libraries/mongo.library";
import { GuildPrtl, MusicData } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({
				result: false,
				value: 'message\'s guild could not be fetched'
			});

		if (args.length === 0) {
			if (is_music_channel(message.channel.id, guild_object)) {
				const music_data = new MusicData('null', 'null', [], false);
				set_music_data(guild_object.id, music_data)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'successfully removed music channel'
								: 'failed to remove music channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to remove music channel'
						});
					});
			}
			if (is_announcement_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: message_help('commands', 'music', 'this can\'t be set as the music channel for it is the announcement channel')
				});
			}
			if (is_url_only_channel(message.channel.id, guild_object)) {
				return resolve({
					result: false,
					value: message_help('commands', 'music', 'this can\'t be set as the Music channel for it is an url channel')
				});
			}
		}

		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';

		const music = message.guild.channels.cache.find(channel =>
			channel.id == guild_object.music_data.channel_id);

		if (music) {
			delete_channel(PortalChannelTypes.music, <TextChannel>music, message);
		}

		if (args.length === 0) {
			guild_object.music_data.channel_id = message.channel.id;
			const new_music = message.guild.channels.cache.find(channel =>
				channel.id == guild_object.music_data.channel_id);

			if (!new_music)
				return resolve({
					result: false,
					value: 'channel could not be fetched'
				});

			create_music_message(<TextChannel>new_music, guild_object);

			return resolve({
				result: true,
				value: 'this is now the Music channel'
			});
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
					value: message_help('commands', 'music')
				});
			}

			return resolve({
				result: result,
				value: value
			});
		}
	});
};