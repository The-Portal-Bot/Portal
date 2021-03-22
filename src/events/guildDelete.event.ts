import { Guild } from "discord.js";
import { logger } from "../libraries/help.library";
import { remove_guild } from "../libraries/mongo.library";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

module.exports = async (
	args: { guild: Guild }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		remove_guild(args.guild.id)
			.then(r => {
				return resolve({
					result: r,
					value: r
						? `removed guild ${args.guild.name} [${args.guild.id}]`
						: `failed to remove guild ${args.guild.name} [${args.guild.id}]`
				});
			})
			.catch(e => {
				logger.log({ level: 'error', type: 'none', message: new Error(`failed to remove guild ${args.guild.name} [${args.guild.id}] / ${e}`).message });
				return resolve({
					result: false,
					value: `failed to remove guild ${args.guild.name} [${args.guild.id}]`
				});
			});
	});
};