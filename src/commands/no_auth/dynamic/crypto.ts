import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import voca from 'voca';
import country_codes_json from '../../../assets/jsons/CountryCodes.json';
import config from '../../../config.json';
import { create_rich_embed, getJSON } from '../../../libraries/helpOps';
import { https_fetch } from '../../../libraries/httpOps';
import { GuildPrtl } from '../../../types/classes/GuildPrtl';
import { ReturnPormise } from '../../../types/interfaces/InterfacesPrtl';

const country_codes: { name: string; code: string; }[] = country_codes_json;

const get_country_code = function (country: string): string | null {
	for (let i = 0; i < country_codes.length; i++) {
		if (voca.lowerCase(country_codes[i].name) === voca.lowerCase(country))
			return country_codes[i].name;
		else if (voca.lowerCase(country_codes[i].code) === voca.lowerCase(country))
			return country_codes[i].name;
	}
	return null;
};

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		let code: string | null = null;

		if (args.length === 0) {
			return resolve({
				result: false,
				value: 'must add currency to search, you can run `./help crypto` for help'
			});
		}
		else if (args.length > 3) {
			return resolve({
				result: false,
				value: 'you can run `./help crypto` for help'
			});
		}

		const crypto_name = args.join(' ').substr(0, args.join(' ').indexOf('|')).replace(/\s/g, ' ').trim();
		const currnc_name = args.join(' ').substr(args.join(' ').indexOf('|') + 1).replace(/\s/g, ' ').trim();

		if (crypto_name === '') {
			return resolve({
				result: false,
				value: 'you must give a authority currency like usd'
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
						value: 'data from source was corrupted'
					});

				message.channel.send(
					create_rich_embed(
						`CRYPTO ${voca.titleCase(crypto_name)} - ${moment().format('DD/MM/YY')}`,
						'powered by coingecko',
						'#FF0000',
						[
							{
								emote: `${voca.titleCase(crypto_name)} to ${voca.titleCase(currnc_name)} price`,
								role: `${json[crypto_name][currnc_name]}`,
								inline: false
							}
						],
						null,
						null,
						true,
						null,
						null
					));
				return resolve({
					result: true,
					value: `${json} crypto stats`
				});
			})
			.catch((error: any) => {
				return resolve({
					result: false,
					value: `could not access the server*\nerror: ${error}`,
				});
			});
	});
};
