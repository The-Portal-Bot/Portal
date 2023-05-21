
import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import { OpapGameId } from '../../types/enums/OpapGames.enum';
import { createEmbed, getJsonFromString, getKeyFromEnum, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder()
    .setName('bet')
    .setDescription('returns betting data'),
  async execute(
    message: Message, args: string[]
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      let gameCode: number | undefined = undefined;

      if (args.length === 2) {
        if (args[0].toLowerCase() !== 'opap') {
          return resolve({
            result: false,
            value: messageHelp('commands', 'bet', `${args[0]} is not a provider`)
          });
        } else {
          if (isNaN(+args[1])) {
            gameCode = <number>getKeyFromEnum(args[1].toLowerCase(), OpapGameId);
          }

          if (!gameCode) {
            return resolve({
              result: false,
              value: messageHelp('commands', 'bet', `${args[1]} does not exist in ${args[0]}`)
            });
          }
        }
      } else {
        return resolve({
          result: false,
          value: messageHelp('commands', 'bet', '')
        });
      }

      const options: RequestOptions = {
        'method': 'GET',
        'hostname': `api.opap.gr`,
        'port': undefined,
        'path': `/draws/v3.0/${gameCode}/last-result-and-active`,
        'headers': {
          'x-opap-host': 'api.opap.gr',
          'useQueryString': 1
        }
      };

      httpsFetch(options)
        .then((response: Buffer) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const json = getJsonFromString(response.toString()
            .substring(response.toString().indexOf('{')));

          if (json === null) {
            return resolve({
              result: false,
              value: 'data from source is corrupted'
            });
          }

          message.channel
            .send({
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
                      inline: true
                    },
                    {
                      emote: 'Tzoker',
                      role: `${json.last.winningNumbers.bonus}`,
                      inline: true
                    },
                    {
                      emote: `${(json.last.prizeCategories[0].winners > 1) ? 'Winners' : 'Winner'}`,
                      role: `${json.last.prizeCategories[0].winners}`,
                      inline: true
                    },
                    {
                      emote: 'Draw Number',
                      role: `${json.last.drawId}`,
                      inline: true
                    },
                    {
                      emote: 'Columns Cast',
                      role: `${json.last.wagerStatistics.columns}`,
                      inline: true
                    },
                    {
                      emote: 'Wagers',
                      role: `${json.last.wagerStatistics.wagers}`,
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
            .catch((e) => {
              return resolve({
                result: false,
                value: `failed to send message: ${e}`
              });
            });


          return resolve({
            result: true,
            value: ''
          });

        })
        .catch((e) => {
          return resolve({
            result: false,
            value: `could not access the server: ${e}`
          });
        });
    });
  }
};
