import { SlashCommandBuilder } from '@discordjs/builders';
import { commandDescriptionByNameAndAuthenticationLevel, createEmbed } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'about';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, false)),
  async execute(): Promise<ReturnPromise> {
    const aboutMessage = [
      createEmbed(
        'About',
        'A fully fledged and feature rich bot for Discord',
        '#1DB954',
        [
          {
            emote: 'Website',
            role: '[portal-bot.xyz](https://portal-bot.xyz)',
            inline: true,
          },
          {
            emote: 'Creator',
            role: '[Keybraker](https://github.com/keybraker/Portal)',
            inline: true,
          },
          {
            emote: 'Version',
            role: `[${process.env.VERSION}](https://portal-bot.xyz/blog/${process.env.VERSION})`,
            inline: true,
          },
          {
            emote: 'Official Server',
            role: '[Portal Official](https://discord.gg/WrMUzJYyzJ)',
            inline: true,
          },
          {
            emote: 'Github',
            role: '[keybraker/Portal](https://www.github.com/keybraker/Portal)',
            inline: true,
          },
          {
            emote: 'Upvote',
            role: '[Top.gg](https://top.gg/bot/704400876860735569) | [Bot.gg](https://discord.bots.gg/bots/704400876860735569)',
            inline: true,
          },
        ],
        null,
        null,
        true,
        null,
        null
        // undefined,
        // undefined,
        // 'since 2020'
      ),
    ];

    return {
      result: true,
      value: aboutMessage,
    };
  },
};
