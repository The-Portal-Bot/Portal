/* eslint-disable no-undef */
/* eslint-disable no-cond-assign */
const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');
const help_mngr = require('./../functions/help_manager');

time_out_repeat = function (current_voice_channel, current_guild, current_channel, current_portal_list, args, mins) {
	setTimeout(() => {
		console.log('updating channel name');
		this.update_channel_name(current_voice_channel, current_guild, current_channel, current_portal_list, args);
		this.time_out_repeat(current_voice_channel, current_guild, current_channel, current_portal_list, args, mins);
	}, mins * 60 * 1000);
};

display_spotify_song = function (current_guild, current_channel, args) {
	current_channel.members.forEach(member => {
		member.presence.activities.some(activity => {
			if (activity.name === 'Spotify') {
				if (spotify = args.newPresence.guild.channels.cache.find(channel =>
					channel.id === args.portal_guilds[current_guild.id].spotify)) {
					lclz_mngr.client_talk(args.client, args.portal_guilds, 'new_song');
					spotify
						.send(help_mngr.create_rich_embed(
							`**${activity.details}**`,
							'',
							'#1DB954',
							[
								{
									emote: 'Artist',
									role: `***${activity.state}***`,
									inline: true
								},
								{
									emote: 'Album',
									role: `***${activity.assets.largeText}***`,
									inline: true
								}
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

update_channel_name = function (current_voice_channel, current_guild, current_channel, current_portal_list, args) {
	switch (guld_mngr.generate_channel_name(current_channel, current_portal_list, args.portal_guilds[current_guild.id])) {
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
	let current_guild = args.newPresence.guild;
	let current_channel = args.newPresence.member.voice.channel;

	if (!guld_mngr.included_in_portal_guilds(args.newPresence.guild.id, args.portal_guilds)) {
		return {
			result: false, value: lclz_mngr.client_log(current_guild.id, null, args.portal_guilds, 'presence_controlled_away', args)
		};
	}

	if (current_channel) { // if member is in a channel
		let current_portal_list = args.portal_guilds[current_guild.id].portal_list;
		for (let key in args.portal_guilds[current_guild.id].portal_list) {
			if (current_voice_channel = current_portal_list[key].voice_list[current_channel.id]) {

				if (args.portal_guilds[current_guild.id].spotify !== null) {
					display_spotify_song(current_guild, current_channel, args);
				}

				time_out_repeat(current_voice_channel, current_guild, current_channel, current_portal_list, args, 5);
			}
		}
	}

	return {
		result: true, value: lclz_mngr.client_log(current_guild.id, null, args.portal_guilds, 'presence_controlled', args)
	};
};