/* eslint-disable no-unused-vars */
const help_mngr = require('../functions/help_manager');

let member_list = null;

const compare = function(member_a, member_b) {
	if (member_list[member_b].points > member_list[member_a].points) return 1;
	if (member_list[member_a].points > member_list[member_b].points) return -1;
	return 0;
};

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		member_list = portal_guilds[message.guild.id].member_list;
		let length = args.length > 0 ? +args[0] : Object.keys(member_list).length;

		if(!isNaN(length)) {
			if (portal_guilds[message.guild.id].member_list) {
				const member_levels = [];
				Object.keys(member_list).sort(compare).forEach((member_id, i) => {
					const this_member = message.guild.members.cache
						.find(member => member.id === member_id);

					if (this_member !== undefined && length > 0) {
						member_levels.push(
							{
								emote: `${i}. ${this_member.displayName}`,
								role: `points: ${Math.round(member_list[member_id].points)}`,
								inline: false,
							},
						);
						length--;
					}
					else {
						console.log('member_id :>> ', member_id);
					}
				});

				message.channel.send(help_mngr.create_rich_embed(
					'Leaderboard',
					false,
					'#00FFFF',
					member_levels,
					false,
					false,
					true),
				);

				return resolve (null);
			}
			else {
				resolve({
					result: false,
					value: 'there are no members for this server, please contact Portal Bot maintainer.',
				});
			}
		}
		else {
			resolve({
				result: false,
				value: '*you can run "./help leaderboard" for help.*',
			});
		}

	});
};