import { Client, Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import config from '../config.json';
import { create_rich_embed, getJSON } from '../libraries/helpOps';
import { https_fetch } from '../libraries/httpOps';
import { GuildPrtl } from '../types/classes/GuildPrtl';

function kelvin_to_celsius(kelvin: number): number {
	return Math.round(kelvin - 273.15);
}

function kelvin_to_fahrenheit(kelvin: number): number {
	return Math.round(((kelvin - 273.15) * (9 / 5)) + 32);
}

function ms_to_ks(ms: number): number {
	return Math.round(ms * 3.6);
}

function ms_to_mlh(ms: number): number {
	return Math.round(ms * 2.237);
}

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object)
			return resolve({ result: true, value: 'portal guild could not be fetched' });

		if (args.length < 1)
			return resolve({ result: false, value: 'you can run "./help weather" for help.', });

		const location = args.join('%2C%20');
		const options: RequestOptions = {
			"method": "GET",
			"hostname": "api.openweathermap.org",
			"port": undefined,
			"path": `/data/2.5/weather?q=${location}&appid=${config.api_keys.OpenWeatherMap}`,
		};

		https_fetch(options)
			.then((rspns: Buffer) => {
				const json = getJSON(rspns.toString().substring(rspns.toString().indexOf('{')));
				if (json === null)
					return resolve({ result: false, value: 'data from source was corrupted' });
				if (json.cod === '404')
					return resolve({ result: false, value: 'city not found' });

				if (json.cod === 200) {
					message.channel.send(
						create_rich_embed(
							`${json.name}, ${json.sys.country} at ${moment().format('DD/MM/YY')}`,
							'powered by OpenWeatherMap',
							'#BFEFFF',
							[
								{
									emote: 'Temperature',
									role: `${kelvin_to_celsius(json.main.temp)}°C / ${kelvin_to_fahrenheit(json.main.temp)}°F`,
									inline: true
								},
								{
									emote: 'Feels like',
									role: `${kelvin_to_celsius(json.main.feels_like)}°C / ${kelvin_to_fahrenheit(json.main.feels_like)}°F`,
									inline: true
								},
								{
									emote: null,
									role: null,
									inline: false
								},
								{
									emote: 'Humidity',
									role: `${json.main.humidity}`,
									inline: true
								},
								{
									emote: 'Wind Speed',
									role: `${ms_to_ks(json.wind.speed)}kmh / ${ms_to_mlh(json.wind.speed)}mlh`,
									inline: true
								},
								{
									emote: 'Cloudiness',
									role: `${json.clouds.all}%`,
									inline: true
								},
								{
									emote: 'Condition',
									role: `${json.weather.map((w: any) => {
										return `${w.main} (${w.description})`;
									}).join(', ')}`,
									inline: false
								}
							],
							`http://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`,
							null,
							true,
							null,
							null
						));
					return resolve({ result: true, value: `${json.name} weather` });
				}
				else {
					return resolve({ result: false, value: `could not access the server\nerror: ${json.cod}` });
				}
			})
			.catch((error: any) => {
				return resolve({ result: false, value: `could not access the server\nerror: ${error}` });
			});
	});
};
