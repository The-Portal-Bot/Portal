import { Client, Guild } from 'discord.js';
import { guildExists, insertGuild } from '../libraries/mongo.library';

import logger from '../utilities/log.utility';

export async function guildCreate(client: Client, guild: Guild): Promise<void> {
  const exists = await guildExists(guild.id);

  if (exists) {
    logger.error(`guild ${guild.name} [${guild.id}] already in database`);
    return;
  }

  const guildInserted = await insertGuild(guild.id, client);
  if (guildInserted) {
    logger.info(`inserted guild ${guild.name} [${guild.id}] into database`);
  } else {
    logger.error(`failed to insert guild ${guild.name} [${guild.id}] into database`);
  }
}
