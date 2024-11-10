import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
} from "npm:discord.js";
import type { RequestOptions } from "node:https";
import voca from "npm:voca";
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
import "@std/dotenv/load";

const COMMAND_NAME = "crypto";
const DESCRIPTION = "returns information about crypto currencies";

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
      option.setName("crypto_name").setDescription(
        "The `name of the crypto currency`",
      ).setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("currency_name").setDescription(
        "The name of the fiat currency to compare to",
      ).setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    if (!Deno.env.get("COIN_GECKO")) {
      return {
        result: false,
        value: "COIN_GECKO API key is not set up",
      };
    }

    const cryptoName = interaction.options.getString("crypto_name");
    const currencyName = interaction.options.getString("currency_name");

    if (!cryptoName || !currencyName) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "crypto",
          "crypto and fiat name must be provided",
        ),
      };
    }

    const url = new URL("https://coingecko.p.rapidapi.com/simple/price");
    url.searchParams.append("ids", cryptoName);
    url.searchParams.append("vs_currencies", currencyName);

    const response = await httpsFetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coingecko.p.rapidapi.com",
        "x-rapidapi-key": Deno.env.get("COIN_GECKO") || "",
        "Accept": "application/json",
      },
    });

    if (!response) {
      return {
        result: false,
        value: "could not fetch data from source",
      };
    }

    const json = getJSONFromString(
      response.toString().substring(response.toString().indexOf("{")),
    );

    if (!json) {
      return {
        result: false,
        value: "data from source was corrupted",
      };
    }

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          null,
          null,
          "#FFE600",
          null,
          null,
          null,
          false,
          null,
          null,
          undefined,
          {
            name: `${voca.titleCase(cryptoName)} to ${
              voca.titleCase(currencyName)
            } price is ${json[cryptoName][currencyName]}`,
            icon:
              "https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/coin.gif",
          },
        ),
      ],
    });

    return {
      result: !!outcome,
      value: outcome ? "" : "failed to send message",
    };
  },
} as Command;
