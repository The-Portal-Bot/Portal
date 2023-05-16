import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { RequestOptions } from 'https';
import voca from 'voca';
import { createEmbed, getJsonFromString, messageHelp } from '../../libraries/help.library';
import { https_fetch } from '../../libraries/http.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('returns information about crypto currencies'),
    async execute(
        message: Message, args: string[]
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            if (args.length === 0) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'crypto', 'must add currency to search')
                });
            } else if (args.length > 3) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'crypto')
                });
            }

            const crypto_name = args.join(' ').substr(0, args.join(' ').indexOf('|')).replace(/\s/g, ' ').trim();
            const currnc_name = args.join(' ').substr(args.join(' ').indexOf('|') + 1).replace(/\s/g, ' ').trim();

            if (crypto_name === '') {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'crypto', 'you must give an authority currency like usd')
                });
            }

            const options: RequestOptions = {
                'method': 'GET',
                'hostname': 'coingecko.p.rapidapi.com',
                'port': undefined,
                'path': `/simple/price?ids=${crypto_name}&vs_currencies=${currnc_name}`,
                'headers': {
                    'x-rapidapi-host': 'coingecko.p.rapidapi.com',
                    'x-rapidapi-key': process.env.COINGECKO,
                    'useQueryString': 1
                }
            };

            https_fetch(options)
                .then((response: Buffer) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const json = getJsonFromString(response.toString().substring(response.toString().indexOf('{')));

                    if (!json) {
                        return resolve({
                            result: false,
                            value: 'data from source was corrupted'
                        });
                    }

                    message.channel
                        .send({
                            embeds: [
                                createEmbed(
                                    null,
                                    null,
                                    '#FFE600',
                                    null,
                                    null,
                                    null,
                                    false,
                                    null,
                                    null,
                                    undefined,
                                    {
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                        name: `${voca.titleCase(crypto_name)} to ${voca.titleCase(currnc_name)} price is ${json[crypto_name][currnc_name]}`,
                                        icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/coin.gif'
                                    }
                                )
                            ]
                        })
                        .then(() => {
                            return resolve({
                                result: true,
                                value: ''
                            });
                        })
                        .catch((e: any) => {
                            return resolve({
                                result: false,
                                value: `failed to send message: ${e}`
                            });
                        });
                })
                .catch((e: any) => {
                    return resolve({
                        result: false,
                        value: `crypto-currency or fiat-currency does not exist`
                    });
                });
        });
    }
};
