import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Role } from 'discord.js';
import { commandDescriptionByNameAndAuthenticationLevel, getJSONFromString, messageHelp } from '../../libraries/help.library';
import { setRanks } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { Rank, ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'set_ranks';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, true))
    .addStringOption((option) =>
      option
        .setName('rank_string')
        .setDescription('JSON string of ranks to set (even for one rank)')
        .setRequired(true))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    if (!interaction.guild)
      return {
        result: true,
        value: 'guild could not be fetched',
      };

    const rankString = interaction.options.getString('rank_string');

    if (!rankString) {
      return {
        result: false,
        value: messageHelp('commands', 'set_ranks', 'rank string must be provided'),
      };
    }

    const roles = interaction.guild.roles.cache.map((cacheRole) => cacheRole);

    const newRanksJSON = getJSONFromString(rankString);
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

function isRank(rank: Rank) {
  return !!rank.level && !!rank.role;
}

function isRole(rank: Rank, roles: Role[]) {
  return roles.some((role) => {
    return role.id === rank.role || role.name === rank.role;
  });
}