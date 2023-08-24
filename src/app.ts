import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { transports } from 'winston';
import * as auth from './commands/auth';
import * as noAuth from './commands/noAuth';
import { clientHandler, connectToDiscord } from './handlers/discord.handler';
import { eventHandler } from './handlers/event.handler';
import { mongoHandler } from './handlers/mongo.handler';
import { logger } from './libraries/help.library';
import { ActiveCooldowns } from './types/classes/PTypes.interface';

dotenv.config();

if (process.env.DEBUG) {
  logger.add(new transports.Console());
}

if (!process.env.MONGO_URL) {
  logger.error(new Error('mongo url is not defined'));
  process.exit(3);
}

if (!process.env.TOKEN) {
  logger.error(new Error('Discord token is not defined'));
  process.exit(4);
}

if (process.env.LOG) {
  logger.add(new transports.File({ filename: '/logs/portal-error.log.json', level: 'error' }));
  logger.add(new transports.File({ filename: '/logs/portal-info.log.json', level: 'info' }));
  logger.add(new transports.File({ filename: '/logs/portal-all.log.json' }));
}

const active_cooldowns: ActiveCooldowns = { guild: [], member: [] };
// const spam_cache: SpamCache[] = [];
const client: Client = clientHandler();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    logger.info('Started refreshing application (/) commands.');

    if (!process.env.CLIENT_ID) {
      logger.error(new Error('Discord client id is not defined'));
      process.exit(4);
    }

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body:  [
          ...Object.values(auth),
          ...Object.values(noAuth),
        ].map(command => command.data.toJSON())
      }
    );

    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error(error);
  }
})();

eventHandler(client, active_cooldowns);

const mongo = mongoHandler(process.env.MONGO_URL);
const discord = connectToDiscord(client, process.env.TOKEN);

Promise.all([mongo, discord])
  .then(() => {
    logger.info('ready');
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
