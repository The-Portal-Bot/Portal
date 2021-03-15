import { Client, Guild } from "discord.js";
import { guild_exists, insert_guild } from "../libraries/mongo.library";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl.interface";

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
						.then(r => {
							return resolve({
								result: !!r,
								value: `Portal ` + !!r 
									? `joined guild ${args.guild.name} [${args.guild.id}]`
									: `failed to join ${args.guild.name} [${args.guild.id}]`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `portal failed to join guild ${args.guild.name} [${args.guild.id}] (${e})`
							});
						});
				}
			});
	});
};