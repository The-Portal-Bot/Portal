import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { createEmbed } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { PMember } from '../../types/classes/PMember.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('whoami').setDescription('returns who am I information'),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    const pMember = pGuild.pMembers.find((m) => m.id === interaction.user.id);
    if (!pMember) {
      return {
        result: false,
        value: 'could not find guild',
      };
    }

    const sentMessage = await interaction.channel
      ?.send({ embeds: embeds(interaction, pMember) })

    return {
      result: true,
      value: sentMessage ? '' : 'could not send message',
    };
  },
};


const embeds = (interaction: ChatInputCommandInteraction, pMember: PMember) => [
  createEmbed(
    interaction.member ? (interaction.member as GuildMember)?.displayName : 'could not fetch name',
    null,
    '#ddff00',
    [
      {
        emote: 'Level',
        role: pMember.level,
        inline: true,
      },
      {
        emote: 'Regex',
        role: !pMember.regex || pMember.regex === 'null' ? 'not set' : pMember.regex,
        inline: true,
      },
      {
        emote: 'Penalties',
        role: `${pMember.penalties ? pMember.penalties : 0}`,
        inline: true,
      },
      {
        emote: 'Id',
        role: pMember.id,
        inline: false,
      },
    ],
    interaction.member?.user.avatar,
    null,
    true,
    null,
    null
  ),
];