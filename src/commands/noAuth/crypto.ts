import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { RequestOptions } from 'https';
import voca from 'voca';
import { createEmbed, getJSONFromString, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('crypto').setDescription('returns information about crypto currencies'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    if (args.length === 0) {
      return {
        result: false,
        value: messageHelp('commands', 'crypto', 'must add currency to search'),
      };
    } else if (args.length > 3) {
      return {
        result: false,
        value: messageHelp('commands', 'crypto'),
      };
    }

    const cryptoName = args.join(' ').substring(0, args.join(' ').indexOf('|')).replace(/\s/g, ' ').trim();
    const currencyName = args
      .join(' ')
      .substring(args.join(' ').indexOf('|') + 1)
      .replace(/\s/g, ' ')
      .trim();

    if (cryptoName === '') {
      return {
        result: false,
        value: messageHelp('commands', 'crypto', 'you must give an authority currency like usd'),
      };
    }

    const options: RequestOptions = {
      method: 'GET',
      hostname: 'coingecko.p.rapidapi.com',
      port: undefined,
      path: `/simple/price?ids=${cryptoName}&vs_currencies=${currencyName}`,
      headers: {
        'x-rapidapi-host': 'coingecko.p.rapidapi.com',
        'x-rapidapi-key': process.env.COINGECKO,
        useQueryString: 1,
      },
    };

    const response = await httpsFetch(options);

    if (!response) {
      return {
        result: false,
        value: `could not fetch data from source`,
      };
    }

    const json = getJSONFromString(response.toString().substring(response.toString().indexOf('{')));

    if (!json) {
      return {
        result: false,
        value: 'data from source was corrupted',
      };
    }

    const outcome = await interaction.channel?.send({
      embeds: [
        createEmbed(null, null, '#FFE600', null, null, null, false, null, null, undefined, {
          name: `${voca.titleCase(cryptoName)} to ${voca.titleCase(currencyName)} price is ${
            json[cryptoName][currencyName]
          }`,
          icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/coin.gif',
        }),
      ],
    });

    return {
      result: false,
      value: outcome ? '' : 'failed to send message',
    };
  },
};
