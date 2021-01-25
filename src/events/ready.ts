import { ActivityOptions, Client, Guild, PresenceData } from "discord.js";
import config from "../config.json";
import { remove_deleted_channels, remove_empty_voice_channels } from "../libraries/helpOps";
import { get_function } from "../libraries/localisationOps";
import { fetch_guild, insert_guild } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function add_guild_again(
	guild_id: string, client: Client
): Promise<boolean> {
	return new Promise((resolve) => {
		fetch_guild(guild_id)
			.then(resposne => {
				if (!resposne) insert_guild(guild_id, client);
				return resolve(!resposne);
			})
			.catch(() => { return resolve(false); });
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
		console.log(`> loading portal\'s guilds from ${config.database_json}`);
		args.client.guilds.cache.forEach((guild: Guild) => {
			console.log(`> ${index++}. ${guild} (${guild.id})`);

			add_guild_again(guild.id, args.client);
			remove_deleted_channels(guild);
			remove_empty_voice_channels(guild);
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
