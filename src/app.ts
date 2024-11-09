import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "npm:dotenv";
import { transports } from "npm:winston";

import * as auth from "./commands/auth/index.ts";
import * as noAuth from "./commands/noAuth/index.ts";
import { clientHandler, connectToDiscord } from "./handlers/discord.handler.ts";
import { eventHandler } from "./handlers/event.handler.ts";
import { mongoHandler } from "./handlers/mongo.handler.ts";
import type { ActiveCooldowns } from "./types/classes/PTypes.interface.ts";
import logger from "./utilities/log.utility.ts";
import process from "node:process";

dotenv.config();

(async () => {
  if (process.env.LOG) {
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

  if (!process.env.TOKEN) {
    logger.error("Discord token is not defined");
    process.exit(1);
  }

  if (!process.env.MONGO_URL) {
    logger.error("mongo url is not defined");
    process.exit(2);
  }

  if (!process.env.CLIENT_ID) {
    logger.error("Discord client id is not defined");
    process.exit(4);
  }

  try {
    logger.info("started refreshing application slash commands");
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [...Object.values(auth), ...Object.values(noAuth)].map((command) =>
        command.slashCommand.toJSON()
      ),
    });

    logger.info("successfully reloaded application slash commands");
  } catch (error) {
    logger.error(error);
  }

  const mongo = await mongoHandler(process.env.MONGO_URL);

  if (!mongo) {
    logger.error("failed to connect to database");
    process.exit(2);
  }

  logger.info("connected to database");

  const active_cooldowns: ActiveCooldowns = { guild: [], member: [] };
  // const spam_cache: SpamCache[] = [];

  const client = clientHandler();
  await eventHandler(client, active_cooldowns);

  const discord = await connectToDiscord(client, process.env.TOKEN);

  if (!discord) {
    logger.error("failed to connect to discord");
    process.exit(1);
  }

  logger.info("portal bot is running");
})();
