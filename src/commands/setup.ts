import { Client, Message, TextChannel } from "discord.js";
import {
	create_music_channel, create_portal_channel,
	delete_channel,
	create_channel,
	getOptions
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

					const spotify_options = getOptions(message.guild, 'displays music users in portal channels are listening too', false);
					const announcement_options = getOptions(message.guild, 'announcements channel (Portal/Users/Admins)', false);
					const url_options = getOptions(message.guild, 'url only channel', true);

					create_channel(message.guild, 'spotify', spotify_options, cat_channel)
					.then(response => {
							if (response.result) {
								guild_object.url_list.push(response.value);
								return resolve({ result: true, value: 'spotify channel and category created' });
							} else {
								return resolve(response);
							}
						})
						.catch(error => { return resolve(error); });
					create_channel(message.guild, 'announcement', announcement_options, cat_channel)
					.then(response => {
							if (response.result) {
								guild_object.url_list.push(response.value);
								return resolve({ result: true, value: 'announcement channel and category created' });
							} else {
								return resolve(response);
							}
						})
						.catch(error => { return resolve(error); });
					create_channel(message.guild, 'url-only', url_options, cat_channel)
					.then(response => {
							if (response.result) {
								guild_object.url_list.push(response.value);
								return resolve({ result: true, value: 'url channel and category created' });
							} else {
								return resolve(response);
							}
						})
						.catch(error => { return resolve(error); });
					create_music_channel(message.guild, 'music-player', cat_channel, guild_object);
				}
			})
			.catch(console.error);

		return resolve({
			result: true, value: 'setup has ran succesfull',
		});
	});
};
