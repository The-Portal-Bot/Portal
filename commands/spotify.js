/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	if (args.length === 0) {
		if (guld_mngr.is_spotify_channel(message.channel.id, portal_guilds[message.guild.id])) {
			return {
				result: true, value: '**This already is, the Spotify channel.**'
			};
		}
		if (guld_mngr.is_announcement_channel(message.channel.id, portal_guilds[message.guild.id])) {
			return {
				result: true, value: '**This can\'t be set as the Spotify channel for it is the Announcement channel.**'
			};
		}
		if (guld_mngr.included_in_url_list(message.channel.id, portal_guilds[message.guild.id])) {
			return {
				result: true, value: '**This can\'t be set as the Spotify channel for it is an url channel.**'
			};
		}
	}

	if (spotify = message.guild.channels.cache.find(channel => channel.id == portal_guilds[message.guild.id].spotify)) {
		guld_mngr.delete_channel(spotify);
	}

	if (args.length === 0) {
		portal_guilds[message.guild.id].spotify = message.channel.id;

		return {
			result: true, value: '**This is now the Spotify channel.**'
		};
	} else if (args.length > 0) {
		const spotify_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		const spotify_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
		
		if (spotify_channel !== '') {
			guld_mngr.create_spotify_channel(
				message.guild, spotify_channel, spotify_category, portal_guilds[message.guild.id]);

			return {
				result: true, value: '*Spotify channel and category have been created*'
			};
		} else if (spotify_channel === '' && spotify_category !== '') {
			guld_mngr.create_spotify_channel(
				message.guild, spotify_category, null, portal_guilds[message.guild.id]);

			return {
				result: true, value: '*Spotify channel has been created*'
			};
		} else {
			return {
				result: false, value: '**You can run "./help spotify" for help.**'
			};
		}
	}
};
