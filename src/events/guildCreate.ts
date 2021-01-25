import { Client, Guild } from "discord.js";
import { fetch_guild, insert_guild } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { client: Client, guild: Guild }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		fetch_guild(args.guild.id)
			.then(guild_object => {
				if (guild_object) {
					return resolve({
						result: false,
						value: `guild ${args.guild.name} [${args.guild.id}] already in portal`
					});
				} else {
					insert_guild(args.guild.id, args.client);

					return resolve({
						result: true,
						value: `portal joined guild ${args.guild.name} [${args.guild.id}]`
					});
				}
			});
	});
};