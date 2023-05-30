import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import SPAM_CONFIG from '../../config.spam.json';
import { createEmbed } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder()
    .setName('spam_rules')
    .setDescription('returns the current spam rules'),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    const guild = client.guilds.cache.find((guild) => guild.id === interaction?.guild?.id);

    if (!guild) {
      return {
        result: false,
        value: 'could not fetch guild',
      };
    }

    const rules =
      `**Duplicate spam warning after ${SPAM_CONFIG.DUPLICATE_AFTER}.**\n` +
      `**Spam warning after ${SPAM_CONFIG.WARN_AFTER}.**\n` +
      `**Mute after ${SPAM_CONFIG.MUTE_AFTER} ${SPAM_CONFIG.MUTE_AFTER === 1 ? 'warning' : 'warnings'} ` +
      `for ${SPAM_CONFIG.MUTE_PERIOD} ${SPAM_CONFIG.MUTE_PERIOD === 1 ? 'minute' : 'minutes'}.**\n\n` +
      `${pGuild.kickAfter && pGuild.kickAfter > 0
        ? `***Member kicked after ${pGuild.kickAfter} ${SPAM_CONFIG.MUTE_AFTER === 1 ? 'penalty' : 'penalties'
        }.***\n`
        : '***Automatic kick has not been set yet.***\n'
      }` +
      `${pGuild.banAfter && pGuild.banAfter > 0
        ? `***Member banned after ${pGuild.banAfter} ${SPAM_CONFIG.MUTE_AFTER === 1 ? 'penalty' : 'penalties'}.***`
        : '***Automatic ban has not been set yet.***'
      }`;

    const sentMessage = await interaction.channel?.send({
      embeds: [createEmbed('Spam Rules', rules, '#006996', null, null, null, true, null, null)],
    })

    return {
      result: !!sentMessage,
      value: sentMessage ? '' : 'failed to send message',
    };
  },
};
