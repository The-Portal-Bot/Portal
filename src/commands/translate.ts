import { Client, Message } from 'discord.js';
import { GuildPrtl } from '../types/classes/GuildPrtl';
import config from '../config.json';

const translate = require('translate')
translate.engine = config.api_keys.translate.engine;
translate.key = config.api_keys.translate.key;

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		return resolve({ result: true, value: 'work in progress' });
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) return resolve({ result: true, value: 'portal guild could not be fetched' });

		if (args.length <= 1)
			return resolve({ result: false, value: '1 you can run `./help translate` for help' });

		const language_options = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		const string_to_tranlate = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

		if (!language_options || !string_to_tranlate)
			return resolve({ result: false, value: '2 you can run `./help translate` for help' });

		const language_duplet = language_options.split(',');
		if (language_duplet.length === 2) {
			translate(string_to_tranlate, { from: language_duplet[0], to: language_duplet[1] })
				.then((response: string) => {
					return resolve({ result: true, value: response });
				})
				.catch((error: any) => {
					return resolve({ result: false, value: `server responded with error: ${error}` });
				});
		} else if (language_duplet.length === 1) {
			translate(string_to_tranlate, { to: language_duplet[0] })
				.then((response: string) => {
					return resolve({ result: true, value: response });
				})
				.catch((error: any) => {
					return resolve({ result: false, value: `server responded with error: ${error}` });
				});
		} else {
			return resolve({ result: false, value: '3 you can run `./help translate` for help' });
		}
	});
};
