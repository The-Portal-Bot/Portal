import { Client, Message, TextChannel } from "discord.js";
import {
	create_announcement_channel, create_music_channel, create_portal_channel,
	create_spotify_channel, create_url_channel, delete_channel
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

		message.guild.channels
			.create('portal-hub', { type: 'category' })
			.then(cat_channel => {
				if (message.guild) {
					message.guild.channels.cache.forEach(channel => {
						if (channel.id === guild_object.spotify ||
							channel.id === guild_object.announcement ||
							channel.id === guild_object.music_data.channel_id) {
							delete_channel(<TextChannel>channel, message);
						}
					});

					if (message.member) {
						create_portal_channel(
							message.guild, 'portal-to-voice', cat_channel,
							guild_object.portal_list, guild_object, message.member.id
						);
					}
					create_spotify_channel(message.guild, 'spotify', cat_channel, guild_object);
					create_announcement_channel(message.guild, 'announcement', cat_channel, guild_object);
					create_url_channel(message.guild, 'url-only', cat_channel, guild_object.url_list);
					create_music_channel(message.guild, 'music-player', cat_channel, guild_object);
				}
			})
			.catch(console.error);

		return resolve({
			result: true, value: '*setup has ran succesfully*',
		});
	});
};
