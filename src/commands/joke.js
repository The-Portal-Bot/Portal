const giveMeAJoke = require('give-me-a-joke');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (args.length === 1) {
			if (args[0] === 'dad') {
				giveMeAJoke.getRandomDadJoke(joke => message.channel.send(joke));
			} else if (args[0] === 'chuck') {
				giveMeAJoke.getRandomCNJoke(joke => message.channel.send(joke));
			} else if (args[0] === 'blonde' || args[0] === 'knock-knock' ||
				args[0] === 'animal' || args[0] === 'jod') {
				giveMeAJoke.getRandomJokeOfTheDay(args[0], joke => message.channel.send(joke));
			} else {
				return resolve({
					result: false,
					value: '*you can run "./help joke" for help.*'
				});
			}
		} else {
			giveMeAJoke.getCustomJoke('', message.author.username, joke => message.channel.send(joke));
		}
		return resolve({ result: true, value: null });
	});
};
