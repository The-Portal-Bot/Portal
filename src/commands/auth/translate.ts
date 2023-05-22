import { Message } from 'discord.js';
import { messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

// const translate = require('translate')
// translate.engine = config.apiKeys.translate.engine;
// translate.key = config.apiKeys.translate.key;

export = {
  data: new SlashCommandBuilder().setName('translate').setDescription('translate given text'),
  async execute(message: Message, args: string[]): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      return resolve({
        result: true,
        value: messageHelp('commands', 'translate', 'work in progress'),
      });

      if (args.length <= 1) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'translate', '1 you can run `./help translate` for help'),
        });
      }

      const languageOptions = args.join(' ').substr(0, args.join(' ').indexOf('|'));
      const stringToTranslate = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

      if (!languageOptions || !stringToTranslate)
        return resolve({
          result: false,
          value: messageHelp('commands', 'translate', '2 you can run `./help translate` for help'),
        });

      const languageDuplet = languageOptions.split(',');
      if (languageDuplet.length === 2) {
        // translate(stringToTranslate, { from: languageDuplet[0], to: languageDuplet[1] })
        //     .then((response: string) => {
        //         return resolve({
        //             result: true,
        //             value: response
        //         });
        //     })
        //     .catch((error) => {
        //         return resolve({
        //             result: false,
        //             value: messageHelp('commands', 'translate', `server responded with error: ${error}`)
        //         });
        //     });
      } else if (languageDuplet.length === 1) {
        // translate(stringToTranslate, { to: languageDuplet[0] })
        //     .then((response: string) => {
        //         return resolve({
        //             result: true,
        //             value: response
        //         });
        //     })
        //     .catch((error) => {
        //         return resolve({
        //             result: false,
        //             value: messageHelp('commands', 'translate', `server responded with error: ${error}`)
        //         });
        //     });
      } else {
        return resolve({
          result: false,
          value: messageHelp('commands', 'translate', '3 you can run `./help translate` for help'),
        });
      }
    });
  },
};
