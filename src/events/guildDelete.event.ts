import { Guild } from 'discord.js';
import { removeGuild } from '../libraries/mongo.library';

export default async (args: { guild: Guild }): Promise<string> => {
  const guildRemoved = await removeGuild(args.guild.id);

  return guildRemoved
    ? `removed guild ${args.guild.name} [${args.guild.id}]`
    : `failed to remove guild ${args.guild.name} [${args.guild.id}]`;
};
