import { ChatInputCommandInteraction, Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import { OpapGameId } from '../../types/enums/OpapGames.enum';
import { createEmbed, getJSONFromString, getKeyFromEnum, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('bet').setDescription('returns betting data'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    let gameCode: number | undefined = undefined;

    if (args.length === 2) {
      if (args[0].toLowerCase() !== 'opap') {
        return {
          result: false,
          value: messageHelp('commands', 'bet', `${args[0]} is not a provider`),
        };
      } else {
        if (isNaN(+args[1])) {
          gameCode = <number>getKeyFromEnum(args[1].toLowerCase(), OpapGameId);
        }

        if (!gameCode) {
          return {
            result: false,
            value: messageHelp('commands', 'bet', `${args[1]} does not exist in ${args[0]}`),
          };
        }
      }
    } else {
      return {
        result: false,
        value: messageHelp('commands', 'bet', ''),
      };
    }

    const options: RequestOptions = {
      method: 'GET',
      hostname: `api.opap.gr`,
      port: undefined,
      path: `/draws/v3.0/${gameCode}/last-result-and-active`,
      headers: {
        'x-opap-host': 'api.opap.gr',
        useQueryString: 1,
      },
    };

    const response = await httpsFetch(options);

    if (!response) {
      return {
        result: false,
        value: `could not fetch data from OpenAPI`,
      };
    }

    const json = getJSONFromString(response.toString().substring(response.toString().indexOf('{')));

    if (json === null) {
      return {
        result: false,
        value: 'data from source is corrupted',
      };
    }

    const outcome = await interaction.channel?.send({
      embeds: [
        createEmbed(
          `${args[1]} from ${args[0]} | ${moment(json.last.drawTime).format('DD/MM/YY')}`,
          `powered by ${args[0]}`,
          '#0384fc',
          [
            {
              emote: 'Winning Numbers',
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              role: `${json.last.winningNumbers.list.map((n: number) => n).join(', ')}`,
              inline: true,
            },
            {
              emote: 'Tzoker',
              role: `${json.last.winningNumbers.bonus}`,
              inline: true,
            },
            {
              emote: `${json.last.prizeCategories[0].winners > 1 ? 'Winners' : 'Winner'}`,
              role: `${json.last.prizeCategories[0].winners}`,
              inline: true,
            },
            {
              emote: 'Draw Number',
              role: `${json.last.drawId}`,
              inline: true,
            },
            {
              emote: 'Columns Cast',
              role: `${json.last.wagerStatistics.columns}`,
              inline: true,
            },
            {
              emote: 'Wagers',
              role: `${json.last.wagerStatistics.wagers}`,
              inline: true,
            },
          ],
          null,
          null,
          true,
          null,
          null
        ),
      ],
    });

    return {
      result: false,
      value: outcome ? '' : `failed to send message`,
    };
  },
};
