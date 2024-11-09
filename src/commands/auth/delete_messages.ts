import { SlashCommandBuilder } from '@discordjs/builders';

import { ButtonStyle, ChatInputCommandInteraction, InteractionContextType, TextChannel } from 'discord.js';
import { askForApproval, messageHelp } from '../../libraries/help.library.js';
import { Command } from '../../types/Command.js';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface.js';

const COMMAND_NAME = 'delete_messages';
const DESCRIPTION = 'delete n messages';

export default {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addNumberOption((option) =>
      option.setName('message_number').setDescription('number of messages to delete').setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const bulkDeleteLength = interaction.options.getNumber('message_number');

    if (!bulkDeleteLength) {
      return {
        result: false,
        value: messageHelp('commands', 'delete_messages', 'deleteLength must be provided'),
      };
    }

    if (bulkDeleteLength <= 0 || bulkDeleteLength > 97) {
      return {
        result: false,
        value: messageHelp('commands', 'delete_messages', 'you can delete one, up-to 97 messages'),
      };
    }

    if (!interaction.member) {
      return {
        result: false,
        value: 'message author could not be fetched',
      };
    }

    const result = await askForApproval(
      interaction,
      `*${interaction.user}, are you sure you want to delete **${bulkDeleteLength}** messages*?`,
      ButtonStyle.Success,
    );

    if (!result) {
      return {
        result: false,
        value: 'failed to get approval',
      };
    }

    const messages = await (<TextChannel>interaction.channel).bulkDelete(bulkDeleteLength + 1);

    if (!messages) {
      return {
        result: false,
        value: 'error while bulk delete',
      };
    }

    return {
      result: true,
      value: `User ${interaction.user.displayName}, deleted ${messages.size - 1} messages`,
    };
  },
} as Command;
