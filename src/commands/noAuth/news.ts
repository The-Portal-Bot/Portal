import { ChatInputCommandInteraction, Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import { NYTCategories } from '../../assets/lists/newsCategories.static';
import { createEmbed, getJSONFromString, maxString, messageHelp } from '../../libraries/help.library';
import { httpsFetch } from '../../libraries/http.library';
import { News } from '../../types/classes/NewYorkTime.class';
import { Field, ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('news').setDescription('returns news from New York Times'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    const category = NYTCategories.find((c) => c === args[0]);
    let count = 4;

    if (args.length === 1) {
      if (!category) {
        return {
          result: false,
          value: messageHelp('commands', 'news', `${args[0]} is not a news category`),
        };
      }
    } else if (args.length === 2) {
      if (!category) {
        return {
          result: false,
          value: messageHelp('commands', 'news', `${args[0]} is not a news category`),
        };
      } else {
        count = +args[1];
        if (isNaN(count)) {
          return {
            result: false,
            value: messageHelp('commands', 'news', `${args[1]} is not a number`),
          };
        }
        if (count > 15) {
          return {
            result: false,
            value: messageHelp('commands', 'news', `can display up to 15 articles`),
          };
        }
        --count;
      }
    } else {
      return {
        result: false,
        value: messageHelp('commands', 'news'),
      };
    }

    const options: RequestOptions = {
      method: 'GET',
      hostname: `api.nytimes.com`,
      port: undefined,
      path: `/svc/topstories/v2/${category}.json?api-key=${process.env.NEW_YORK_TIMES}`,
      headers: {
        'x-api-host': 'api.nytimes.com',
        // 'api-key': process.env.NEW_YORK_TIMES,
        Accept: 'application/json',
        useQueryString: 1,
      },
    };

    const response = await httpsFetch(options);

    if (!response) {
      return {
        result: false,
        value: `could not access the server`,
      };
    }

    const json = getJSONFromString(response.toString().substring(response.toString().indexOf('{')));

    if (json === null) {
      return {
        result: false,
        value: 'data from source was corrupted',
      };
    }

    if (json.status !== 'OK') {
      return {
        result: false,
        value: 'NYTimes replied with an error',
      };
    }

    const news: News = json;

    const topNews: Field[] = [];

    news.results.some((n, i) => {
      topNews.push(<Field>{
        emote: `${n.title}`,
        role: `_[${maxString(n.abstract, 256)}](${n.url})_`,
        inline: false,
      });

      return i === count;
    });

    const outcome = await interaction.channel
      ?.send({
        embeds: [
          createEmbed(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `News ${args[0]} | ${moment(json.last_updated).format('DD/MM/YY hh:mm')}`,
            'powered by NYTimes',
            '#000000',
            topNews,
            null,
            null,
            true,
            null,
            null
          ),
        ],
      });

    return {
      result: true,
      value: outcome ? '' : `failed to send message`,
    };
  },
};
