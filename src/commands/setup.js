/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const { Message } = require('discord.js');
const guld_mngr = require('../libraries/guildOps');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		message.guild.channels
			.create('portal-hub', { type: 'category' })
			.then(cat_channel => {
				message.guild.channels.cache.forEach(channel => {
					if(channel.id === portal_guilds[message.guild.id].spotify ||
					channel.id === portal_guilds[message.guild.id].announcement ||
					channel.id === portal_guilds[message.guild.id].music_data.channel_id) {
						guld_mngr.delete_channel(channel, message);
					}
				});

				guld_mngr.create_portal_channel(message.guild, 'portal-to-voice', cat_channel, 
					portal_guilds[message.guild.id].portal_list, portal_guilds, message.member.id);
				guld_mngr.create_spotify_channel(message.guild, 'spotify', cat_channel, portal_guilds[message.guild.id]);
				guld_mngr.create_announcement_channel(message.guild, 'announcement', cat_channel, portal_guilds[message.guild.id]);
				guld_mngr.create_url_channel(message.guild, 'url-only', cat_channel, portal_guilds[message.guild.id].url_list);
				guld_mngr.create_music_channel(message.guild, 'music-player', cat_channel, portal_guilds[message.guild.id]);
			})
			.catch(console.error);

		return resolve({
			result: true, value: '*setup has ran succesfully*',
		});
	});
};
