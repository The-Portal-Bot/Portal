import { Client, Guild, Presence, TextChannel, VoiceChannel } from "discord.js";
import { generate_channel_name } from "../libraries/guildOps";
import { create_rich_embed } from "../libraries/helpOps";
import { fetch_guild } from "../libraries/mongoOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl";
import { VoiceChannelPrtl } from "../types/classes/VoiceChannelPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function update_channel_name(
	current_guild: Guild, current_channel: VoiceChannel, current_portal_list: PortalChannelPrtl[], guild_object: GuildPrtl
) {
	switch (generate_channel_name(current_channel, current_portal_list, guild_object, current_guild)) {
		case 1:
			// current_voice_channel.last_update = Date.now();
			break;
		case 2:
			// console.log('new name channel is the same as old');
			break;
		case 3:
			// console.log('new channel name is empty');
			break;
		default:
			break;
	}
};

function time_out_repeat(
	current_voice_channel: VoiceChannelPrtl, current_guild: Guild, current_channel: VoiceChannel,
	current_portal_list: PortalChannelPrtl[], minutes: number
): void {
	fetch_guild(current_guild.id)
		.then(guild_object => {
			if (guild_object) {
				setTimeout(() => {
					if (!current_guild.deleted && !current_channel.deleted) {
						update_channel_name(current_guild, current_channel, current_portal_list, guild_object);
						time_out_repeat(current_voice_channel, current_guild, current_channel, current_portal_list, minutes);
					}
				}, minutes * 60 * 1000);
			}
		})
		.catch(() => {
			return;
		});
};

function display_spotify_song(
	spotify_data: { spotify: string, portal_list: PortalChannelPrtl[] }, newPresence: Presence, client: Client
) {
	newPresence.activities.some(activity => {
		if (activity.name === 'Spotify' && newPresence.guild) {
			const spotify = <TextChannel | undefined>newPresence.guild.channels.cache
				.find(c => c.id === spotify_data.spotify);

			if (spotify) {
				spotify.send(
					create_rich_embed(
						`**${activity.details}**`,
						'',
						'#1DB954',
						[
							{
								emote: 'Artist',
								role: `${activity.state}`,
								inline: true,
							},
							{
								emote: 'Album',
								role: `${activity.assets?.largeText}`,
								inline: true,
							},
						],
						activity.assets ? activity.assets.largeImageURL() : null,
						newPresence.member,
						true,
						null,
						null
					)
				);
			}
		}
	});
};

module.exports = async (
	args: { client: Client, newPresence: Presence | undefined }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!args.newPresence?.guild) {
			return resolve({
				result: false,
				value: 'could not fetch guild from presence'
			});
		}
	});
};