import { Client, Message, Role } from "discord.js";
import { getJSON } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { Rank } from "../types/interfaces/InterfacesPrtl";

function is_rank(rank: Rank) {
	return !!rank.level && !!rank.role;
};

function is_role(rank: Rank, roles: Role[]) {
	return roles.some(role => {
		if (role.id === rank.role) return true;
		if (role.name === rank.role) return true;
		return false;
	});
};

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) return resolve({ result: true, value: 'portal guild could not be fetched' });
		if (!message.guild) return resolve({ result: true, value: 'guild could not be fetched' });
		const roles = message.guild.roles.cache.map(cr => cr);

		if (args.length > 0) {
			const new_ranks_json = getJSON(args.join(' '));
			if (new_ranks_json === null) {
				return resolve({
					result: false,
					value: 'ranking must be in Array JSON format, for more info ./help ranks'
				});
			}
			if (!Array.isArray(new_ranks_json)) {
				return resolve({
					result: false,
					value: 'ranking must be in Array JSON format, for more info ./help ranks'
				});
			}
			const new_ranks: Rank[] = new_ranks_json;
			if (!new_ranks.every(is_rank)) {
				return resolve({
					result: false,
					value: 'rankings must be an object of level and role, for more info ./help ranks'
				});
			}
			if (!new_ranks.every(r => is_role(r, roles))) {
				return resolve({
					result: false,
					value: 'a role given does not exist in server, for more info ./help ranks'
				});
			}

			new_ranks.forEach(rank => {
				rank.level = +rank.level;
				const role = roles.find(role => role.name === rank.role);
				if (role) rank.role = role.id;
			});

			guild_object.ranks = new_ranks;
		}
		else {
			return resolve({
				result: false,
				value: 'you can run "./help ranks" for help',
			});
		}

		return resolve({
			result: true,
			value: 'new rankings have been set',
		});
	});
};
