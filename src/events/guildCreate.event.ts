import { Client, Guild } from "discord.js";
import { guild_exists, insert_guild } from "../libraries/mongo.library";

module.exports = async (
	args: { client: Client, guild: Guild }
): Promise<string> => {
	return new Promise((resolve, reject) => {
		guild_exists(args.guild.id)
			.then(exists => {
				if (exists) {
					return resolve(`guild ${args.guild.name} [${args.guild.id}] already in database`);
				} else {
					insert_guild(args.guild.id, args.client)
						.then(r => {
							if (r) {
								return resolve(`joined guild ${args.guild.name} [${args.guild.id}]`);
							} else {
								return reject(`failed to join guild ${args.guild.name} [${args.guild.id}]`);
							}
						})
						.catch(e => {
							return reject(`failed to join guild ${args.guild.name} [${args.guild.id}] / ${e}`);
						});
				}
			});
	});
};