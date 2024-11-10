import { SlashCommandBuilder } from "@discordjs/builders";
import dayjs from "npm:dayjs";
import type { ChatInputCommandInteraction } from "npm:discord.js";

import {
  createEmbed,
  getJSONFromString,
  messageHelp,
} from "../../libraries/help.library.ts";
import { httpsFetch } from "../../libraries/http.library.ts";
import type { Command } from "../../types/Command.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import logger from "../../utilities/log.utility.ts";

const COMMAND_NAME = "bet";
const DESCRIPTION = "returns betting data";

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption((option) =>
      option
        .setName("provider")
        .setDescription("betting provider")
        .setRequired(true)
        .addChoices({ name: "OPAP", value: "opap" })
    )
    .addNumberOption((option) =>
      option
        .setName("game")
        .setDescription("betting game")
        .setRequired(true)
        .addChoices(
          { name: "KINO", value: 1100 },
          { name: "PowerSpin", value: 1110 },
          { name: "Super3", value: 2100 },
          { name: "PROTO", value: 2101 },
          { name: "LOTTO", value: 5103 },
          { name: "Tzoker", value: 5104 },
          { name: "extra5", value: 5106 },
        )
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    const provider = interaction.options.getString("provider");
    const gameCode = interaction.options.getNumber("game");

    if (!provider) {
      return {
        result: false,
        value: messageHelp("commands", "bet", "provider must be provided"),
      };
    }

    if (!gameCode) {
      return {
        result: false,
        value: messageHelp("commands", "bet", "gameCode must be provided"),
      };
    }

    const url = new URL(
      `https://api.opap.gr/draws/v3.0/${gameCode}/last-result-and-active`,
    );

    const response = await httpsFetch(url, {
      method: "GET",
      headers: {
        "x-opap-host": "api.opap.gr",
        useQueryString: "1",
      },
    });

    const json = await response.json();

    if (!json) {
      return {
        result: false,
        value: "could not parse data from OpenAPI",
      };
    }

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          `${gameCode} from ${provider} | ${
            dayjs(json.last.drawTime).format("DD/MM/YY")
          }`,
          `powered by ${provider}`,
          "#0384fc",
          [
            {
              emote: "Winning Numbers",
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              role: `${
                json.last.winningNumbers.list.map((n: number) => n).join(", ")
              }`,
              inline: true,
            },
            {
              emote: "Tzoker",
              role: `${json.last.winningNumbers.bonus}`,
              inline: true,
            },
            {
              emote: `${
                json.last.prizeCategories[0].winners > 1 ? "Winners" : "Winner"
              }`,
              role: `${json.last.prizeCategories[0].winners}`,
              inline: true,
            },
            {
              emote: "Draw Number",
              role: `${json.last.drawId}`,
              inline: true,
            },
            {
              emote: "Columns Cast",
              role: `${json.last.wagerStatistics.columns}`,
              inline: true,
            },
            {
              emote: "Wagers",
              role: `${json.last.wagerStatistics.wagers}`,
              inline: true,
            },
          ],
          null,
          null,
          true,
          null,
          null,
        ),
      ],
    });

    return {
      result: !!outcome,
      value: outcome ? "" : "failed to send message",
    };
  },
} as Command;
