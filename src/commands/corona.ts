/* eslint-disable no-unused-vars */
import { Client, Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import voca from 'voca';
import country_codes_json from '../assets/jsons/country_codes.json';
import { create_rich_embed, getJSON } from '../libraries/helpOps';
import { https_fetch } from '../libraries/httpOps';
import { GuildPrtl } from '../types/classes/GuildPrtl';

const country_codes: { name: string; code: string; }[] = country_codes_json;

const get_country_code = function (country: string): string | null {
	for (let i = 0; i < country_codes.length; i++) {
		if (voca.lowerCase(country_codes[i].name) === voca.lowerCase(country)) {
			return country_codes[i].name;
		}
		else if (voca.lowerCase(country_codes[i].code) === voca.lowerCase(country)) {
			return country_codes[i].name;
		}
	}
	return null;
};

module.exports = async (args: {
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
}) => {
	return new Promise((resolve) => {
		const guild_object = args.guild_list.find(g => g.id === args.message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		let code: string | null = null;

		if (args.args.length === 1) {
			code = get_country_code(args.args[0]);
			if (code === null) {
				return resolve({
					result: false,
					value: `*${args.args[0]} is neither a country name nor a country code.*`,
				});
			}
		}
		else if (args.args.length > 1) {
			return resolve({
				result: false,
				value: '*you can run "./help corona" for help.*',
			});
		}
		else {
			return resolve({
				result: false,
				value: '*Global stats are temporarily unavailable.*',
			});
		}

		const options: RequestOptions = {
			'method': 'GET',
			'hostname': 'covid-193.p.rapidapi.com',
			'port': undefined,
			'path': '/statistics',
			'headers': {
				'x-rapidapi-host': 'covid-193.p.rapidapi.com',
				'x-rapidapi-key': 'b883903090msh7eef2b50e6cbe9cp1ff439jsnee4d6c48061f',
				'useQueryString': 1,
			},
		};

		https_fetch(options)
			.then((rspns: Buffer) => {
				const json = getJSON(rspns.toString().substring(rspns.toString().indexOf('{')));
				if (json === null) {
					return resolve({
						result: false,
						value: 'data from source was corrupted',
					});
				}

				if (json.errors.length === 0) {
					const country_data = json.response.find((data: any) => data.country === code);

					args.message.channel.send(
						create_rich_embed(
							`COVID19 ${country_data.country} stats ${moment().format('DD/MM/YY')}`,
							'covid-19 be api-sports',
							'#FF0000',
							[
								{
									emote: 'NEW cases',
									role: `***${country_data.cases.new}***`, inline: true
								},
								{
									emote: 'NEW deaths',
									role: `***${country_data.deaths.new}***`, inline: true
								},
								{
									emote: 'Tests P1M',
									role: `***${country_data.tests['1M_pop']}***`, inline: true
								},
								{
									emote: 'Cases',
									role: `***${country_data.cases.total}***`, inline: true
								},
								{
									emote: 'Deaths',
									role: `***${country_data.deaths.total}***`, inline: true
								},
								{
									emote: 'Recovered',
									role: `***${country_data.cases.recovered}***`, inline: true
								},
								{
									emote: '%Recovered',
									role: `***${((country_data.cases.recovered / country_data.cases.total) * 100)
										.toFixed(2)}%***`, inline: true
								},
								{
									emote: '%Diseased',
									role: `***${((country_data.deaths.total / country_data.cases.total) * 100)
										.toFixed(2)}%***`, inline: true
								},
								{
									emote: 'Critical',
									role: `***${country_data.cases.critical}***`, inline: true
								},
							],
							null,
							null,
							true,
							null,
							null
						));
					return resolve({ result: true, value: `*${country_data.country} corona stats.*` });
				}
				else {
					return resolve({
						result: false,
						value: `*${args.args[0]} is neither a country name nor a country code.*`,
					});
				}
			})
			.catch((error: any) => {
				return resolve({
					result: false,
					value: `*Could not access the server*\nerror: ${error}`,
				});
			});
	});
};
