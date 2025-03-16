import { SlashCommandBuilder } from "@discordjs/builders";
import "@std/dotenv/load";
import dayjs from "npm:dayjs";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
} from "npm:discord.js";

import {
  createEmbed,
  getJSONFromString,
  messageHelp,
} from "../../libraries/help.library.ts";
import { httpsFetch } from "../../libraries/http.library.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import type { Command } from "../../types/Command.ts";

const COMMAND_NAME = "weather";
const DESCRIPTION = "returns weather data";

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
        "The country you want to get weather data for",
      ).setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    if (!Deno.env.get("OPEN_WEATHER_MAP")) {
      return {
        result: false,
        value: "OPEN_WEATHER_MAP API key is not set up",
      };
    }

    const country = interaction.options.getString("country");

    if (!country) {
      return {
        result: false,
        value: messageHelp("commands", "weather"),
      };
    }

    const url = new URL(`https://api.openweathermap.org/data/2.5/weather`);

    const location = country.split(" ").join("%2C%20");
    url.searchParams.append("q", location);
    url.searchParams.append("appid", Deno.env.get("OPEN_WEATHER_MAP") || "");

    const response = await httpsFetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

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

    if (json.cod === "404") {
      return {
        result: false,
        value: messageHelp("commands", "weather", "city not found"),
      };
    }

    if (json.cod !== 200) {
      return {
        result: false,
        value: `could not access the server / ${json.cod}`,
      };
    }

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          `${json.name}, ${json.sys.country} at ${dayjs().format("DD/MM/YY")}`,
          "powered by OpenWeatherMap",
          "#BFEFFF",
          [
            {
              emote: "Temperature",
              role: `${kelvinToCelsius(json.main.temp)}°C / ${
                kelvinToFahrenheit(json.main.temp)
              }°F`,
              inline: true,
            },
            {
              emote: "Feels like",
              role: `${kelvinToCelsius(json.main.feels_like)}°C / ${
                kelvinToFahrenheit(json.main.feels_like)
              }°F`,
              inline: true,
            },
            {
              emote: null,
              role: null,
              inline: false,
            },
            {
              emote: "Humidity",
              role: `${json.main.humidity}`,
              inline: true,
            },
            {
              emote: "Wind Speed",
              role: `${msToKs(json.wind.speed)}kmh / ${
                msToMlh(json.wind.speed)
              }mlh`,
              inline: true,
            },
            {
              emote: "Cloudiness",
              role: `${json.clouds.all}%`,
              inline: true,
            },
            {
              emote: "Condition",
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              role: `${
                json.weather
                  .map((weather: { main: string; description: string }) => {
                    return `${weather.main} (${weather.description})`;
                  })
                  .join(", ")
              }`,
              inline: false,
            },
          ],
          `http://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`,
          null,
          true,
          null,
          null,
        ),
      ],
    });

    return {
      result: !!outcome,
      value: outcome ? `${json.name} weather` : "failed to send message",
    };
  },
} as unknown as Command;

function kelvinToCelsius(kelvin: number): number {
  return Math.round(kelvin - 273.15);
}

function kelvinToFahrenheit(kelvin: number): number {
  return Math.round((kelvin - 273.15) * (9 / 5) + 32);
}

function msToKs(ms: number): number {
  return Math.round(ms * 3.6);
}

function msToMlh(ms: number): number {
  return Math.round(ms * 2.237);
}
