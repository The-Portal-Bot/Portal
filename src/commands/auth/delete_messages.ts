import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { askForApproval, commandDescriptionByNameAndAuthenticationLevel, messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'delete_messages';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, true))
    .addNumberOption(option =>
      option
        .setName('delete_length')
        .setDescription('number of messages to delete')
        .setRequired(true))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const bulkDeleteLength = interaction.options.getNumber('delete_length');

    if (!bulkDeleteLength) {
      return {
        result: false,
        value: messageHelp('commands', 'delete_messages', 'deleteLength must be provided'),
      };
    }

    if (typeof bulkDeleteLength !== 'number') {
      // isNaN ?
      return {
        result: false,
        value: messageHelp('commands', 'delete_messages', 'argument must always be number'),
      };
    }

    if (bulkDeleteLength <= 0) {
      return {
        result: false,
        value: messageHelp('commands', 'delete_messages', 'you can delete one or more messages'),
      };
    }

    if (bulkDeleteLength > 97) {
      return {
        result: false,
        value: messageHelp('commands', 'delete_messages', 'you can delete up-to 97 messages'),
      };
    }

    if (!interaction.member) {
      return {
        result: true,
        value: 'message author could not be fetched',
      };
    }

    const result = askForApproval(
      interaction,
      (interaction.member as GuildMember),
      `*${interaction.user}, are you sure you want to delete ` +
      `**${bulkDeleteLength}** messages*, do you **(yes / no)** ?`
    );

    if (!result) {
      return {
        result: false,
        value: 'failed to focus',
      };
    }

    const messages = await (<TextChannel>interaction.channel)
      .bulkDelete(bulkDeleteLength + 3);

    if (!messages) {
      return {
        result: false,
        value: 'error while bulk delete',
      };
    }

    return {
      result: true,
      value: `deleted ${messages.size - 1} messages`,
    };
  }
};
