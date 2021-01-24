import { Client, Guild, Presence, TextChannel, VoiceChannel } from "discord.js";
import { generate_channel_name, included_in_portal_guilds } from "../libraries/guildOps";
import { create_rich_embed } from "../libraries/helpOps";
import { client_log, client_talk, get_function } from "../libraries/localisationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl";
import { VoiceChannelPrtl } from "../types/classes/VoiceChannelPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function update_channel_name(
	current_guild: Guild, current_channel: VoiceChannel, current_portal_list: PortalChannelPrtl[], guild_list: GuildPrtl[]
) {
	const guild_object = guild_list.find(g => g.id === current_guild.id);
	if (!guild_object) return;

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

function time_out_repeat(current_voice_channel: VoiceChannelPrtl, current_guild: Guild,
	current_channel: VoiceChannel, current_portal_list: PortalChannelPrtl[], guild_list: GuildPrtl[], minutes: number) {
	setTimeout(() => {
		update_channel_name(current_guild, current_channel, current_portal_list, guild_list);
		time_out_repeat(current_voice_channel, current_guild, current_channel, current_portal_list, guild_list, minutes);
	}, minutes * 60 * 1000);
};

function display_spotify_song(
	current_guild: Guild, current_channel: VoiceChannel,
	guild_list: GuildPrtl[], newPresence: Presence, client: Client
) {
	current_channel.members.forEach(member => {
		member.presence.activities.some(activity => {
			if (activity.name === 'Spotify' && newPresence.guild) {
				const guild_object = guild_list.find(g => g.id === current_guild.id);
				if (guild_object === undefined) return false;

				const spotify = <TextChannel | undefined>newPresence.guild.channels.cache.find(c => {
					return c.id === guild_object.spotify;
				});

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
	args: { client: Client, guild_list: GuildPrtl[], newPresence: Presence | undefined }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.newPresence === null) return resolve({ result: true, value: 'could not fetch presence' });
		if (args.newPresence === undefined) return resolve({ result: true, value: 'could not fetch presence' });
		if (args.newPresence.user === null) return resolve({ result: true, value: 'could not fetch presence user' });
		if (args.newPresence.member === null) return resolve({ result: true, value: 'could not fetch presence member' });
		if (args.newPresence.guild === null) return resolve({ result: true, value: 'could not fetch presence guild' });
		if (args.newPresence.user.bot) return null; // resolve({ result: true, value: 'not handling bot presence update' });

		const current_guild = args.newPresence.guild;
		const current_channel = args.newPresence.member.voice.channel;

		if (!included_in_portal_guilds(args.newPresence.guild.id, args.guild_list)) {
			return resolve({
				result: false,
				value: client_log(null, args.guild_list, 'presence_controlled_away', args.guild_list),
			});
		}

		if (current_channel) { // if member is in a channel
			const guild_object = args.guild_list.find(g => g.id === current_guild.id);
			if (guild_object) {
				guild_object.portal_list.some(p => {
					p.voice_list.some(v => {
						if (v.id === current_channel.id) {
							if (guild_object.spotify !== null && args.newPresence) {
								display_spotify_song(current_guild, current_channel, args.guild_list,
									args.newPresence, args.client);
							}

							time_out_repeat(v, current_guild, current_channel, guild_object.portal_list,
								args.guild_list, 5);
						}
					});
				});
			}
		}

		const func = get_function('console', 'en', 'presence_controlled');
		return resolve({
			result: true,
			value: func
				? func(args.newPresence.member.displayName, args.newPresence.guild.name)
				: 'error with localisation'
		});
	});
};