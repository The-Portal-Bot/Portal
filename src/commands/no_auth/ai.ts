import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { Configuration, OpenAIApi } from "openai";
import { createEmbed, messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('returns a response to you question'),
    async execute(
        message: Message, args: string[]
    ): Promise<ReturnPromise> {
        return new Promise(async (resolve) => {
            if (process.env.OPENAI_API_KEY) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'ai', `there is no openai API key`)
                });
            }
            if (args.length < 1) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'ai', `you should right at least one word`)
                });
            }

            const model = "text-davinci-002";
            const configuration = new Configuration({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const openai = new OpenAIApi(configuration);
            let response: any = undefined;

            try {
                response = await openai.createCompletion({
                    model: "text-davinci-002",
                    prompt: args.join(' '),
                    temperature: 0,
                    max_tokens: 100,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stop: ["\n"],
                });
            } catch (e) {
                return resolve({
                    result: false,
                    value: `failed to get response: ${e}`
                });
            }

            message.channel
                .send({
                    embeds: [
                        createEmbed(
                            `model: ${model}`,
                            'Ai by OpenAi',
                            '#FF0000',
                            [
                                {
                                    emote: 'data',
                                    role: response.data,
                                    inline: false
                                },
                                {
                                    emote: 'status',
                                    role: response.status,
                                    inline: false
                                },
                                {
                                    emote: 'statusText',
                                    role: response.statusText,
                                    inline: false
                                },
                                {
                                    emote: 'headers',
                                    role: response.headers,
                                    inline: false
                                },
                                {
                                    emote: 'config',
                                    role: response.config,
                                    inline: false
                                },
                                {
                                    emote: 'request',
                                    role: response.request,
                                    inline: false
                                },
                            ],
                            null,
                            null,
                            true,
                            null,
                            null
                        )
                    ]
                })
                .catch((e: any) => {
                    return resolve({
                        result: false,
                        value: `failed to send message: ${e}`
                    });
                });

            return resolve({
                result: true,
                value: ''
            });
        });
    }
};
