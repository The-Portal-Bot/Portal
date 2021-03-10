import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import moment from 'moment';
import { create_rich_embed, getJSON } from '../../../libraries/help.library';
import { https_fetch } from '../../../libraries/http.library';
import { GuildPrtl } from '../../../types/classes/GuildPrtl.class';
import { GameIds } from '../../../types/enums/OpapGames.enum';
import { ReturnPormise } from '../../../types/interfaces/InterfacesPrtl.interface';

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		let game_id = 0;

		if (args.length === 2) {
			if (args[0] !== 'opap') {
				return resolve({
					result: false,
					value: `${args[0]} does not exist, you can run \`./help bet\` for help`
				});
			} else {
				const game = GameIds.find(g => 
					g.name.toLowerCase() === args[1].toLowerCase())
				
					if (!game) {
					return resolve({
						result: false,
						value: `${args[1]} does not exist in ${args[0]}, you can run \`./help bet\` for help`
					});
				}
				game_id = game.id;
			}
		} else {
			return resolve({
				result: false,
				value: 'you can run `./help bet` for help'
			});
		}

		const options: RequestOptions = {
			'method': 'GET',
			'hostname': `api.opap.gr`,
			'port': undefined,
			'path': `/draws/v3.0/${game_id}/last-result-and-active`,
			'headers': {
				'x-rapidapi-host': 'api.opap.gr',
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

				const last = json.last;

				message.channel.send(
					create_rich_embed(
						`${args[1]} from ${args[0]} | ${moment(last.drawTime).format('DD/MM/YY')}`,
						'powered by opap',
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
					value: `could not access the server\nerror: ${error}`
				});
			});
	});
};
