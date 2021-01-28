import { Client, Guild, Presence, TextChannel, VoiceChannel } from "discord.js";
import { generate_channel_name } from "../libraries/guildOps";
import { create_rich_embed } from "../libraries/helpOps";
import { client_talk, get_function } from "../libraries/localisationOps";
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
			console.log('new name channel is the same as old');
			break;
		case 3:
			console.log('new channel name is empty');
			break;
		default:
			break;
	}
};

function time_out_repeat(
	current_voice_channel: VoiceChannelPrtl, current_guild: Guild,
	current_channel: VoiceChannel, current_portal_list: PortalChannelPrtl[], guild_object: GuildPrtl, minutes: number
): void {
	setTimeout(() => {
		update_channel_name(current_guild, current_channel, current_portal_list, guild_object);
		time_out_repeat(current_voice_channel, current_guild, current_channel, current_portal_list, guild_object, minutes);
	}, minutes * 60 * 1000);
};

function display_spotify_song(
	current_channel: VoiceChannel, guild_object: GuildPrtl, newPresence: Presence, client: Client
) {
	current_channel.members.forEach(member => {
		member.presence.activities.some(activity => {
			if (activity.name === 'Spotify' && newPresence.guild) {
				if (!guild_object) return false;

				const spotify = <TextChannel | undefined>newPresence.guild.channels.cache
					.find(c => { return c.id === guild_object.spotify; });

				if (spotify) {
					client_talk(client, guild_object, 'spotify');
					spotify.send(
						create_rich_embed(
							`**${activity.details}**`,
							'',
							'#1DB954',
							[
								{
									emote: 'Artist',
									role: `${activity.state}`,
									inline: false,
								},
								{
									emote: 'Album',
									role: `${activity.assets?.largeText}`,
									inline: false,
								},
							],
							activity.assets ? activity.assets.largeImageURL() : null,
							member,
							false,
							null,
							null
						)
					);
				}
			}
		});
	});
};

module.exports = async (
	args: { client: Client, newPresence: Presence | undefined }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!args.newPresence?.guild)
			return resolve({
				result: false,
				value: 'could not fetch guild from presence'
			});

		fetch_guild(args.newPresence?.guild.id)
			.then(guild_object => {
				if (guild_object) {
					if (!args.newPresence) return resolve({
						result: false,
						value: 'could not fetch presence'
					});
					if (!args.newPresence.member) return resolve({
						result: false,
						value: 'could not fetch presence member'
					});
					if (!args.newPresence.guild) return resolve({
						result: false,
						value: 'could not fetch presence guild'
					});

					const current_guild = args.newPresence.guild;
					const current_channel = args.newPresence.member.voice.channel;

					if (!current_channel) return resolve({
						result: false,
						value: ''
					});

					guild_object.portal_list.some(p => {
						p.voice_list.some(v => {
							if (v.id === current_channel.id) {
								if (guild_object.spotify !== 'null' && args.newPresence)
									display_spotify_song(current_channel, guild_object,
										args.newPresence, args.client);

								time_out_repeat(v, current_guild, current_channel, guild_object.portal_list,
									guild_object, 5);
							}
						});
					});

					const func = get_function('console', 'en', 'presence_controlled');
					return resolve({
						result: true,
						value: func
							? func(args.newPresence.member.displayName, args.newPresence.guild.name)
							: 'error with localisation'
					});
				} else {
					return resolve({
						result: false,
						value: 'could not find guild from portal'
					});
				}
			})
			.catch(e => {
				return resolve({
					result: false,
					value: 'error while fetching guild from portal'
				});
			});

	});
};