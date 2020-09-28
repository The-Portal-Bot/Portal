/* eslint-disable no-unused-vars */
const help_mngr = require('../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (portal_guilds[message.guild.id].member_list[message.member.id]) {
			const member_info = portal_guilds[message.guild.id].member_list[message.member.id];

			message.channel.send(help_mngr.create_rich_embed(
				false,
				false,
				'#00FFFF',
				[
					{ emote: 'Level', role: `***${member_info.level}***`, inline: true },
					{ emote: 'Rank', role: `***${member_info.rank}***`, inline: true },
					{ emote: 'Tier', role: `***${member_info.tier}***`, inline: true },
					{ emote: 'Points', role: `***${member_info.points}***`, inline: true },
				],
				false,
				message.member,
				false),
			);

			return resolve (null);
		}
		else {
			resolve({ result: false, value: 'there is no rank for you, please contact Portal Bot maintainer.' });
		}
	});
};