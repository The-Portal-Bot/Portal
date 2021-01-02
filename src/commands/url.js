/* eslint-disable no-unused-vars */
const guld_mngr = require('../libraries/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (args.length === 0) {
			if (guld_mngr.included_in_url_list(message.channel.id, portal_guilds[message.guild.id])) {
				resolve ({
					result: true,
					value: '*this already is a URL channel.*',
				});
			}
			if (guld_mngr.is_announcement_channel(message.channel.id, portal_guilds[message.guild.id])) {
				resolve ({
					result: true,
					value: '*this can\'t be set as a URL channel for it is the Announcement channel.*',
				});
			}
			if (guld_mngr.is_spotify_channel(message.channel.id, portal_guilds[message.guild.id])) {
				resolve ({
					result: true,
					value: '*this can\'t be set as a URL channel for it is the Spotify channel.*',
				});
			}
			if (guld_mngr.is_music_channel(message.channel.id, portal_guilds[message.guild.id])) {
				resolve ({
					result: true,
					value: '*this can\'t be set as a URL channel for it is the Music channel.*',
				});
			}
		}

		// if (url = message.guild.channels.cache.find(channel =>
		// channel.id == portal_guilds[message.guild.id].url_list[message.channel.id])) {
		//     guld_mngr.delete_channel(url, message);
		// }

		if (args.length === 0) {
			portal_guilds[message.guild.id].url_list.push(message.channel.id);

			resolve ({ result: true, value: '*this is now the url channel.*' });
		}
		else if (args.length > 0) {
			const url_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			const url_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			if (url_channel !== '') {
				guld_mngr.create_url_channel(message.guild, url_channel, url_category, portal_guilds[message.guild.id].url_list);

				resolve ({ result: true, value: '*url channel and category have been created*' });
			}
			else if (url_channel === '' && url_category !== '') {
				guld_mngr.create_url_channel(message.guild, url_category, null, portal_guilds[message.guild.id].url_list);

				resolve ({ result: true, value: '*url channel has been created*' });
			}
			else {
				resolve ({ result: false, value: '*you can run "./help url" for help.*' });
			}
		}
	});
};
