/* eslint-disable no-unused-vars */
const country_codes = require('../assets/jsons/country_codes.json');

const http_mngr = require('../libraries/httpOps');
const help_mngr = require('../libraries/helpOps');

const moment = require('moment');
const voca = require('voca');

const get_country_code = function(country) {
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

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path, user_match) => {
	return new Promise((resolve) => {
		let code = null;

		if (args.length === 1) {
			code = get_country_code(args[0]);
			if (code === null) {
				return resolve ({
					result: false,
					value: `*${args[0]} is neither a country name nor a country code.*`,
				});
			}
		}
		else if(args.length > 1) {
			return resolve ({
				result: false,
				value: '*you can run "./help corona" for help.*',
			});
		}
		else {
			return resolve ({
				result: false,
				value: '*Global stats are temporarily unavailable.*',
			});
		}

		const options = {
			'method': 'GET',
			'hostname': 'http://newsapi.org',
			'port': null,
			'path': '/v2/everything',
			'headers': {
				'q': 'bitcoin',
				'orgfrom': '2020-09-19',
				'sortBy': 'publishedAt',
				'apiKey': 'publishedAt',
			},  
		};

		http_mngr(options)
			.then(rspns => {
				const json = help_mngr.getJSON(rspns.toString().substring(rspns.toString().indexOf('{')));
				if(json === null) {
					return resolve ({
						result: false,
						value: 'data from source was corrupted',
					});
				}

				if (json.errors.length === 0) {
					const country_data = json.response.find(data => data.country === code);

					message.channel.send(
						help_mngr.create_rich_embed(`COVID19 ${country_data.country} stats ${moment().format('DD/MM/YY')}`,
							'covid-19 be api-sports', '#FF0000', [
								{
									emote: 'NEW cases',
									role: `***${country_data.cases.new}***`, inline: true },
								{
									emote: 'NEW deaths',
									role: `***${country_data.deaths.new}***`, inline: true },
								{
									emote: 'Tests P1M',
									role: `***${country_data.tests['1M_pop']}***`, inline: true },
								{
									emote: 'Cases',
									role: `***${country_data.cases.total}***`, inline: true },
								{
									emote: 'Deaths',
									role: `***${country_data.deaths.total}***`, inline: true },
								{
									emote: 'Recovered',
									role: `***${country_data.cases.recovered}***`, inline: true },
								{
									emote: '%Recovered',
									role: `***${((country_data.cases.recovered / country_data.cases.total) * 100)
										.toFixed(2)}%***`, inline: true },
								{
									emote: '%Diseased',
									role: `***${((country_data.deaths.total / country_data.cases.total) * 100)
										.toFixed(2)}%***`, inline: true },
								{
									emote: 'Critical',
									role: `***${country_data.cases.critical}***`, inline: true },
							], null, null, true));
					return resolve({ result: true, value: `*${country_data.country} corona stats.*` });
				}
				else {
					return resolve({
						result: false,
						value: `*${args[0]} is neither a country name nor a country code.*`,
					});
				}
			})
			.catch(rspns => {
				return resolve({
					result: false,
					value: '*Could not access the server*',
				});
			});
	});
};
