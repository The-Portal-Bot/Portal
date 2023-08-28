import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { createEmbed } from '../../libraries/help.library';
import { Command } from '../../types/Command';
import { PGuild } from '../../types/classes/PGuild.class';
import { Field, ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'ranks';
const DESCRIPTION = 'display server ranks'

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
    if (!pGuild.ranks || pGuild.ranks.length === 0) {
      return {
        result: true,
        value: 'there is no ranking yet',
      };
    }

    const ranksMessage: Field[] = [];

    pGuild.ranks.forEach((rank) => {
      const role = interaction.guild?.roles.cache.find((r) => r.id === rank.role);
      ranksMessage.push({
        emote: `At level ${rank.level}, you get role`,
        role: `${role ? role : rank.role}`,
        inline: false,
      });
    });

    const sentMessage = await interaction.channel
      ?.send({
        embeds: [createEmbed('Ranking System', null, '#FF4500', ranksMessage, null, null, true, null, null)],
      });

    return {
      result: true,
      value: sentMessage ? '' : 'failed to send message',
    };
  },
} as Command;
