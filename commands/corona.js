/* eslint-disable no-cond-assign */
/* eslint-disable no-unused-vars */
const country_codes = require('./../assets/jsons/country_codes.json');
// let portal_managed_guilds = file_system.readFileSync(portal_managed_guilds_path);

const http_mngr = require('./../functions/http_requests');
const help_mngr = require('./../functions/help_manager');
const lclz_mngr = require('./../functions/localization_manager');

const https = require('https');
const moment = require('moment');
const voca = require('voca');

const get_country_code = function (country) {
	for (let i = 0; i < country_codes.length; i++) {
		if (voca.lowerCase(country_codes[i].name) === voca.lowerCase(country)) {
			return country_codes[i].code;
		} else if (voca.lowerCase(country_codes[i].code) === voca.lowerCase(country)) {
			return country_codes[i].code;
		}
	}
	return null;
};

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path, user_match) => {
	return new Promise((resolve) => {
		let url = null;
		if (args.length === 0) {
			url = '/free-api?global=stats';
		} else if (args.length === 1) {
			let code = get_country_code(args[0]);
			if (code !== null) {
				url = '/free-api?countryTotal=' + code;
			} else {
				return resolve ({ result: false, value: `*${args[0]} is neither a country name nor a country code.*` });
			}
		} else {
			return resolve ({ result: false, value: '*you can run "./help corona" for help.*' });
		}

		let options = {
			'method': 'GET',
			'hostname': 'api.thevirustracker.com',
			'path': url,
			'headers': {},
			'maxRedirects': 20
		};

		http_mngr(options)
			.then(rspns => {
				let json = JSON.parse(rspns.toString().substring(rspns.toString().indexOf('{')));

				if (json.countrydata !== undefined) {
					let daily_stats = json.countrydata[0];
					let country_stats = json.countrydata[0].info;

					message.channel.send(help_mngr.create_rich_embed(`COVID19 ${country_stats.title} stats ${moment().format('DD/MM/YY')}`,
						'https://thevirustracker.com/', '#ff0000', [
							{ emote: 'New cases', role: `+***${daily_stats.total_new_cases_today}***`, inline: true },
							{ emote: 'New deaths', role: `+***${daily_stats.total_new_deaths_today}***`, inline: true },
							{ emote: 'Danger rank', role: `***${daily_stats.total_danger_rank}***`, inline: true },
							{ emote: 'Total cases', role: `***${daily_stats.total_cases}***`, inline: true },
							{ emote: 'Total deaths', role: `***${daily_stats.total_deaths}***`, inline: true },
							{ emote: 'Total recovered', role: `***${daily_stats.total_recovered}***`, inline: true },
							{ emote: '% Recovered', role: `***${((daily_stats.total_recovered / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
							{ emote: '% Diseased', role: `***${((daily_stats.total_deaths / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
							{ emote: 'Serious cases', role: `***${daily_stats.total_serious_cases}***`, inline: true }
						], null, null, true));
					return resolve({ result: true, value: `*${country_stats.title} corona stats.*` });
				} else if (json.results !== undefined && json.results[0].data !== 'none') {
					let daily_stats = json.results[0];

					message.channel.send(help_mngr.create_rich_embed(`COVID19 Global stats ${moment().format('DD/MM/YY')}`,
						'https://thevirustracker.com/', '#ff0000', [
							{ emote: 'New cases', role: `+***${daily_stats.total_new_cases_today}***`, inline: true },
							{ emote: 'New deaths', role: `+***${daily_stats.total_new_deaths_today}***`, inline: true },
							{ emote: 'Danger rank', role: '***-***', inline: true },
							{ emote: 'Total cases', role: `***${daily_stats.total_cases}***`, inline: true },
							{ emote: 'Total deaths', role: `***${daily_stats.total_deaths}***`, inline: true },
							{ emote: 'Total recovered', role: `***${daily_stats.total_recovered}***`, inline: true },
							{ emote: '% Recovered', role: `***${((daily_stats.total_recovered / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
							{ emote: '% Diseased', role: `***${((daily_stats.total_deaths / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
							{ emote: 'Serious cases', role: `***${daily_stats.total_serious_cases}***`, inline: true }
						], null, null, true));
					return resolve({ result: true, value: '*Global corona stats.*' });
				} else {
					return resolve({ result: false, value: `*${args[0]} is neither a country name nor a country code.*` });
				}
			})
			.catch(rspns => {
				return resolve({ result: false, value: '*Could not access the server*' });
			});
	});
};
