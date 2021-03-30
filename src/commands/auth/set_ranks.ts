import { Message, Role } from "discord.js";
import { get_json, message_help } from "../../libraries/help.library";
import { set_ranks } from "../../libraries/mongo.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { Rank, ReturnPormise } from "../../types/classes/TypesPrtl.interface";

function is_rank(rank: Rank) {
	return !!rank.level && !!rank.role;
}

function is_role(rank: Rank, roles: Role[]) {
	return roles.some(role => {
		if (role.id === rank.role) return true;
		if (role.name === rank.role) return true;
		return false;
	});
}

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({
				result: true,
				value: 'guild could not be fetched'
			});

		const roles = message.guild.roles.cache.map(cr => cr);

		if (args.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const new_ranks_json = get_json(args.join(' '));
			if (!new_ranks_json || !Array.isArray(new_ranks_json)) {
				return resolve({
					result: false,
					value: message_help('commands', 'set_ranks', 'ranking must be an array in JSON format (even for one role)')
				});
			}

			const new_ranks = <Rank[]>new_ranks_json;

			if (!new_ranks.every(r => r.level && r.role)) {
				return resolve({
					result: false,
					value: message_help('commands', 'set_ranks', 'JSON syntax has spelling errors`')
				});
			}
			if (!new_ranks.every(is_rank)) {
				return resolve({
					result: false,
					value: message_help('commands', 'set_ranks', 'rankings must be a key-pair from level and role')
				});
			}
			if (!new_ranks.every(r => is_role(r, roles))) {
				return resolve({
					result: false,
					value: message_help('commands', 'set_ranks', 'a role given does not exist in server')
				});
			}

			new_ranks.forEach(rank => {
				rank.level = +rank.level;
				const role = roles.find(role => role.name === rank.role);
				if (role) rank.role = role.id;
			});

			set_ranks(guild_object.id, new_ranks)
				.then(r => {
					return resolve({
						result: r,
						value: r
							? 'set new ranks successfully'
							: 'failed to set new ranks'
					});
				})
				.catch(e => {
					return resolve({
						result: false,
						value: 'failed to set new ranks'
					});
				});
		}
		else {
			return resolve({
				result: false,
				value: message_help('commands', 'set_ranks')
			});
		}

		return resolve({
			result: true,
			value: 'new rankings have been set'
		});
	});
}
