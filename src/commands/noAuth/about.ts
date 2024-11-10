import { SlashCommandBuilder } from "@discordjs/builders";
import { createEmbed } from "../../libraries/help.library.ts";
import type { Command } from "../../types/Command.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import process from "node:process";

const COMMAND_NAME = "about";
const DESCRIPTION = "returns information on Portal";

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder().setName(COMMAND_NAME).setDescription(
    DESCRIPTION,
  ),
  async execute(): Promise<ReturnPromise> {
    const aboutMessage = [
      createEmbed(
        "About",
        "A fully fledged and feature rich bot for Discord",
        "#1DB954",
        [
          {
            emote: "Website",
            role: "[portal-bot.xyz](https://portal-bot.xyz)",
            inline: true,
          },
          {
            emote: "Creator",
            role: "[Keybraker](https://github.com/keybraker/Portal)",
            inline: true,
          },
          {
            emote: "Version",
            role:
              `[${process.env.VERSION}](https://portal-bot.xyz/blog/${process.env.VERSION})`,
            inline: true,
          },
          {
            emote: "Official Server",
            role: "[Portal Official](https://discord.gg/WrMUzJYyzJ)",
            inline: true,
          },
          {
            emote: "Github",
            role: "[keybraker/Portal](https://www.github.com/keybraker/Portal)",
            inline: true,
          },
          {
            emote: "Upvote",
            role:
              "[Top.gg](https://top.gg/bot/704400876860735569) | [Bot.gg](https://discord.bots.gg/bots/704400876860735569)",
            inline: true,
          },
        ],
        null,
        null,
        true,
        null,
        null,
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
} as Command;
