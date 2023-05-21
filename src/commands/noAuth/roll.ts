import { Message } from "discord.js";
import Roll from 'roll';
import { createEmbed, maxString, messageHelp } from "../../libraries/help.library";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('rolls dice'),
  async execute(
    message: Message, args: string[]
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (args.length > 0) {
        let rollCommand: string = args.join(' ').substring(0, args.join(' ').indexOf('|'));
        let rollOptions: string | null = args.join(' ').substring(args.join(' ').indexOf('|') + 1);

        if (rollCommand === '' && rollOptions !== '') {
          rollCommand = rollOptions;
          rollOptions = null;
        }

        rollCommand = rollCommand.replace(/\s/g, '');

        try {
          const rollLibrary = new Roll();
          const roll = rollLibrary.roll(rollCommand)
          const show = (rollOptions && rollOptions.trim() === 'show')
            ? ` (${roll.rolled} from ${rollCommand})`
            : ``;
          const rollMsg = `${message.member?.displayName} rolled ${roll.result}${show}`;

          message.channel
            .send({
              embeds: [
                createEmbed(
                  null,
                  null,
                  '#FF0000',
                  null,
                  null,
                  null,
                  false,
                  null,
                  null,
                  undefined,
                  {
                    name: maxString(rollMsg, 256),
                    icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/dice.gif'
                  }
                )
              ]
            })
            .catch(e => {
              return resolve({
                result: true,
                value: `failed to send message: ${e}`
              });
            });

          return resolve({
            result: true,
            value: ''
          });
        } catch (e) {
          return resolve({
            result: false,
            value: `error while rolling: ${e}`
          });
        }
      } else {
        return resolve({
          result: false,
          value: messageHelp('commands', 'roll')
        });
      }
    });
  }
};
