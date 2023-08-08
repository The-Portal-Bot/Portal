import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { commandDescriptionByNameAndAuthenticationLevel, createEmbed } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'level';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, false))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const member = interaction.member as GuildMember;
    const pMember = pGuild.pMembers.find((m) => m.id === member.id);

    if (!pMember) {
      return {
        result: false,
        value: 'could not find member',
      };
    }

    const message = {
      embeds: [
        createEmbed(
          null,
          null,
          '#00FFFF',
          [
            { emote: 'Level', role: `${pMember.level}`, inline: true },
            { emote: 'Points', role: `${Math.round(pMember.points)}`, inline: true },
            // { emote: '', role: '', inline: false },
            // { emote: 'Rank', role: `${pMember.rank}`, inline: true },
            { emote: 'Tier', role: `${pMember.tier}`, inline: true },
          ],
          null,
          member,
          true,
          null,
          null
        ),
      ],
    }

    const outcome = await interaction.channel?.send(message);

    return {
      result: !!outcome,
      value: outcome ? '' : 'failed to send message',
    };
  },
};
