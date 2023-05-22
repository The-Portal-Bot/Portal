import { Message, VoiceChannel } from 'discord.js';
import { messageHelp } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { setAttribute } from '../../types/interfaces/Attribute.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('set').setDescription('set the value of an attribute'),
  async execute(message: Message, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (!message.guild) {
        return resolve({
          result: true,
          value: 'guild could not be fetched',
        });
      }

      if (!message.member) {
        return resolve({
          result: true,
          value: 'member could not be fetched',
        });
      }

      if (args.length >= 2) {
        const valueArray = [...args];
        valueArray.shift();

        const value = valueArray.filter((val) => val !== '\n').join(' ');

        setAttribute(message.member.voice.channel as VoiceChannel, pGuild, args[0], value, message.member, message)
          .then((r) => {
            return resolve(r);
          })
          .catch((e) => {
            return resolve({
              result: false,
              value: `something went wrong in set function: ${e}`,
            });
          });
      } else {
        return resolve({
          result: false,
          value: messageHelp('commands', 'set', 'arguments are set by name and value'),
        });
      }
    });
  },
};
