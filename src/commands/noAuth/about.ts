import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { createEmbed } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('about').setDescription('returns about Portal information'),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const outcome = await interaction.channel?.send({ embeds });

    return {
      result: true,
      value: outcome ? '' : `failed to send about message`,
    };
  },
};

const embeds = [
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
