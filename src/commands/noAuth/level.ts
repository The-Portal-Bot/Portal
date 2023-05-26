import { ChatInputCommandInteraction, GuildMember, Message } from 'discord.js';
import { createEmbed } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('level').setDescription('returns your level'),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    const member = interaction.member as GuildMember;
    const pMember = pGuild.pMembers.find((m) => m.id === member.id);
    if (!pMember) {
      return {
        result: true,
        value: 'could not find member',
      };
    }

    const outcome = await interaction.channel
      ?.send({
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
      });

    return {
      result: true,
      value: outcome ? '' : `failed to send message`,
    };
  },
};
