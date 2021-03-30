/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Message } from "discord.js";
import { JokeEnum } from "../../data/enums/Joke.enum";
import { get_key_from_enum } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

const giveMeAJoke = require('give-me-a-joke');

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const category = get_key_from_enum(args[0], JokeEnum);

		if (args.length === 1) {
			switch (category) {
				case JokeEnum.dad:
					giveMeAJoke.getRandomDadJoke((joke: string) =>
						message.channel.send(joke));
					break;
				case JokeEnum.chuck:
					giveMeAJoke.getRandomCNJoke((joke: string) =>
						message.channel.send(joke));
					break;
				case JokeEnum.blonde:
					giveMeAJoke.getRandomJokeOfTheDay('blonde', (joke: string) =>
						message.channel.send(joke));
					break;
				case JokeEnum.knock:
					giveMeAJoke.getRandomJokeOfTheDay('knock-knock', (joke: string) =>
						message.channel.send(joke));
					break;
				case JokeEnum.animal:
					giveMeAJoke.getRandomJokeOfTheDay('animal', (joke: string) =>
						message.channel.send(joke));
					break;
				default:
					giveMeAJoke.getCustomJoke('', args[0], (joke: string) =>
						message.channel.send(joke));
			}
		} else {
			giveMeAJoke.getCustomJoke('', message.author.username, (joke: string) =>
				message.channel.send(joke));
		}

		return resolve({
			result: true,
			value: ''
		});
	});
};
