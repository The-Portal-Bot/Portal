/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const help_mngr = require('../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const ranks = portal_guilds[message.guild.id].ranks;
		if (ranks && ranks.length > 0) {
			const ranks_msg = [];
			ranks.forEach(rank => {
				ranks_msg.push({
					emote: `At level ${rank.level}, you get role`,
					role: `***${rank.role}***`,
					inline: false,
				});
			});

			message.channel.send(
				help_mngr.create_rich_embed(
					false, false, '#FF4500', ranks_msg,
					false, message.member, false,
				),
			).then(msg => {
				msg.delete({ timeout: 10000 });
			});

			resolve({ result: true, value: '' });
		}
		else {
			resolve({ result: true, value: 'There is no ranking yet.' });
		}

		resolve({ result: true, value: 'There is no ranking yet.' });
	});
};