import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { transports } from "winston";
import commandConfig from "./config.command.json";
import { clientHandler, connectToDiscord } from "./handlers/discord.handler";
import { eventHandler } from "./handlers/event.handler";
import { mongoHandler } from "./handlers/mongo.handler";
import { logger } from './libraries/help.library';
import { ActiveCooldowns, SpamCache } from "./types/classes/TypesPrtl.interface";

dotenv.config();

if (process.env.DEBUG) {
    logger.add(new transports.Console());
}

if (!process.env.MONGO_URL) {
    logger.error(new Error('No mongo url has been given'));
    process.exit(3);
}

if (!process.env.TOKEN) {
    logger.error(new Error('No token has been given'));
    process.exit(4);
}

if (process.env.LOG) {
    logger.add(new transports.File({ filename: '/logs/portal-error.log.json', level: 'error' }));
    logger.add(new transports.File({ filename: '/logs/portal-info.log.json', level: 'info' }));
    logger.add(new transports.File({ filename: '/logs/portal-all.log.json' }));
}

const active_cooldowns: ActiveCooldowns = { guild: [], member: [] };
const spam_cache: SpamCache[] = [];
const client: Client = clientHandler();

//
const commands: any[] = [];
commandConfig.forEach(category => {
    category.commands.forEach(async command => {
        const commandFile = require(`./commands/${category.path}/${command.name}.js`);
        commands.push(commandFile.data.toJSON());
    });
});

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands('755825870102593626', '710746690650374208'),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
//

eventHandler(client);
const mongo = mongoHandler(process.env.MONGO_URL);
const discord = connectToDiscord(client, process.env.TOKEN);

Promise.all([mongo, discord])
    .then(() => {
        logger.info('[portal] ready');
    })
    .catch(e => {
        logger.error(new Error(e));
        process.exit(1);
    });
