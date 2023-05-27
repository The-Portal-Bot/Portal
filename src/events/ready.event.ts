/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActivityOptions, ActivityType, Client, Guild, GuildMember, PresenceData } from 'discord.js';
import { logger } from '../libraries/help.library';
import { getFunction } from '../libraries/localisation.library';
import { fetchGuildMembers, guildExists, insertGuild, insertMember, removeMember } from '../libraries/mongo.library';
import { PMember } from '../types/classes/PMember.class';
import { LogActions } from '../types/classes/PTypes.interface';

export default async (args: { client: Client }): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!args.client.user) {
      return reject('could not fetch user from client');
    }

    const activitiesOptions: ActivityOptions = {
      name: './help', // `in ${args.client.guilds.cache.size} servers``
      type: ActivityType.Listening,
      url: 'https://github.com/keybraker',
    };

    const data: PresenceData = { activities: [activitiesOptions], status: 'online', afk: false };

    args.client.user.setPresence(data);

    args.client.guilds.cache.forEach((guild: Guild) => {
      logger.info(`${guild} | ${guild.id}`);

      addGuildAgain(guild, args.client).catch((e) => {
        return reject(`failed to add guild again: ${e}`);
      });
      // removeDeletedChannels(guild);
      // removeEmptyVoiceChannels(guild);
    });

    const func = getFunction('console', 1, LogActions.ready) as unknown as (a: number, b: number, c: number) => string;

    return resolve(
      func
        ? func(args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size)
        : 'error with localisation'
    );
  });
};

async function addedWhenDown(guild: Guild, pMembers: PMember[]): Promise<void> {
  const members = guild.members.cache.map((m) => m);

  for (let j = 0; j < members.length; j++) {
    if (members[j].user.bot) {
      continue;
    }

    const alreadyInDatabase = pMembers.find((m) => m.id === members[j].id);

    if (alreadyInDatabase) {
      continue;
    }

    logger.info(`inserting member: ${members[j].id} to ${guild.name} [${guild.id}]`);

    // if member is inside guild but not in portal db, add member
    const memberInserted = await insertMember(guild.id, members[j].id);

    if (!memberInserted) {
      logger.error(new Error(`failed to late-insert member`));
    }

    logger.info(`late-insert ${members[j].id} to ${guild.name} [${guild.id}]`);
  }
}

async function removedWhenDown(guild: Guild, pMembers: PMember[]): Promise<void> {
  for (let j = 0; j < pMembers.length; j++) {
    const member = guild.members.cache.map((member) => member).find((m) => m.id === pMembers[j].id);

    if (member) {
      continue;
    }

    logger.info(`removing member: ${pMembers[j].id} from ${guild.name} [${guild.id}]`);

    const memberRemoved = await removeMember(pMembers[j].id, guild.id);

    if (!memberRemoved) {
      logger.error(new Error(`failed to late-remove member`));
    }

    logger.info(`late-remove ${pMembers[j].id} to ${guild.name} [${guild.id}]`);
  }
}

async function addGuildAgain(guild: Guild, client: Client): Promise<boolean> {
  if (!await guildExists(guild.id)) {
    return await insertGuild(guild.id, client);
  } else {
    const pMembers = await fetchGuildMembers(guild.id);
    if (!pMembers) {
      return false;
    }
    logger.info(`pMembers: [${pMembers.map((m) => m.id).join(', ')}}]}`);
    await addedWhenDown(guild, pMembers);
    await removedWhenDown(guild, pMembers);

    return true;
  }
}
