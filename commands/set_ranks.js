/* eslint-disable no-unused-vars */
const help_mngr = require('../functions/help_manager');
const guld_mngr = require('../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		let roles = [...message.guild.roles.cache];

		if (args.length > 0) {
			const is_rank = function (rank) { return !!rank.level && !!rank.role; };
			const is_role = function (rank) { return !roles.some(role => {
				console.log(role.name, ' === ', rank.role);
				return !(role.name === rank.role); });
			};
			let new_ranks = help_mngr.getJSON(args.join(' '));
			console.log(new_ranks);
			if(new_ranks === null) {
				return resolve ({ 
					result: false, 
					value: '*ranking must be in JSON format, for more info ./help ranks*'
				});
			}
			if(!new_ranks.every(is_rank)) {
				return resolve ({ 
					result: false, 
					value: '*rankings must be an object of level and role, for more info ./help ranks*'
				});
			}
			if(!new_ranks.every(is_role)) {
				return resolve ({ 
					result: false, 
					value: '*a role given does not exist in server, for more info ./help ranks*'
				});
			}
				
			portal_guilds[message.guild.id].ranks = new_ranks;
		} else {
			return resolve ({ 
				result: false, 
				value: '*you can run "./help ranks" for help.*'
			});
		}

		return resolve ({ 
			result: true, 
			value: '*new rankings have been set.*'
		});
	});
};
