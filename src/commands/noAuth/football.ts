import { RequestOptions } from 'https';
import { getJSONFromString } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('football').setDescription('returns football data'),
  async execute():
    Promise<ReturnPromise> {
    // if (args.length < 3) {
    //     return {
    //         result: false,
    //         value: 'you can run `./help football` for help'
    //     };
    // } else {
    //     return {
    //         result: false,
    //         value: 'you should specify the league and match day, you can run `./help football` for help'
    //     };
    // }

    const league = 'PL';
    const day = '22';

    const options: RequestOptions = {
      method: 'GET',
      hostname: `http://api.football-data.org/v2/competitions/${league}/matches/?matchday=${day}`,
      port: undefined,
      path: '/statistics',
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA,
        useQueryString: 1,
      },
    };

    const response = await httpsFetch(options);

    const json = getJSONFromString(response.toString().substring(response.toString().indexOf('{')));

    return {
      result: true,
      value: 'yolo ?',
    };

    // if (json === null) {
    //   return {
    //     result: false,
    //     value: 'data from source was corrupted',
    //   };
    // }

    // if (json.errors.length === 0) {
    //     const country_data = json.response.find((data) => data.country === code);

    //     if (!country_data) {
    //         return {
    //             result: false,
    //             value: `${args[0]} is neither a country name nor a country code`,
    //         };
    //     }

    //     message.channel.send(
    //         create_rich_embed(
    //             `${country_data.country} | ${moment().format('DD/MM/YY')}`,
    //             'Covid19 stats powered by api-sports',
    //             '#FF0000',
    //             [
    //                 {
    //                     emote: 'NEW cases',
    //                     role: `${country_data.cases.new ? country_data.cases.new : 'N/A'}`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: 'NEW deaths',
    //                     role: `${country_data.deaths.new ? country_data.deaths.new : 'N/A'}`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: 'Tests P1M',
    //                     role: `${country_data.tests['1M_pop']}`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: 'Cases',
    //                     role: `${country_data.cases.total}`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: 'Deaths',
    //                     role: `${country_data.deaths.total}`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: 'Recovered',
    //                     role: `${country_data.cases.recovered}`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: '%Recovered',
    //                     role: `${((country_data.cases.recovered / country_data.cases.total) * 100)
    //                         .toFixed(2)}%`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: '%Diseased',
    //                     role: `${((country_data.deaths.total / country_data.cases.total) * 100)
    //                         .toFixed(2)}%`,
    //                     inline: true
    //                 },
    //                 {
    //                     emote: 'Critical',
    //                     role: `${country_data.cases.critical}`,
    //                     inline: true
    //                 }
    //             ],
    //             null,
    //             null,
    //             true,
    //             null,
    //             null
    //         ));

    //     return {
    //         result: true,
    //         value: ''
    //     };
    // }
    // else {
    //     return {
    //         result: false,
    //         value: `fetched data had errors`
    //     };
    // }
    //
    // return {
    //   result: false,
    //   value: `could not access the server\nerror: ${error}`,
    // };
  },
};
