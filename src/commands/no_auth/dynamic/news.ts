import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import config from '../../../config.json';
import { NYTCategories } from '../../../data/lists/profane_words.static copy';
import { create_rich_embed, getJSON, max_string, message_help } from '../../../libraries/help.library';
import { https_fetch } from '../../../libraries/http.library';
import { GuildPrtl } from '../../../types/classes/GuildPrtl.class';
import { News } from '../../../types/classes/NewYorkTime.class';
import { Field, ReturnPormise } from '../../../types/interfaces/InterfacesPrtl.interface';

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const category = NYTCategories.find(c => c === args[0]);
		let count = 4;

		if (args.length === 1) {
			if (!category) {
				return resolve({
					result: false,
					value: message_help('commands', 'news', `${args[0]} is not a news category`)
				});
			}
		} else if (args.length === 2) {
			if (!category) {
				return resolve({
					result: false,
					value: message_help('commands', 'news', `${args[0]} is not a news category`)
				});
			} else {
				count = +args[1];
				if (isNaN(count)) {
					return resolve({
						result: false,
						value: message_help('commands', 'news', `${args[1]} is not a number`)
					});
				}
				if (count > 15) {
					return resolve({
						result: false,
						value: message_help('commands', 'news', `can display up to 15 articles`)
					});
				}
				--count;
			}
		} else {
			return resolve({
				result: false,
				value: message_help('commands', 'news')
			});
		}

		const options: RequestOptions = {
			'method': 'GET',
			'hostname': `api.nytimes.com`,
			'port': undefined,
			'path': `/svc/topstories/v2/${category}.json?api-key=${config.api_keys.new_york_times}`,
			'headers': {
				'x-api-host': 'api.nytimes.com',
				// 'api-key': config.api_keys.new_york_times,
				"Accept": "application/json",
				'useQueryString': 1
			}
		};

		https_fetch(options)
			.then((response: Buffer) => {
				const json = getJSON(response.toString().substring(response.toString().indexOf('{')));

				if (json === null) {
					return resolve({
						result: false,
						value: message_help('commands', 'news', 'data from source was corrupted')
					});
				}

				if (json.status !== 'OK') {
					return resolve({
						result: false,
						value: message_help('commands', 'news', 'NYTimes replied with an error')
					});
				}

				const news: News = json;

				const top_news: Field[] = [];

				news.results.some((n, i) => {
					top_news.push(<Field>{
						emote: `${n.title}`,
						role: `_[${max_string(n.abstract, 256)}](${n.url})_`,
						inline: false
					});

					return i === count;
				});

				message.channel.send(
					create_rich_embed(
						`News ${args[0]} | ${moment(json.last_updated).format('DD/MM/YY hh:mm')}`,
						'powered by NYTimes',
						'#000000',
						top_news,
						null,
						null,
						true,
						null,
						null
					));

				return resolve({
					result: true,
					value: message_help('commands', 'news', '')
				});

			})
			.catch((error: any) => {
				return resolve({
					result: false,
					value: message_help('commands', 'news', `could not access the server\nerror: ${error}`)
				});
			});
	});
};
