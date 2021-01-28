import { Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

const giveMeAJoke = require('give-me-a-joke');

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
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
		return resolve({ result: true, value: '' });
	});
};
