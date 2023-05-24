import { Message, TextChannel } from 'discord.js';
import { askForApproval, messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('delete_messages').setDescription('delete n number of messages'),
  async execute(message: Message, args: string[]): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (args.length !== 1) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'delete_messages', 'you can only give one number as argument'),
        });
      }

      const bulkDeleteLength = +args[0];

      if (typeof bulkDeleteLength !== 'number') {
        // isNaN ?
        return resolve({
          result: false,
          value: messageHelp('commands', 'delete_messages', 'argument must always be number'),
        });
      }

      if (bulkDeleteLength <= 0) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'delete_messages', 'you can delete one or more messages'),
        });
      }

      if (bulkDeleteLength > 97) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'delete_messages', 'you can delete up-to 97 messages'),
        });
      }

      if (!message.member) {
        return resolve({
          result: true,
          value: 'message author could not be fetched',
        });
      }

      askForApproval(
        message,
        message.member,
        `*${message.author}, are you sure you want to delete ` +
        `**${bulkDeleteLength}** messages*, do you **(yes / no)** ?`
      )
        .then((result) => {
          if (result) {
            (<TextChannel>message.channel)
              .bulkDelete(bulkDeleteLength + 3)
              .then((messages) => {
                return resolve({
                  result: true,
                  value: `deleted ${messages.size - 1} messages`,
                });
              })
              .catch((e) => {
                return resolve({
                  result: false,
                  value: `error while bulk delete: ${e}`,
                });
              });
          } else {
            return resolve({
              result: false,
              value: 'will not delete messages',
            });
          }
        })
        .catch((e) => {
          return resolve({
            result: false,
            value: `failed to focus: ${e}`,
          });
        });
    });
  },
};
