import { Client, Guild } from "discord.js";
import { guild_exists, insert_guild } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { client: Client, guild: Guild }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		guild_exists(args.guild.id)
			.then(exists => {
				if (exists) {
					return resolve({
						result: false,
						value: `guild ${args.guild.name} [${args.guild.id}] already in portal`
					});
				} else {
					insert_guild(args.guild.id, args.client)
						.then(resposne => {
							return resolve({
								result: !!resposne,
								value: `Portal ` + !!resposne 
									? `joined guild ${args.guild.name} [${args.guild.id}]`
									: `failed to join ${args.guild.name} [${args.guild.id}]`
							});
						})
						.catch(error => {
							return resolve({
								result: false,
								value: `portal failed to joined guild ${args.guild.name} [${args.guild.id}]`
							});
						});
				}
			});
	});
};