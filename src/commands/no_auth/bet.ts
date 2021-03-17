import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import { OpapGameIdEnum } from '../../data/enums/OpapGames.enum';
import { create_rich_embed, getJSON, get_key_from_enum, message_help } from '../../libraries/help.library';
import { https_fetch } from '../../libraries/http.library';
import { GuildPrtl } from '../../types/classes/GuildPrtl.class';
import { ReturnPormise } from '../../types/classes/TypesPrtl.interface';

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		let game_code: number | undefined = undefined;

		if (args.length === 2) {
			if (args[0].toLocaleLowerCase() !== 'opap') {
				return resolve({
					result: false,
					value: message_help('commands', 'bet', `${args[0]} is not a provider`)
				});
			} else {
				if (isNaN(+args[1])) {
					game_code = <number>get_key_from_enum(args[1], OpapGameIdEnum);
				}

				if (!game_code) {
					return resolve({
						result: false,
						value: message_help('commands', 'bet', `${args[1]} does not exist in ${args[0]}`)
					});
				}
			}
		} else {
			return resolve({
				result: false,
				value: message_help('commands', 'bet', '')
			});
		}

		const options: RequestOptions = {
			'method': 'GET',
			'hostname': `api.opap.gr`,
			'port': undefined,
			'path': `/draws/v3.0/${game_code}/last-result-and-active`,
			'headers': {
				'x-opap-host': 'api.opap.gr',
				'useQueryString': 1
			}
		};

		https_fetch(options)
			.then((response: Buffer) => {
				const json = getJSON(response.toString().substring(response.toString().indexOf('{')));

				if (json === null) {
					return resolve({
						result: false,
						value: message_help('commands', 'bet', 'data from source was corrupted')
					});
				}

				const last = json.last;

				message.channel.send(
					create_rich_embed(
						`${args[1]} from ${args[0]} | ${moment(last.drawTime).format('DD/MM/YY')}`,
						`powered by ${args[0]}`,
						'#0384fc',
						[
							{
								emote: 'Winning Numbers',
								role: `${last.winningNumbers.list.map((n: number) => n).join(', ')}`,
								inline: true
							},
							{
								emote: 'Tzoker',
								role: `${last.winningNumbers.bonus}`,
								inline: true
							},
							{
								emote: `${(last.prizeCategories[0].winners > 1) ? 'Winners' : 'Winner'}`,
								role: `${last.prizeCategories[0].winners}`,
								inline: true
							},
							{
								emote: 'Draw Number',
								role: `${last.drawId}`,
								inline: true
							},
							{
								emote: 'Columns Cast',
								role: `${last.wagerStatistics.columns}`,
								inline: true
							},
							{
								emote: 'Wagers',
								role: `${last.wagerStatistics.wagers}`,
								inline: true
							}
						],
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
					value: message_help('commands', 'bet', `could not access the server\nerror: ${error}`)
				});
			});
	});
};
