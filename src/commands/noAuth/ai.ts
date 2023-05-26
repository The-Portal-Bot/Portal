import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { createEmbed, messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('ai').setDescription('returns a response to you question'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    if (process.env.OPEN_AI_API_KEY) {
      return {
        result: false,
        value: messageHelp('commands', 'ai', `there is no OpenAi API key`),
      };
    }

    if (args.length < 1) {
      return {
        result: false,
        value: messageHelp('commands', 'ai', `you should right at least one word`),
      };
    }

    const configuration = new Configuration({
      apiKey: process.env.OPEN_AI_API_KEY,
    });
    const openAI = new OpenAIApi(configuration);
    const model = 'text-davinci-002';

    let response = undefined;
    try {
      response = await openAI.createCompletion({
        model: 'text-davinci-002',
        prompt: args.join(' '),
        temperature: 0,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ['\n'],
      });
    } catch (e) {
      return {
        result: false,
        value: `failed to get OpenAi response`,
      };
      // log error
    }

    const messageOptions = {
      embeds: [
        createEmbed(
          `model: ${model}`,
          'Ai by OpenAi',
          '#FF0000',
          [
            {
              emote: 'data',
              role: response.data,
              inline: false,
            },
            {
              emote: 'status',
              role: response.status,
              inline: false,
            },
            {
              emote: 'statusText',
              role: response.statusText,
              inline: false,
            },
            {
              emote: 'headers',
              role: response.headers,
              inline: false,
            },
            {
              emote: 'config',
              role: response.config,
              inline: false,
            },
            {
              emote: 'request',
              role: response.request,
              inline: false,
            },
          ],
          null,
          null,
          true,
          null,
          null
        ),
      ],
    };

    try {
      interaction.channel?.send(messageOptions);
    } catch (e) {
      return {
        result: false,
        value: `failed to send message`,
      };
      // log error
    }

    return {
      result: true,
      value: '',
    };
  },
};
