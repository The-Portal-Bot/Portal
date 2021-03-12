import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import voca from 'voca';
import config from '../../../config.json';
import { create_rich_embed, getJSON, message_help } from '../../../libraries/help.library';
import { https_fetch } from '../../../libraries/http.library';
import { GuildPrtl } from '../../../types/classes/GuildPrtl.class';
import { CountryCodes } from '../../../data/lists/country_codes_iso.static';
import { ReturnPormise } from '../../../types/interfaces/InterfacesPrtl.interface';

const country_codes: { name: string; code: string; }[] = CountryCodes;

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

		if (args.length === 0 || args.length > 1) {
			return resolve({
				result: false,
				value: message_help('commands', 'stock')
			});
		}

		const options: RequestOptions = {
			'method': 'GET',
			'hostname': 'yahoo-finance-low-latency.p.rapidapi.com',
			'port': undefined,
			'path': `/v8/finance/chart/${args[0]}?events=div%2Csplit`,
			'headers': {
				'x-rapidapi-host': 'yahoo-finance-low-latency.p.rapidapi.com',
				'x-rapidapi-key': config.api_keys.yahoo_finance,
				'useQueryString': 1
			}
		};

		https_fetch(options)
			.then((response: Buffer) => {
				const json = getJSON(response.toString().substring(response.toString().indexOf('{')));
				if (json === null)
					return resolve({
						result: false,
						value: message_help('commands', 'stock', 'data from source was corrupted')
					});

				const chart = json.chart;

				if (chart === null)
					return resolve({
						result: false,
						value: message_help('commands', 'stock', 'could not find any stock')
					});

				const result = chart.result;

				if (result === null)
					return resolve({
						result: false,
						value: message_help('commands', 'stock', 'there were no results')
					});

				const meta = result[0];

				if (meta === null)
					return resolve({
						result: false,
						value: message_help('commands', 'stock', 'there were no meta data')
					});

				message.channel.send(
					create_rich_embed(
						`STOCK ${meta.symbol} (${meta.regularMarketPrice}) - ${moment().format('DD/MM/YY')}`,
						'powered by yahoo finance',
						'#FF0000', [],
						// [
						// 	{
						// 		emote: `${voca.titleCase(crypto_name)} to ${voca.titleCase(currnc_name)} price`,
						// 		role: `${json[crypto_name][currnc_name]}`,
						// 		inline: false
						// 	}
						// ],
						null,
						null,
						true,
						null,
						null
					));

				return resolve({
					result: true,
					value: message_help('commands', 'stock', `${json} crypto stats`)
				});
			})
			.catch((error: any) => {
				return resolve({
					result: false,
					value: message_help('commands', 'stock', `could not access the server\nerror: ${error}`,)
				});
			});
	});
};
