import type { Guild } from "npm:discord.js";
import { removeGuild } from "../libraries/mongo.library.ts";

import logger from "../utilities/log.utility.ts";

export async function guildDelete(guild: Guild): Promise<void> {
  const guildRemoved = await removeGuild(guild.id);

  if (guildRemoved) {
    logger.info(`removed guild ${guild.name} [${guild.id}]`);
  } else {
    logger.error(`failed to remove guild ${guild.name} [${guild.id}]`);
  }
}
