import { Client, GuildCreateChannelOptions, Message, TextChannel } from "discord.js";
import { create_channel, create_music_channel, delete_channel, getOptions } from "../../../libraries/guildOps";
import { insert_announcement, insert_portal, insert_spotify, insert_url } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { PortalChannelPrtl } from "../../../types/classes/PortalChannelPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild) return resolve({ result: true, value: 'guild could not be fetched' });
		const current_guild = message.guild;

		current_guild.channels
			.create('portal-hub', { type: 'category' })
			.then(cat_channel => {
				current_guild.channels.cache.forEach(channel => {
					if (channel.id === guild_object.spotify ||
						channel.id === guild_object.announcement ||
						channel.id === guild_object.music_data.channel_id) {
						delete_channel(<TextChannel>channel, message);
					}
				});

				if (message.member) {
					const portal_options: GuildCreateChannelOptions = {
						topic: `by Portal, channels on demand`,
						type: 'voice',
						bitrate: 64000,
						userLimit: 1
					};
					const voice_regex = guild_object.premium
						? 'G$#-P$member_count | $status_list'
						: 'Channel $#'

					create_channel(current_guild, 'voice-portal', portal_options, cat_channel)
						.then(response => {
							if (response.result) {
								if (message.member) {
									insert_portal(guild_object.id, new PortalChannelPrtl(
										response.value, message.member.id, 'voice-portal', voice_regex,
										[], false, 2, 0, 0, guild_object.locale, true, true, 0, false
									));
								} else {
									return resolve({
										result: false,
										value: 'could not fetch member from message'
									});
								}
							} else {
								return resolve(response);
							}
						})
						.catch(error => { return resolve(error); });
				}

				const spotify_options = getOptions(current_guild, 'displays music users in portal channels are listening too', false);
				const announcement_options = getOptions(current_guild, 'announcements channel (Portal/Users/Admins)', false);
				const url_options = getOptions(current_guild, 'url only channel', true);

				create_channel(current_guild, 'spotify', spotify_options, cat_channel)
					.then(response => {
						if (response.result) {
							insert_spotify(guild_object.id, response.value);
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
				create_channel(current_guild, 'announcement', announcement_options, cat_channel)
					.then(response => {
						if (response.result) {
							insert_announcement(guild_object.id, response.value);
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
				create_channel(current_guild, 'url-only', url_options, cat_channel)
					.then(response => {
						if (response.result) {
							insert_url(guild_object.id, response.value);
						} else {
							return resolve(response);
						}
					})
					.catch(error => { return resolve(error); });
				create_music_channel(current_guild, 'music-player', cat_channel, guild_object);
			})
			.catch(console.error);

		return resolve({ result: true, value: 'setup has ran succesfully' });
	});
};
