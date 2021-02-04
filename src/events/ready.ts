import { ActivityOptions, Client, Guild, PresenceData } from "discord.js";
import { get_function } from "../libraries/localisationOps";
import { guild_exists, insert_guild } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function add_guild_again(
	guild_id: string, client: Client
): Promise<boolean> {
	return new Promise((resolve) => {
		guild_exists(guild_id)
			.then(exists => {
				if (!exists)
					insert_guild(guild_id, client)
						.then(resposne => {
							return resolve(resposne);
						})
						.catch(error => {
							return resolve(false);
						});
			})
			.catch(error => {
				return resolve(false);
			});
	});
}

module.exports = async (
	args: { client: Client }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!args.client.user)
			return resolve({
				result: false,
				value: 'could not fetch user from client'
			});

		const options: ActivityOptions = {
			name: './help',
			type: 'LISTENING',
			url: 'https://github.com/keybraker'
		}

		const data: PresenceData = {
			status: 'online',
			afk: false,
			activity: options
		};

		args.client.user.setPresence(data);

		let index = 0;
		args.client.guilds.cache.forEach((guild: Guild) => {
			console.log(`> ${index++}. ${guild} (${guild.id})`);

			add_guild_again(guild.id, args.client);
			// remove_deleted_channels(guild);
			// remove_empty_voice_channels(guild);
		});

		const func = get_function('console', 'en', 'ready');
		return resolve({
			result: true,
			value: func
				? func(args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size)
				: 'error with localisation'
		});
	});
};
