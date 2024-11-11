import { SlashCommandBuilder } from "@discordjs/builders";
import "@std/dotenv/load";
import dayjs from "npm:dayjs";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
} from "npm:discord.js";
import voca from "npm:voca";

import { CountryCodes } from "../../assets/lists/countryCodesISO.static.ts";
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

const COMMAND_NAME = "corona";
const DESCRIPTION = "returns data on COVID19";

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
      option.setName("country").setDescription(
        "The country you want to get corona data for",
      ).setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    if (!Deno.env.get("COVID_193")) {
      return {
        result: false,
        value: "COVID_193 API key is not set up",
      };
    }

    let code: string | null = null;
    const country = interaction.options.getString("country");

    if (!country) {
      return {
        result: false,
        value: messageHelp("commands", "corona", "country must be provided"),
      };
    }

    code = getCountryCode(country);

    if (!code) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "corona",
          `could not fetch code for country ${country}`,
        ),
      };
    }

    const url = new URL("https://covid-193.p.rapidapi.com/statistics");

    const response = await httpsFetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "covid-193.p.rapidapi.com",
        "x-rapidapi-key": Deno.env.get("COVID_193") || "",
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

    if (json.message === "You are not subscribed to this API.") {
      return {
        result: false,
        value: json.message,
      };
    }

    if (!json) {
      return {
        result: false,
        value: "data from source was corrupted",
      };
    }

    if (json.errors && json.errors.length !== 0) {
      return {
        result: false,
        value: "source responded with errors",
      };
    }

    if (!json.response) {
      return {
        result: false,
        value: "source responded without data",
      };
    }

    const countryData = json.response.find((data: { country: string }) =>
      data.country === code
    );

    if (!countryData) {
      return {
        result: false,
        value: `${country} is neither a country name nor code`,
      };
    }

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          `${countryData.country} | ${
            dayjs(countryData.time).format("DD/MM/YY")
          }`,
          "Covid19 stats by covid-193",
          "#FF0000",
          [
            {
              emote: "NEW cases",
              role: `${countryData.cases.new ? countryData.cases.new : "N/A"}`,
              inline: true,
            },
            {
              emote: "NEW deaths",
              role: `${
                countryData.deaths.new ? countryData.deaths.new : "N/A"
              }`,
              inline: true,
            },
            {
              emote: "Tests P1M",
              role: `${countryData.tests["1M_pop"]}`,
              inline: true,
            },
            {
              emote: "Cases",
              role: `${countryData.cases.total}`,
              inline: true,
            },
            {
              emote: "Deaths",
              role: `${countryData.deaths.total}`,
              inline: true,
            },
            {
              emote: "Recovered",
              role: `${countryData.cases.recovered}`,
              inline: true,
            },
            {
              emote: "%Recovered",
              role: `${
                ((countryData.cases.recovered / countryData.cases.total) * 100)
                  .toFixed(2)
              }%`,
              inline: true,
            },
            {
              emote: "%Diseased",
              role: `${
                ((countryData.deaths.total / countryData.cases.total) * 100)
                  .toFixed(2)
              }%`,
              inline: true,
            },
            {
              emote: "Critical",
              role: `${countryData.cases.critical}`,
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
      result: false,
      value: outcome ? "" : "failed to send message",
    };
  },
} as Command;

const countryCodes: { name: string; code: string }[] = CountryCodes;

const getCountryCode = function (country: string): string | null {
  for (let i = 0; i < countryCodes.length; i++) {
    if (voca.lowerCase(countryCodes[i].name) === voca.lowerCase(country)) {
      return countryCodes[i].name;
    } else if (
      voca.lowerCase(countryCodes[i].code) === voca.lowerCase(country)
    ) return countryCodes[i].name;
  }

  return null;
};
