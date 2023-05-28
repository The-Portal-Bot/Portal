import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { includedInPIgnores } from '../../libraries/guild.library';
import { insertIgnore, removeIgnore } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder()
    .setName('ignore')
    .setDescription('ignore user or channel from spam'),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    if (!interaction.guild) {
      return {
        result: false,
        value: 'guild could not be fetched',
      };
    }

    const channelId = interaction.channel?.id;

    if (!channelId) {
      return {
        result: false,
        value: 'could not fetch channel',
      };
    }

    // channel ignore
    if (includedInPIgnores(channelId, pGuild)) {
      const response = await removeIgnore(pGuild.id, channelId);

      if (response) {
        return {
          result: response,
          value: response ? 'successfully removed ignore channel' : 'failed to remove ignore channel',
        };
      } else {
        return {
          result: false,
          value: 'failed to remove ignore channel',
        };
      }
    } else {
      const response = await insertIgnore(pGuild.id, channelId);

      if (response) {
        return {
          result: response,
          value: response ? 'set as an ignore channel successfully' : 'failed to set as an ignore channel',
        };
      } else {
        return {
          result: false,
          value: `failed to set as an ignore channel`,
        };
      }
    }
  },
};
