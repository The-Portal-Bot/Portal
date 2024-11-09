import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { createEmbed, messageHelp } from '../../libraries/help.library.js';
import { Command } from '../../types/Command.js';
import { PGuild } from '../../types/classes/PGuild.class.js';
import { PMember } from '../../types/classes/PMember.class.js';
import { Field, ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface.js';

const COMMAND_NAME = 'leaderboard';
const DESCRIPTION = 'returns server\'s leaderboard';

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addNumberOption((option) =>
      option.setName('requested_number').setDescription('Number of members to display').setRequired(false),
    )
    .setContexts(InteractionContextType.Guild),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const pMembers = pGuild.pMembers;

    if (!pMembers) {
      return {
        result: false,
        value: 'server has no members',
      };
    }

    const requestedNumber = interaction.options.getNumber('requested_number');

    let entries =
      requestedNumber && pMembers.length >= requestedNumber
        ? requestedNumber > 25
          ? 24
          : requestedNumber
        : pMembers.length > 25
          ? 24
          : pMembers.length;

    if (entries <= 0) {
      return {
        result: false,
        value: messageHelp('commands', 'leaderboard', 'leaderboard entries must be at least one'),
      };
    }

    if (!pGuild.pMembers) {
      return {
        result: false,
        value: 'there are no members for this server',
      };
    }

    const memberLevels: Field[] = [];
    pMembers.sort(compare).forEach((pMember, i) => {
      if (interaction.guild && entries > i) {
        const thisPMember = interaction.guild.members.cache.find((member) => member.id === pMember.id);

        if (thisPMember) {
          memberLevels.push({
            emote: `${i + 1}. ${thisPMember.displayName}`,
            role: `level ${pMember.level}\t|\tpoints: ${Math.round(pMember.points)}`,
            inline: false,
          });

          entries--;
        } else {
          return {
            result: false,
            value: 'a member has been stored incorrectly',
          };
        }
      }
    });

    const outcome = await interaction.reply({
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
          null,
        ),
      ],
    });

    return {
      result: !!outcome,
      value: outcome ? '' : 'failed to send message',
    };
  },
} as Command;

function compare(memberA: PMember, memberB: PMember) {
  return memberB.level === memberA.level
    ? memberB.points > memberA.points
      ? 1
      : -1
    : memberB.level > memberA.level
      ? 1
      : -1;
}
