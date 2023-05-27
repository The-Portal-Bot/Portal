import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Role } from 'discord.js';
import { getJSONFromString, messageHelp } from '../../libraries/help.library';
import { setRanks } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { Rank, ReturnPromise } from '../../types/classes/PTypes.interface';

function isRank(rank: Rank) {
  return !!rank.level && !!rank.role;
}

function isRole(rank: Rank, roles: Role[]) {
  return roles.some((role) => {
    return role.id === rank.role || role.name === rank.role;
  });
}

export = {
  data: new SlashCommandBuilder().setName('set_ranks').setDescription('create ranks for the server'),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    if (!interaction.guild)
      return {
        result: true,
        value: 'guild could not be fetched',
      };

    if (args.length === 0) {
      return {
        result: false,
        value: messageHelp('commands', 'set_ranks'),
      };
    }

    const roles = interaction.guild.roles.cache.map((cacheRole) => cacheRole);

    const newRanksJSON = getJSONFromString(args.join(' '));
    if (!newRanksJSON || !Array.isArray(newRanksJSON)) {
      return {
        result: false,
        value: messageHelp('commands', 'set_ranks', 'ranking must be an array in JSON format (even for one role)'),
      };
    }

    const newRanks = <Rank[]>newRanksJSON;

    if (!newRanks.every((r) => r.level && r.role)) {
      return {
        result: false,
        value: messageHelp('commands', 'set_ranks', 'JSON syntax has spelling errors`'),
      };
    }

    if (!newRanks.every(isRank)) {
      return {
        result: false,
        value: messageHelp('commands', 'set_ranks', 'rankings must be a key-pair from level and role'),
      };
    }

    if (!newRanks.every((r) => isRole(r, roles))) {
      return {
        result: false,
        value: messageHelp('commands', 'set_ranks', 'a role given does not exist in server'),
      };
    }

    newRanks.forEach((rank) => {
      rank.level = +rank.level;
      const role = roles.find((role) => role.name === rank.role);
      if (role) rank.role = role.id;
    });

    const response = await setRanks(pGuild.id, newRanks);

    return {
      result: response,
      value: response ? 'set new ranks successfully' : 'failed to set new ranks',
    };
  },
};
