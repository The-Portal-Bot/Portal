import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, User } from 'discord.js';
import { createEmbed } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'whoami';
const DESCRIPTION = 'returns your personal card'

export = {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const pMember = pGuild.pMembers.find((pMember) => pMember.id === interaction.user.id);
    if (!pMember || !interaction.member) {
      return {
        result: false,
        value: 'could not find guild',
      };
    }

    const sentMessage = await interaction.channel?.send({ embeds: [
      createEmbed(
        interaction.member?.user?.username,
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
        (interaction.member?.user as User)?.avatarURL() ?? null,
        null,
        true,
        null,
        null
      ),
    ] })

    return {
      result: !!sentMessage,
      value: sentMessage ? '' : 'could not send message',
    };
  },
};