/* eslint-disable no-unused-vars */
const help_mngr = require('../libraries/helpOps');
const guld_mngr = require('../libraries/guildOps');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const roles = [...message.guild.roles.cache];

		if (args.length > 0) {
			const is_rank = function(rank) {
				return !!rank.level && !!rank.role;
			};
			// is_role already exists in guild manager, keep the best
			const is_role = function(rank) {
				return roles.some(role => role[1].hoist ? role[1].name === rank.role : false);
			};

			const new_ranks = help_mngr.getJSON(args.join(' '));
			if(new_ranks === null) {
				return resolve ({
					result: false,
					value: '*ranking must be in Array JSON format, for more info ./help ranks*',
				});
			}
			if(!Array.isArray(new_ranks)) {
				return resolve ({
					result: false,
					value: '*ranking must be in Array JSON format, for more info ./help ranks*',
				});
			}
			if(!new_ranks.every(is_rank)) {
				return resolve ({
					result: false,
					value: '*rankings must be an object of level and role, for more info ./help ranks*',
				});
			}
			if(!new_ranks.every(is_role)) {
				return resolve ({
					result: false,
					value: '*a role given does not exist in server, for more info ./help ranks*',
				});
			}
			new_ranks.forEach(rank => {
				rank.level = +rank.level;
				rank['id'] = roles.find(role => role[1].name === rank.role)[0];
			});
			portal_guilds[message.guild.id].ranks = new_ranks;
		}
		else {
			return resolve ({
				result: false,
				value: '*you can run "./help ranks" for help.*',
			});
		}

		return resolve ({
			result: true,
			value: '*new rankings have been set.*',
		});
	});
};
