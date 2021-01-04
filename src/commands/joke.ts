import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";

const giveMeAJoke = require('give-me-a-joke');

module.exports = async (args: {
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
}) => {
	return new Promise((resolve) => {
		const guild_object = args.guild_list.find(g => g.id === args.message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		if (args.args.length === 1) {
			if (args.args[0] === 'dad') {
				giveMeAJoke.getRandomDadJoke((joke: string) => args.message.channel.send(joke));
			} else if (args.args[0] === 'chuck') {
				giveMeAJoke.getRandomCNJoke((joke: string) => args.message.channel.send(joke));
			} else if (args.args[0] === 'blonde' || args.args[0] === 'knock-knock' ||
				args.args[0] === 'animal' || args.args[0] === 'jod') {
				giveMeAJoke.getRandomJokeOfTheDay(args.args[0], (joke: string) => args.message.channel.send(joke));
			} else {
				return resolve({
					result: false,
					value: '*you can run "./help joke" for help.*'
				});
			}
		} else {
			giveMeAJoke.getCustomJoke('', args.message.author.username, (joke: string) => args.message.channel.send(joke));
		}
		return resolve({ result: true, value: null });
	});
};
