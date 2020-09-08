/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const help_mngr = require('../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const ranks = portal_guilds[message.guild.id].ranks;
		if (ranks) {
			const ranks_msg = [];
			ranks.forEach(rank => {
				ranks_msg.push({
					emote: `level ${rank.level}`,
					role: `***${rank.role}***`,
					inline: false,
				});
			});

			message.channel.send(
				help_mngr.create_rich_embed(
					false, false, '#FF4500', ranks_msg,
					false, message.member, false,
				),
			);
		}
		else {
			message.channel.send('There is no ranking yet.');
		}

		return resolve(null);
	});
};