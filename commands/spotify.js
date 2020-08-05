/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (args.length === 0) {
			if (guld_mngr.is_spotify_channel(message.channel.id, portal_guilds[message.guild.id])) {
				return resolve ({
					result: true,
					value: '*this already is, the Spotify channel.*'
				});
			}
			if (guld_mngr.is_announcement_channel(message.channel.id, portal_guilds[message.guild.id])) {
				return resolve ({
					result: true,
					value: '*this can\'t be set as the Spotify channel for it is the Announcement channel.*'
				});
			}
			if (guld_mngr.included_in_url_list(message.channel.id, portal_guilds[message.guild.id])) {
				return resolve ({
					result: true,
					value: '*this can\'t be set as the Spotify channel for it is an url channel.*'
				});
			}
		}

		let spotify = message.guild.channels.cache
			.find(channel => channel.id == portal_guilds[message.guild.id].spotify);

		if (spotify) guld_mngr.delete_channel(spotify);

		if (args.length === 0) {
			portal_guilds[message.guild.id].spotify = message.channel.id;

			return resolve ({
				result: true,
				value: '*this is now the Spotify channel.*'
			});
		} else if (args.length > 0) {
			const spotify_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			const spotify_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			if (spotify_channel !== '') {
				guld_mngr.create_spotify_channel(
					message.guild, spotify_channel, spotify_category, portal_guilds[message.guild.id]);

				return resolve ({
					result: true,
					value: '*spotify channel and category have been created*'
				});
			} else if (spotify_channel === '' && spotify_category !== '') {
				guld_mngr.create_spotify_channel(
					message.guild, spotify_category, null, portal_guilds[message.guild.id]);

				return resolve ({
					result: true,
					value: '*spotify channel has been created*'
				});
			} else {
				return resolve ({
					result: false,
					value: '*you can run "./help spotify" for help.*'
				});
			}
		}
	});
};
