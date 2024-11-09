import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { RequestOptions } from 'https';
import voca from 'voca';
import { createEmbed, getJSONFromString, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { Command } from '../../types/Command';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'crypto';
const DESCRIPTION = 'returns information about crypto currencies';

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption((option) =>
      option.setName('crypto_name').setDescription('The `name of the crypto currency`').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('currency_name').setDescription('The name of the fiat currency to compare to').setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    if (!process.env.COIN_GECKO) {
      return {
        result: false,
        value: 'COIN_GECKO API key is not set up',
      };
    }

    const cryptoName = interaction.options.getString('crypto_name');
    const currencyName = interaction.options.getString('currency_name');

    if (!cryptoName || !currencyName) {
      return {
        result: false,
        value: messageHelp('commands', 'crypto', 'crypto and fiat name must be provided'),
      };
    }

    const options: RequestOptions = {
      method: 'GET',
      hostname: 'coingecko.p.rapidapi.com',
      port: undefined,
      path: `/simple/price?ids=${cryptoName}&vs_currencies=${currencyName}`,
      headers: {
        'x-rapidapi-host': 'coingecko.p.rapidapi.com',
        'x-rapidapi-key': process.env.COIN_GECKO,
        useQueryString: 1,
      },
    };

    const response = await httpsFetch(options);

    if (!response) {
      return {
        result: false,
        value: 'could not fetch data from source',
      };
    }

    const json = getJSONFromString(response.toString().substring(response.toString().indexOf('{')));

    if (!json) {
      return {
        result: false,
        value: 'data from source was corrupted',
      };
    }

    const outcome = await interaction.reply({
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
      result: !!outcome,
      value: outcome ? '' : 'failed to send message',
    };
  },
} as Command;
