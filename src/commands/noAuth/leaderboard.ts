import { Message } from 'discord.js';
import { createEmbed, messageHelp } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { PMember } from '../../types/classes/PMember.class';
import { Field, ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

function compare(memberA: PMember, memberB: PMember) {
  return memberB.level === memberA.level
    ? memberB.points > memberA.points
      ? 1
      : -1
    : memberB.level > memberA.level
      ? 1
      : -1;
}

export = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription("returns server's leaderboard"),
  async execute(message: Message, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      const pMembers = pGuild.pMembers;

      if (!pMembers) {
        return resolve({
          result: false,
          value: 'server has no members',
        });
      }

      const requestedNumber = +args[0];
      if (args.length > 0 && isNaN(requestedNumber)) {
        return resolve({
          result: false,
          value: `${args[0]} is not a number`,
        });
      }

      if (requestedNumber <= 0) {
        return resolve({
          result: false,
          value: `${args[0]} must be at least 1`,
        });
      }

      let entries =
        pMembers.length >= requestedNumber
          ? requestedNumber > 25
            ? 24
            : requestedNumber
          : pMembers.length > 25
            ? 24
            : pMembers.length;

      if (entries <= 0) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'leaderboard', 'leaderboard entries must be at least one'),
        });
      }

      if (pGuild.pMembers) {
        const memberLevels: Field[] = [];
        pMembers.sort(compare).forEach((pMember, i) => {
          if (message.guild && entries > i) {
            const thisPMember = message.guild.members.cache.find((member) => member.id === pMember.id);

            if (thisPMember) {
              memberLevels.push({
                emote: `${i + 1}. ${thisPMember.displayName}`,
                role: `level ${pMember.level}\t|\tpoints: ${Math.round(pMember.points)}`,
                inline: false,
              });

              entries--;
            } else {
              resolve({
                result: false,
                value: 'a member has been stored incorrectly',
              });
            }
          }
        });

        message.channel
          .send({
            embeds: [
              createEmbed(
                'LEADERBOARD',
                '[Ranking System](https://portal-bot.xyz/docs/ranking)',
                '#00FFFF',
                memberLevels,
                null,
                null,
                true,
                null,
                null
              ),
            ],
          })
          .catch((e) => {
            return resolve({
              result: false,
              value: `failed to send message: ${e}`,
            });
          });

        return resolve({
          result: true,
          value: '',
        });
      } else {
        resolve({
          result: false,
          value: 'there are no members for this server',
        });
      }
    });
  },
};
