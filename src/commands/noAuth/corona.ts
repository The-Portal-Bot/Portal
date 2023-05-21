import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import voca from 'voca';
import { CountryCodes } from '../../data/lists/countryCodesISO.static';
import { createEmbed, getJsonFromString, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

const countryCodes: { name: string; code: string; }[] = CountryCodes;

const getCountryCode = function (country: string): string | null {
  for (let i = 0; i < countryCodes.length; i++) {
    if (voca.lowerCase(countryCodes[i].name) === voca.lowerCase(country))
      return countryCodes[i].name;
    else if (voca.lowerCase(countryCodes[i].code) === voca.lowerCase(country))
      return countryCodes[i].name;
  }

  return null;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('corona')
    .setDescription('returns data about COVID19'),
  async execute(
    message: Message, args: string[]
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      let code: string | null = null;

      if (args.length === 1) {
        code = getCountryCode(args[0]);
        if (code === null) {
          return resolve({
            result: false,
            value: messageHelp('commands', 'corona', `${args[0]} is neither a country name nor code`)
          });
        }
      } else if (args.length > 1) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'corona', 'you must give only one argument')
        });
      } else {
        return resolve({
          result: false,
          value: messageHelp('commands', 'corona')
        });
      }

      const options: RequestOptions = {
        'method': 'GET',
        'hostname': 'covid-193.p.rapidapi.com',
        'port': undefined,
        'path': '/statistics',
        'headers': {
          'x-rapidapi-host': 'covid-193.p.rapidapi.com',
          'x-rapidapi-key': process.env.COVID_193,
          'useQueryString': 1
        },
      };

      httpsFetch(options)
        .then((response: Buffer) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const json = getJsonFromString(response.toString().substring(response.toString().indexOf('{')));

          if (json === null) {
            return resolve({
              result: false,
              value: 'data from source was corrupted'
            });
          }

          if (json.errors.length === 0) {
            const countryData = json.response.find((data: any) => data.country === code);

            if (!countryData) {
              return resolve({
                result: false,
                value: `${args[0]} is neither a country name nor code`
              });
            }

            message.channel
              .send({
                embeds: [
                  createEmbed(
                    `${countryData.country} | ${moment(countryData.time).format('DD/MM/YY')}`,
                    'Covid19 stats by covid-193',
                    '#FF0000',
                    [
                      {
                        emote: 'NEW cases',
                        role: `${countryData.cases.new ? countryData.cases.new : 'N/A'}`,
                        inline: true
                      },
                      {
                        emote: 'NEW deaths',
                        role: `${countryData.deaths.new ? countryData.deaths.new : 'N/A'}`,
                        inline: true
                      },
                      {
                        emote: 'Tests P1M',
                        role: `${countryData.tests['1M_pop']}`,
                        inline: true
                      },
                      {
                        emote: 'Cases',
                        role: `${countryData.cases.total}`,
                        inline: true
                      },
                      {
                        emote: 'Deaths',
                        role: `${countryData.deaths.total}`,
                        inline: true
                      },
                      {
                        emote: 'Recovered',
                        role: `${countryData.cases.recovered}`,
                        inline: true
                      },
                      {
                        emote: '%Recovered',
                        role: `${((countryData.cases.recovered / countryData.cases.total) * 100)
                          .toFixed(2)}%`,
                        inline: true
                      },
                      {
                        emote: '%Diseased',
                        role: `${((countryData.deaths.total / countryData.cases.total) * 100)
                          .toFixed(2)}%`,
                        inline: true
                      },
                      {
                        emote: 'Critical',
                        role: `${countryData.cases.critical}`,
                        inline: true
                      }
                    ],
                    null,
                    null,
                    true,
                    null,
                    null
                  )
                ]
              })
              .catch((e: any) => {
                return resolve({
                  result: false,
                  value: `failed to send message: ${e}`
                });
              });

            return resolve({
              result: true,
              value: ''
            });
          }
          else {
            return resolve({
              result: false,
              value: `fetched data had errors`
            });
          }
        })
        .catch(e => {
          return resolve({
            result: false,
            value: `could not access the server: ${e}`
          });
        });
    });
  }
};
