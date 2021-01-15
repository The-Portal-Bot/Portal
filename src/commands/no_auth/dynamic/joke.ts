import { Client, Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";

const giveMeAJoke = require('give-me-a-joke');

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object)
			return resolve({ result: true, value: 'portal guild could not be fetched' });

		if (args.length === 1) {
			if (args[0] === 'dad') {
				giveMeAJoke.getRandomDadJoke((joke: string) => message.channel.send(joke));
			} else if (args[0] === 'chuck') {
				giveMeAJoke.getRandomCNJoke((joke: string) => message.channel.send(joke));
			} else if (args[0] === 'blonde' || args[0] === 'knock-knock' ||
				args[0] === 'animal' || args[0] === 'jod') {
				giveMeAJoke.getRandomJokeOfTheDay(args[0], (joke: string) => message.channel.send(joke));
			} else {
				return resolve({
					result: false,
					value: 'you can run `./help joke` for help'
				});
			}
		} else {
			giveMeAJoke.getCustomJoke('', message.author.username, (joke: string) => message.channel.send(joke));
		}
		return resolve({ result: true, value: null });
	});
};
