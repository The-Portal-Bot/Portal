import { Guild } from "discord.js";
import { remove_guild } from "../libraries/mongo.library";

module.exports = async (
	args: { guild: Guild }
): Promise<string> => {
	return new Promise((resolve, reject) => {
		remove_guild(args.guild.id)
			.then(r => {
				if (r) {
					return resolve(`removed guild ${args.guild.name} [${args.guild.id}]`);
				} else {
					return reject(`failed to remove guild ${args.guild.name} [${args.guild.id}]`);
				}
			})
			.catch(e => {
				return reject(`failed to remove guild ${args.guild.name} [${args.guild.id}] / ${e}`);
			});
	});
};