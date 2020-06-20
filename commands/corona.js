/* eslint-disable no-cond-assign */
/* eslint-disable no-unused-vars */
const country_codes = require('./../assets/jsons/country_codes.json');
// let portal_managed_guilds = file_system.readFileSync(portal_managed_guilds_path);

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
	let url = null;
	if (args.length === 0) {
		url = '/free-api?global=stats';
	} else if (args.length === 1) {
		let code = get_country_code(args[0]);
		if (code !== null) {
			url = '/free-api?countryTotal=' + code;
		} else {
			return {
				result: false, value: `*${args[0]} is neither a country name nor a country code.*`
			};
		}
	} else {
		return {
			result: false, value: '*you can run "./help corona" for help.*'
		};
	}

	let options = {
		'method': 'GET',
		'hostname': 'api.thevirustracker.com',
		'path': url,
		'headers': {
		},
		'maxRedirects': 20
	};

	let req = https.request(options, function (res) {
		let chunks = [];

		res.on('data', function (chunk) {
			chunks.push(chunk);
		});

		res.on('end', function (chunk) {
			let body = Buffer.concat(chunks);
			let json = JSON.parse(body.toString().substring(body.toString().indexOf('{')));

			if (json.countrydata !== undefined) {
				let daily_stats = json.countrydata[0];
				let country_stats = json.countrydata[0].info;

				message.channel.send(help_mngr.create_rich_embed(`CoronaVirus stats for ${country_stats.title} ${moment().format('DD/MM/YY')}`,
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
			} else if (json.results !== undefined && json.results[0].data !== 'none') {
				let daily_stats = json.results[0];

				message.channel.send(help_mngr.create_rich_embed(`CoronaVirus stats Globally ${moment().format('DD/MM/YY')}`,
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
			} else {
				message.channel.send(
					`**Could not find ${args[0]} country ("./help corona" for help).**`,
					message.author).then(msg => { msg.delete({ timeout: 5000 }); });
				lclz_mngr.client_talk(client, portal_guilds, 'error');
				message.react('❌');
			}
		});

		res.on('error', function (error) {
			console.error(error);
		});
	});

	req.end();

	return {
		result: true, value: '**Make sure to always wait a bit for data as a response is on the way.**'
	};
};
