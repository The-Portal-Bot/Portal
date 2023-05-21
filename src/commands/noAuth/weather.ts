/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import { createEmbed, getJsonFromString, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

function kelvinToCelsius(kelvin: number): number {
    return Math.round(kelvin - 273.15);
}

function kelvinToFahrenheit(kelvin: number): number {
    return Math.round(((kelvin - 273.15) * (9 / 5)) + 32);
}

function msToKs(ms: number): number {
    return Math.round(ms * 3.6);
}

function msToMlh(ms: number): number {
    return Math.round(ms * 2.237);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('returns data information'),
    async execute(
        message: Message, args: string[]
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            if (args.length < 1)
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'weather')
                });

            const location = args.join('%2C%20');
            const options: RequestOptions = {
                "method": "GET",
                "hostname": "api.openweathermap.org",
                "port": undefined,
                "path": `/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP}`,
            };

            httpsFetch(options)
                .then((response: Buffer) => {
                    const json = getJsonFromString(response.toString().substring(response.toString().indexOf('{')));
                    if (json === null) {
                        return resolve({
                            result: false,
                            value: 'data from source was corrupted'
                        });
                    }

                    if (json.cod === '404') {
                        return resolve({
                            result: false,
                            value: messageHelp('commands', 'weather', 'city not found')
                        });
                    }

                    if (json.cod === 200) {
                        message.channel
                            .send({
                                embeds: [
                                    createEmbed(
                                        `${json.name}, ${json.sys.country} at ${moment().format('DD/MM/YY')}`,
                                        'powered by OpenWeatherMap',
                                        '#BFEFFF',
                                        [
                                            {
                                                emote: 'Temperature',
                                                role: `${kelvinToCelsius(json.main.temp)}°C / ${kelvinToFahrenheit(json.main.temp)}°F`,
                                                inline: true
                                            },
                                            {
                                                emote: 'Feels like',
                                                role: `${kelvinToCelsius(json.main.feels_like)}°C / ${kelvinToFahrenheit(json.main.feels_like)}°F`,
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
                                                role: `${msToKs(json.wind.speed)}kmh / ${msToMlh(json.wind.speed)}mlh`,
                                                inline: true
                                            },
                                            {
                                                emote: 'Cloudiness',
                                                role: `${json.clouds.all}%`,
                                                inline: true
                                            },
                                            {
                                                emote: 'Condition',
                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
                                    )
                                ]
                            })
                            .catch(e => {
                                return resolve({
                                    result: true,
                                    value: `failed to send message: ${e}`
                                });
                            });

                        return resolve({
                            result: true,
                            value: `${json.name} weather`
                        });
                    }
                    else {
                        return resolve({
                            result: false,
                            value: `could not access the server / ${json.cod}`
                        });
                    }
                })
                .catch((e: any) => {
                    return resolve({
                        result: false,
                        value: `could not access the server: ${e}`
                    });
                });
        });
    }
};
