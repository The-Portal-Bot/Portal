import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import config from '../../../config.json';
import { NYTCategories } from '../../../data/lists/profane_words.static copy';
import { create_rich_embed, getJSON, max256 } from '../../../libraries/help.library';
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
					value: `${args[0]} is not a news category, you can run \`./help news\` for help`
				});
			}
		} else if (args.length === 2) {
			if (!category) {
				return resolve({
					result: false,
					value: `${args[0]} is not a news category, you can run \`./help news\` for help`
				});
			} else {
				count = +args[1];
				if (isNaN(count)) {
					return resolve({
						result: false,
						value: `${args[1]} is not a number, you can run \`./help news\` for help`
					});
				}
				if (count > 15) {
					return resolve({
						result: false,
						value: `can display up to 15 articles, you can run \`./help news\` for help`
					});
				}
				--count;
			}
		} else {
			return resolve({
				result: false,
				value: 'you can run `./help news` for help'
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
						value: 'data from source was corrupted'
					});
				}

				if (json.status !== 'OK') {
					return resolve({
						result: false,
						value: 'NYTimes replied with an error'
					});
				}

				const news: News = json;

				const top_news: Field[] = [];

				news.results.some((n, i) => {
					top_news.push(<Field>{
						emote: `${n.title}`,
						role: `_[${max256(n.abstract)}](${n.url})_`,
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
					value: ''
				});

			})
			.catch((error: any) => {
				return resolve({
					result: false,
					value: `could not access the server\nerror: ${error}`
				});
			});
	});
};
