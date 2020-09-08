/* eslint-disable no-unused-vars */
const guld_mngr = require('../functions/guild_manager');
const help_mngr = require('../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const current_channel = portal_guilds[message.guild.id];

		if (args.length === 0) {
			if (guld_mngr.is_music_channel(message.channel.id, current_channel)) {
				return resolve ({
					result: true,
					value: '*this already is, the Music channel.*',
				});
			}
			if (guld_mngr.is_spotify_channel(message.channel.id, current_channel)) {
				return resolve ({
					result: true,
					value: '*this can\'t be set as the Music channel for it is the Spotify channel.*',
				});
			}
			if (guld_mngr.is_announcement_channel(message.channel.id, current_channel)) {
				return resolve ({
					result: true,
					value: '*this can\'t be set as the Music channel for it is the Announcement channel.*',
				});
			}
			if (guld_mngr.included_in_url_list(message.channel.id, current_channel)) {
				return resolve ({
					result: true,
					value: '*this can\'t be set as the Music channel for it is an url channel.*',
				});
			}
		}

		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';
		const music = message.guild.channels.cache
			.find(channel => channel.id == current_channel.music_data.channel_id);

		if (music) guld_mngr.delete_channel(music);

		if (args.length === 0) {
			current_channel.music_data.channel_id = message.channel.id;
			help_mngr.create_music_message(
				message.guild.channels.cache.find(channel =>
					channel.id === current_channel.music_data.channel_id),
				portal_icon_url,
				portal_guilds[message.guild.id],
			);

			return resolve ({
				result: true,
				value: '*this is now the Music channel.*',
			});
		}
		else if (args.length > 0) {
			const music_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			const music_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			let result = false;
			let value = null;

			if (music_channel !== '') {
				guld_mngr.create_music_channel(message.guild, music_channel, music_category, current_channel)
					.then(channel =>
						help_mngr.create_music_message(
							channel,
							portal_icon_url,
							portal_guilds[message.guild.id],
						),
					)
					.catch(console.error);

				result = true;
				value = '*music channel and category have been created*';
			}
			else if (music_channel === '' && music_category !== '') {
				guld_mngr.create_music_channel(message.guild, music_category, null, current_channel)
					.then(channel =>
						help_mngr.create_music_message(
							channel,
							portal_icon_url,
							portal_guilds[message.guild.id],
						),
					)
					.catch(console.error);

				result = true;
				value = '*music channel has been created*';
			}
			else {
				return resolve ({
					result: false,
					value: '*you can run "./help music" for help.*',
				});
			}

			console.log('2 FRIEND OF MINE');

			return resolve ({
				result: result,
				value: value,
			});
		}
	});
};