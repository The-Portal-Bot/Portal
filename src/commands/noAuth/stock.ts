import { SlashCommandBuilder } from "@discordjs/builders";
import dayjs from "npm:dayjs";
import type { ChatInputCommandInteraction } from "npm:discord.js";
import type { RequestOptions } from "node:https";
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
// import { CountryCodes } from '../../data/lists/countryCodesISO.static.ts';

// const country_codes: { name: string; code: string; }[] = CountryCodes;

// const get_country_code = function (country: string): string | null {
//     for (let i = 0; i < country_codes.length; i++) {
//         if (voca.lowerCase(country_codes[i].name) === voca.lowerCase(country))
//             return country_codes[i].name;
//         else if (voca.lowerCase(country_codes[i].code) === voca.lowerCase(country))
//             return country_codes[i].name;
//     }
//     return null;
// };

const COMMAND_NAME = "stock";
const DESCRIPTION = "returns data on stocks";

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
      option.setName("stock").setDescription("Stock you want to get data for")
        .setRequired(true)
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    if (!Deno.env.get("YAHOO_FINANCE")) {
      return {
        result: false,
        value: "YAHOO_FINANCE API key is not set up",
      };
    }

    const stock = interaction.options.getString("stock");

    if (!stock) {
      return {
        result: false,
        value: messageHelp("commands", "stock"),
      };
    }

    const options: RequestOptions = {
      method: "GET",
      hostname: "yahoo-finance-low-latency.p.rapidapi.com",
      port: undefined,
      path: `/v8/finance/chart/${stock}?events=div%2Csplit`,
      headers: {
        "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
        "x-rapidapi-key": Deno.env.get("YAHOO_FINANCE"),
        useQueryString: 1,
      },
    };

    const response = await httpsFetch(options);

    if (!response) {
      return {
        result: false,
        value: "could not access the server",
      };
    }

    const json = getJSONFromString(
      response.toString().substring(response.toString().indexOf("{")),
    );
    if (json === null) {
      return {
        result: false,
        value: "data from source was corrupted",
      };
    }

    const chart = json.chart;

    if (chart === null) {
      return {
        result: false,
        value: "could not find any stock",
      };
    }

    const result = chart.result;

    if (result === null) {
      return {
        result: false,
        value: "there were no results",
      };
    }

    const meta = result[0];

    if (meta === null) {
      return {
        result: false,
        value: "there were no meta data",
      };
    }

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          `STOCK ${meta.symbol} (${meta.regularMarketPrice}) - ${
            dayjs().format("DD/MM/YY")
          }`,
          "powered by yahoo finance",
          "#FF0000",
          [],
          // [
          //     {
          //         emote: `${voca.titleCase(crypto_name)} to ${voca.titleCase(currnc_name)} price`,
          //         role: `${json[crypto_name][currnc_name]}`,
          //         inline: false
          //     }
          // ],
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
