import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { RequestOptions } from 'https';
import dayjs from 'dayjs';
import { commandDescriptionByNameAndAuthenticationLevel, createEmbed, getJSONFromString, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'bet';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, false))
    .addStringOption(option =>
      option.setName('provider')
        .setDescription('betting provider')
        .setRequired(true)
        .addChoices(
          { name: 'ΟΠΑΠ', value: 'opap' },
        ))
    .addNumberOption(option =>
      option.setName('game')
        .setDescription('betting game')
        .setRequired(true)
        .addChoices(
          { name: 'ΚΙΝΟ', value: 1100 },
          { name: 'PoweSpin', value: 1110 },
          { name: 'Super3', value: 2100 },
          { name: 'ΠΡΟΤΟ', value: 2101 },
          { name: 'LOTTO', value: 5103 },
          { name: 'Tzoker', value: 5104 },
          { name: 'extra5', value: 5106 },
        )),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const provider = interaction.options.getString('provider');
    const gameCode = interaction.options.getNumber('game');

    if (!provider) {
      return {
        result: false,
        value: messageHelp('commands', 'bet', 'provider must be provided'),
      };
    }

    if (!gameCode) {
      return {
        result: false,
        value: messageHelp('commands', 'bet', 'gameCode must be provided'),
      };
    }

    const options: RequestOptions = {
      method: 'GET',
      hostname: 'api.opap.gr',
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
        value: 'could not fetch data from OpenAPI',
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
          `${gameCode} from ${provider} | ${dayjs(json.last.drawTime).format('DD/MM/YY')}`,
          `powered by ${provider}`,
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
      result: !!outcome,
      value: outcome ? '' : 'failed to send message',
    };
  },
};
