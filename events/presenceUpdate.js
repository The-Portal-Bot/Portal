/* eslint-disable no-undef */
const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');
const help_mngr = require('./../functions/help_manager');

time_out_repeat = function(current_voice_channel, current_guild, current_channel, current_portal_list, args, mins) {
	setTimeout(() => {
		this.update_channel_name(current_voice_channel, current_guild, current_channel, current_portal_list, args);
		this.time_out_repeat(current_voice_channel, current_guild, current_channel, current_portal_list, args, mins);
	}, mins * 60 * 1000);
};

display_spotify_song = function(current_guild, current_channel, args) {
	current_channel.members.forEach(member => {
		member.presence.activities.some(activity => {
			if (activity.name === 'Spotify') {
				const spotify = args.newPresence.guild.channels.cache
					.find(channel => channel.id === args.guild_list[current_guild.id].spotify);

				if (spotify) {
					lclz_mngr
						.client_talk(args.client, args.guild_list, 'spotify');
					spotify
						.send(help_mngr.create_rich_embed(
							`**${activity.details}**`,
							'',
							'#1DB954',
							[
								{
									emote: 'Artist',
									role: `***${activity.state}***`,
									inline: false,
								},
								{
									emote: 'Album',
									role: `***${activity.assets.largeText}***`,
									inline: false,
								},
							],
							activity.assets.largeImageURL(),
							member,
							false,
						));
				}
			}
		});
	});
};

update_channel_name = function(current_voice_channel, current_guild, current_channel, current_portal_list, args) {
	switch (guld_mngr.generate_channel_name(current_channel, current_portal_list,
		args.guild_list[current_guild.id], current_guild)) {
	case 1:
		current_voice_channel.last_update = Date.now();
		break;
	case 2:
		console.log('new name channel is the same as old');
		break;
	case 3:
		console.log('new channel name is lesser than length');
		break;
	default:
		break;
	}
};

module.exports = async (args) => {
	if (args.newPresence.user.bot) {return { result: true, value: 'not handling bot presence update' };}

	const current_guild = args.newPresence.guild;
	const current_channel = args.newPresence.member.voice.channel;

	if (!guld_mngr.included_in_portal_guilds(args.newPresence.guild.id, args.guild_list)) {
		return {
			result: false,
			value: lclz_mngr
				.client_log(current_guild.id, null, args.guild_list, 'presence_controlled_away', args),
		};
	}

	if (current_channel) { // if member is in a channel
		const current_portal_list = args.guild_list[current_guild.id].portal_list;
		for (const key in args.guild_list[current_guild.id].portal_list) {
			const current_voice_channel = current_portal_list[key].voice_list[current_channel.id];

			if (current_voice_channel) {
				if (args.guild_list[current_guild.id].spotify !== null) {display_spotify_song(current_guild, current_channel, args);}

				time_out_repeat(current_voice_channel, current_guild, current_channel, current_portal_list, args, 5);
			}
		}
	}

	return {
		result: true,
		value: lclz_mngr.client_log(current_guild.id, null, args.guild_list, 'presence_controlled', args),
	};
};