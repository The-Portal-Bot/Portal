import { ActivityOptions, ActivityType, Client, Guild, PresenceData, Snowflake } from 'discord.js';
import { removeDeletedChannels, removeEmptyVoiceChannels } from '../libraries/help.library';
import { getFunction } from '../libraries/localisation.library';
import logger from '../utilities/log.utility';
import { fetchGuildMembers, guildExists, insertGuild, insertMember, removeMember } from '../libraries/mongo.library';
import { PMember } from '../types/classes/PMember.class';
import { LogActions } from '../types/classes/PTypes.interface';

export default async (args: { client: Client }): Promise<string> => {
  if (!args.client.user) {
    return 'could not fetch user from client';
  }

  const activitiesOptions: ActivityOptions = {
    name: './help', // `in ${args.client.guilds.cache.size} servers``
    type: ActivityType.Listening,
    url: 'https://github.com/keybraker',
  };

  const data: PresenceData = { activities: [activitiesOptions], status: 'online', afk: false };

  args.client.user.setPresence(data);
  let index = 0;
  args.client.guilds.cache.forEach((guild: Guild) => {
    logger.info(`${index++}. logged onto guild ${guild} (${guild.id})`);

    addGuildAgain(guild, args.client).catch((e) => {
      return `failed to add guild again: ${e}`;
    });

    removeDeletedChannels(guild);
    removeEmptyVoiceChannels(guild);
  });

  const func = getFunction('console', 1, LogActions.ready) as unknown as (args: { memberLength: number, channelLength: number, guildLength: number }) => string;

  return func
    ? func({
      memberLength: args.client.users.cache.size,
      channelLength: args.client.channels.cache.size,
      guildLength: args.client.guilds.cache.size,
    })
    : 'error with localisation';
};

async function addedWhenDown(guild: Guild, pMembers: PMember[]): Promise<void> {
  const membersFetched = await guild.members.fetch();
  const members = membersFetched.map(member => member).filter((member) => !member.user.bot);

  for (let j = 0; j < members.length; j++) {
    const alreadyInDatabase = pMembers.find((pMember) => pMember.id === members[j].id);

    if (alreadyInDatabase) {
      continue;
    }

    logger.info(`inserting member: ${members[j].id} to ${guild.name} [${guild.id}]`);

    // if member is inside guild but not in portal db, add member
    const memberInserted = await insertMember(guild.id, members[j].id);

    if (!memberInserted) {
      logger.error(new Error('failed to late-insert member'));
    }

    logger.info(`late-insert ${members[j].id} to ${guild.name} [${guild.id}]`);
  }
}

async function removedWhenDown(guild: Guild, pMembers: PMember[]): Promise<void> {
  const membersFetched = await guild.members.fetch();
  const members = membersFetched.map(member => member).filter((member) => !member.user.bot);

  for (let j = 0; j < pMembers.length; j++) {
    const member = members.find((member) => member.id === pMembers[j].id);

    if (member) {
      continue;
    }

    logger.info(`removing member: ${pMembers[j].id} from ${guild.name} [${guild.id}]`);

    const memberRemoved = await removeMember(pMembers[j].id, guild.id);

    if (!memberRemoved) {
      logger.error(new Error('failed to late-remove member'));
    }

    logger.info(`late-remove ${pMembers[j].id} to ${guild.name} [${guild.id}]`);
  }
}

async function addGuildAgain(guild: Guild, client: Client): Promise<boolean> {
  if (!await guildExists(guild.id)) {
    return await insertGuild(guild.id, client);
  }

  const pMembers = await fetchGuildMembers(guild.id);

  if (!pMembers) {
    return false;
  }

  await addedWhenDown(guild, pMembers);
  await removedWhenDown(guild, pMembers);

  return true;
}
