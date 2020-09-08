/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const help_mngr = require('../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const member_info = portal_guilds[message.guild.id].member_list[message.member.id];

		message.channel.send(help_mngr.create_rich_embed(
			'About Portal',
			'a portal to a managed discord server',
			'#1DB954',
			[
				{
					emote: 'Creator',
					role: '***Keybraker***',
					inline: true,
				},
				{
					emote: 'Created',
					role: '***2020***',
					inline: true,
				},
				{
					emote: 'Website',
					role: '***https://portal-bot.xyz***',
					inline: true,
				},
				{
					emote: 'FAQ',
					role: '',
					inline: false,
				},
				{
					emote: 'Does Portal have Premium ?',
					role: 'Yes with great features and you can get it at ***https://portal-bot.xyz/premium/***',
					inline: false,
				},
				{
					emote: 'What features does Portal have ?',
					role: 'Yes lots of them, you can explore them at ***https://portal-bot.xyz/features/***',
					inline: false,
				},
			],
			false,
			client.user.member,
			true,
			'https://portal-bot.xyz/',
		));

		return resolve(null);
	});
};