import { Guild } from 'discord.js';
import { removeGuild } from '../libraries/mongo.library';

import logger from '../utilities/log.utility';

export default async (guild: Guild): Promise<void> => {
  const guildRemoved = await removeGuild(guild.id);

  if (guildRemoved) {
    logger.info(`removed guild ${guild.name} [${guild.id}]`);
  } else {
    logger.error(`failed to remove guild ${guild.name} [${guild.id}]`);
  }
};
