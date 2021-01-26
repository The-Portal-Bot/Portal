import { Client, Message, Role } from "discord.js";
import { getJSON } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { Rank, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { set_ranks } from "../../../libraries/mongoOps";

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
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild) return resolve({ result: true, value: 'guild could not be fetched' });
		const roles = message.guild.roles.cache.map(cr => cr);

		if (args.length > 0) {
			const new_ranks_json = getJSON(args.join(' '));
			if (!new_ranks_json) {
				return resolve({
					result: false,
					value: 'ranking must be in Array JSON format, for more info `./help set_ranks`'
				});
			}
			if (!Array.isArray(new_ranks_json)) {
				return resolve({
					result: false,
					value: 'ranking must be in Array JSON format, for more info `./help set_ranks`'
				});
			}

			const new_ranks: Rank[] = new_ranks_json;

			if (!new_ranks.every(r => r.level && r.role)) {
				return resolve({ result: false, value: 'json misspelled `./help set_ranks`' });
			}
			if (!new_ranks.every(is_rank)) {
				return resolve({
					result: false,
					value: 'rankings must be an object of level and role, for more info `./help set_ranks`'
				});
			}
			if (!new_ranks.every(r => is_role(r, roles))) {
				return resolve({
					result: false,
					value: 'a role given does not exist in server, for more info `./help set_ranks`'
				});
			}

			new_ranks.forEach(rank => {
				rank.level = +rank.level;
				const role = roles.find(role => role.name === rank.role);
				if (role) rank.role = role.id;
			});

			set_ranks(guild_object.id, new_ranks)
				.then(response => {
					return resolve({
						result: response, value: response
							? 'set new ranks successfully'
							: 'failed to set new ranks'
					});
				})
				.catch(error => {
					return resolve({
						result: false, value: 'failed to set new ranks'
					});
				});
		}
		else {
			return resolve({
				result: false,
				value: 'you can run `./help set_ranks` for help',
			});
		}

		return resolve({
			result: true,
			value: 'new rankings have been set',
		});
	});
};
