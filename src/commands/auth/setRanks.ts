import { Message, Role } from "discord.js";
import { getJsonFromString, messageHelp } from "../../libraries/help.library";
import { setRanks } from "../../libraries/mongo.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { Rank, ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

function isRank(rank: Rank) {
  return !!rank.level && !!rank.role;
}

function isRole(rank: Rank, roles: Role[]) {
  return roles.some(role => {
    return role.id === rank.role || role.name === rank.role;
  });
}

export = {
  data: new SlashCommandBuilder()
    .setName('setRanks')
    .setDescription('create ranks for the server'),
  async execute(
    message: Message, args: string[], pGuild: PGuild
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (!message.guild)
        return resolve({
          result: true,
          value: 'guild could not be fetched'
        });

      const roles = message.guild.roles.cache.map(cr => cr);

      if (args.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const newRanksJSON = getJsonFromString(args.join(' '));
        if (!newRanksJSON || !Array.isArray(newRanksJSON)) {
          return resolve({
            result: false,
            value: messageHelp('commands', 'setRanks', 'ranking must be an array in JSON format (even for one role)')
          });
        }

        const newRanks = <Rank[]>newRanksJSON;

        if (!newRanks.every(r => r.level && r.role)) {
          return resolve({
            result: false,
            value: messageHelp('commands', 'setRanks', 'JSON syntax has spelling errors`')
          });
        }
        if (!newRanks.every(isRank)) {
          return resolve({
            result: false,
            value: messageHelp('commands', 'setRanks', 'rankings must be a key-pair from level and role')
          });
        }
        if (!newRanks.every(r => isRole(r, roles))) {
          return resolve({
            result: false,
            value: messageHelp('commands', 'setRanks', 'a role given does not exist in server')
          });
        }

        newRanks.forEach(rank => {
          rank.level = +rank.level;
          const role = roles.find(role => role.name === rank.role);
          if (role) rank.role = role.id;
        });

        setRanks(pGuild.id, newRanks)
          .then(r => {
            return resolve({
              result: r,
              value: r
                ? 'set new ranks successfully'
                : 'failed to set new ranks'
            });
          })
          .catch(() => {
            return resolve({
              result: false,
              value: 'failed to set new ranks'
            });
          });
      }
      else {
        return resolve({
          result: false,
          value: messageHelp('commands', 'setRanks')
        });
      }

      return resolve({
        result: true,
        value: 'new rankings have been set'
      });
    });
  }
};
