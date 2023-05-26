import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { askForApproval, messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('delete_messages').setDescription('delete n number of messages'),
  async execute(integration: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    if (args.length !== 1) {
      return {
        result: false,
        value: messageHelp('commands', 'delete_messages', 'you can only give one number as argument'),
      };
    }

    const bulkDeleteLength = +args[0];

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

    if (!integration.member) {
      return {
        result: true,
        value: 'message author could not be fetched',
      };
    }

    const result = askForApproval(
      integration,
      (integration.member as GuildMember),
      `*${integration.user}, are you sure you want to delete ` +
      `**${bulkDeleteLength}** messages*, do you **(yes / no)** ?`
    );

    if (!result) {
      return {
        result: false,
        value: `failed to focus`,
      };
    }

    const messages = await (<TextChannel>integration.channel)
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
