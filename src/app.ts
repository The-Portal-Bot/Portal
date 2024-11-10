import { REST } from "@discordjs/rest";
import "@std/dotenv/load";
import { Routes } from "discord-api-types/v9";
import { transports } from "npm:winston";

import * as auth from "./commands/auth/index.ts";
import * as noAuth from "./commands/noAuth/index.ts";
import { clientHandler, connectToDiscord } from "./handlers/discord.handler.ts";
import { eventHandler } from "./handlers/event.handler.ts";
import { mongoHandler } from "./handlers/mongo.handler.ts";
import type { ActiveCooldowns } from "./types/classes/PTypes.interface.ts";
import logger from "./utilities/log.utility.ts";

(async () => {
  const LOG = Deno.env.get("LOG") === "true";

  if (LOG) {
    logger.add(
      new transports.File({
        filename: "/logs/portal-error.log.json",
        level: "error",
      }),
    );
    logger.add(
      new transports.File({
        filename: "/logs/portal-info.log.json",
        level: "info",
        silent: true,
      }),
    );
    logger.add(
      new transports.File({
        filename: "/logs/portal-all.log.json",
        silent: true,
      }),
    );
  }

  const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN");
  if (!DISCORD_TOKEN) {
    logger.error("Discord token is not defined");
    Deno.exit(1);
  }

  const MONGO_URL = Deno.env.get("MONGO_URL");
  if (!MONGO_URL) {
    logger.error("mongo url is not defined");
    Deno.exit(2);
  }

  const CLIENT_ID = Deno.env.get("CLIENT_ID");
  if (!CLIENT_ID) {
    logger.error("Discord client id is not defined");
    Deno.exit(4);
  }

  try {
    logger.info("started refreshing application slash commands");
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [...Object.values(auth), ...Object.values(noAuth)].map((command) =>
        command.slashCommand.toJSON()
      ),
    });

    logger.info("successfully reloaded application slash commands");
  } catch (error) {
    logger.error(error);
  }

  const mongo = await mongoHandler(MONGO_URL);

  if (!mongo) {
    logger.error("failed to connect to database");
    Deno.exit(2);
  }

  logger.info("connected to database");

  const active_cooldowns: ActiveCooldowns = { guild: [], member: [] };
  // const spam_cache: SpamCache[] = [];

  const client = clientHandler();
  await eventHandler(client, active_cooldowns);

  const discord = await connectToDiscord(client, DISCORD_TOKEN);

  if (!discord) {
    logger.error("failed to connect to discord");
    Deno.exit(1);
  }

  logger.info("portal bot is running");
})();
