/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const guld_mngr = require('../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (spotify = message.guild.channels.cache.find(channel => channel.id == portal_guilds[message.guild.id].spotify)) {
			guld_mngr.delete_channel(spotify);
		}
		if (announcement = message.guild.channels.cache.find(channel => channel.id == portal_guilds[message.guild.id].announcement)) {
			guld_mngr.delete_channel(announcement);
		}

		guld_mngr.create_portal_channel(
			message.guild, 'general-portal', null, portal_guilds[message.guild.id].portal_list,
			portal_guilds, message.member.id);
		guld_mngr.create_spotify_channel(
			message.guild, 'general', null, portal_guilds[message.guild.id]);
		guld_mngr.create_announcement_channel(
			message.guild, 'general', null, portal_guilds[message.guild.id]);
		guld_mngr.create_url_channel(
			message.guild, 'general', null, portal_guilds[message.guild.id].url_list);
		
		return resolve({
			result: true, value: '*setup has ran succesfully*'
		});		
	});
};
