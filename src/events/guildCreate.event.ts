import { Client, Guild } from "discord.js";
import { logger } from "../libraries/help.library";
import { guild_exists, insert_guild } from "../libraries/mongo.library";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

module.exports = async (
	args: { client: Client, guild: Guild }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		guild_exists(args.guild.id)
			.then(exists => {
				if (exists) {
					return resolve({
						result: false,
						value: `guild ${args.guild.name} [${args.guild.id}] already in database`
					});
				} else {
					insert_guild(args.guild.id, args.client)
						.then(r => {
							return resolve({
								result: r,
								value: r 
									? `joined guild ${args.guild.name} [${args.guild.id}]`
									: `failed to join ${args.guild.name} [${args.guild.id}]`
							});
						})
						.catch(e => {
							logger.log({ level: 'error', type: 'none', message: new Error(`failed to join guild ${args.guild.name} [${args.guild.id}] / ${e}`).message });
							return resolve({
								result: false,
								value: `failed to join guild ${args.guild.name} [${args.guild.id}]`
							});
						});
				}
			});
	});
};