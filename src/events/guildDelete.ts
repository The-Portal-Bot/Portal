import { Guild } from "discord.js";
import { remove_guild } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { guild: Guild }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		remove_guild(args.guild.id)
			.then(response => {
				return resolve({
					result: response,
					value: `guild ${args.guild.name} [${args.guild.id}] ${response
						? 'removed from portal' : 'failed to remove from portal'}`
				});
			})
			.catch(error => {
				return resolve({
					result: false,
					value: `guild ${args.guild.name} [${args.guild.id}] failed to remove from portal`
				});
			});
	});
};