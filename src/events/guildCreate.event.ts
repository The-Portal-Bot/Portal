import { Client, Guild } from 'discord.js';
import { guildExists, insertGuild } from '../libraries/mongo.library';

export default async (args: { client: Client; guild: Guild }): Promise<string> => {
  const exists = await guildExists(args.guild.id);

  if (exists) {
    return `guild ${args.guild.name} [${args.guild.id}] already in database`;
  }

  const guildInserted = await insertGuild(args.guild.id, args.client);

  return guildInserted 
    ? `joined guild ${args.guild.name} [${args.guild.id}]`
    : `failed to join guild ${args.guild.name} [${args.guild.id}]`
};
