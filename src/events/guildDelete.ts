import { Guild } from "discord.js";
import { remove_guild } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { guild: Guild }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		remove_guild(args.guild.id)
			.then(r => {
				return resolve({
					result: r,
					value: `guild ${args.guild.name} [${args.guild.id}] ` +
						`${r ? 'removed from portal' : 'failed to be removed from portal'}`
				});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: `guild ${args.guild.name} [${args.guild.id}] failed to be removed from portal`
				});
			});
	});
};