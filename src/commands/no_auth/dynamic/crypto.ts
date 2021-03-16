import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import voca from 'voca';
import config from '../../../config.json';
import { create_rich_embed, getJSON, message_help } from '../../../libraries/help.library';
import { https_fetch } from '../../../libraries/http.library';
import { GuildPrtl } from '../../../types/classes/GuildPrtl.class';
import { ReturnPormise } from '../../../types/classes/TypesPrtl.interface';

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		let code: string | null = null;

		if (args.length === 0) {
			return resolve({
				result: false,
				value: message_help('commands', 'crypto', 'must add currency to search')
			});
		}
		else if (args.length > 3) {
			return resolve({
				result: false,
				value: message_help('commands', 'crypto')
			});
		}

		const crypto_name = args.join(' ').substr(0, args.join(' ').indexOf('|')).replace(/\s/g, ' ').trim();
		const currnc_name = args.join(' ').substr(args.join(' ').indexOf('|') + 1).replace(/\s/g, ' ').trim();

		if (crypto_name === '') {
			return resolve({
				result: false,
				value: message_help('commands', 'crypto', 'you must give an authority currency like usd')
			});
		}

		const options: RequestOptions = {
			'method': 'GET',
			'hostname': 'coingecko.p.rapidapi.com',
			'port': undefined,
			'path': `/simple/price?ids=${crypto_name}&vs_currencies=${currnc_name}`,
			'headers': {
				'x-rapidapi-host': 'coingecko.p.rapidapi.com',
				'x-rapidapi-key': config.api_keys.coingecko,
				'useQueryString': 1
			}
		};

		https_fetch(options)
			.then((response: Buffer) => {
				const json = getJSON(response.toString().substring(response.toString().indexOf('{')));
				if (json === null)
					return resolve({
						result: false,
						value: message_help('commands', 'crypto', 'data from source was corrupted')
					});

				message.channel.send(
					create_rich_embed(
						null,
						null,
						'#FFE600',
						null,
						null,
						null,
						false,
						null,
						null,
						undefined,
						{
							name: `${voca.titleCase(crypto_name)} to ${voca.titleCase(currnc_name)} price is ${json[crypto_name][currnc_name]}`,
							icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/coin.gif'
						}						
					));

				return resolve({
					result: true,
					value: ''
				});
			})
			.catch((error: any) => {
				return resolve({
					result: false,
					value: message_help('commands', 'crypto', `could not access the server\nerror: ${error}`)
				});
			});
	});
};
