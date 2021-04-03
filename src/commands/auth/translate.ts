import { Message } from 'discord.js';
import { message_help } from '../../libraries/help.library';
import { ReturnPormise } from '../../types/classes/TypesPrtl.interface';

// const translate = require('translate')
// translate.engine = config.api_keys.translate.engine;
// translate.key = config.api_keys.translate.key;

module.exports = async (
	message: Message, args: string[]
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		return resolve({
			result: true,
			value: message_help('commands', 'translate', 'work in progress')
		});

		if (args.length <= 1)
			return resolve({
				result: false,
				value: message_help('commands', 'translate', '1 you can run `./help translate` for help')
			});

		const language_options = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		const string_to_tranlate = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

		if (!language_options || !string_to_tranlate)
			return resolve({
				result: false,
				value: message_help('commands', 'translate', '2 you can run `./help translate` for help')
			});

		const language_duplet = language_options.split(',');
		if (language_duplet.length === 2) {
			// translate(string_to_tranlate, { from: language_duplet[0], to: language_duplet[1] })
			// 	.then((response: string) => {
			// 		return resolve({
			// 			result: true,
			// 			value: response
			// 		});
			// 	})
			// 	.catch((error: any) => {
			// 		return resolve({
			// 			result: false,
			// 			value: message_help('commands', 'translate', `server responded with error: ${error}`)
			// 		});
			// 	});
		} else if (language_duplet.length === 1) {
			// translate(string_to_tranlate, { to: language_duplet[0] })
			// 	.then((response: string) => {
			// 		return resolve({
			// 			result: true,
			// 			value: response
			// 		});
			// 	})
			// 	.catch((error: any) => {
			// 		return resolve({
			// 			result: false,
			// 			value: message_help('commands', 'translate', `server responded with error: ${error}`)
			// 		});
			// 	});
		} else {
			return resolve({
				result: false,
				value: message_help('commands', 'translate', '3 you can run `./help translate` for help')
			});
		}
	});
};
