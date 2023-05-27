import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

// const translate = require('translate')
// translate.engine = config.apiKeys.translate.engine;
// translate.key = config.apiKeys.translate.key;

export = {
  data: new SlashCommandBuilder().setName('translate').setDescription('translate given text'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    return {
      result: true,
      value: messageHelp('commands', 'translate', 'work in progress'),
    };

    if (args.length <= 1) {
      return {
        result: false,
        value: messageHelp('commands', 'translate', '1 you can run `./help translate` for help'),
      };
    }

    const languageOptions = args.join(' ').substring(0, args.join(' ').indexOf('|'));
    const stringToTranslate = args.join(' ').substring(args.join(' ').indexOf('|') + 1);

    if (!languageOptions || !stringToTranslate) {
      return {
        result: false,
        value: messageHelp('commands', 'translate', '2 you can run `./help translate` for help'),
      };
    }

    const languageDuplet = languageOptions.split(',');
    if (languageDuplet.length === 2) {
      // translate(stringToTranslate, { from: languageDuplet[0], to: languageDuplet[1] })
      //     .then((response: string) => {
      //         return {
      //             result: true,
      //             value: response
      //         };
      //     })
      //     .catch((error) => {
      //         return {
      //             result: false,
      //             value: messageHelp('commands', 'translate', `server responded with error: ${error}`)
      //         };
      //     });
    } else if (languageDuplet.length === 1) {
      // translate(stringToTranslate, { to: languageDuplet[0] })
      //     .then((response: string) => {
      //         return {
      //             result: true,
      //             value: response
      //         };
      //     })
      //     .catch((error) => {
      //         return {
      //             result: false,
      //             value: messageHelp('commands', 'translate', `server responded with error: ${error}`)
      //         };
      //     });
    } else {
      return {
        result: false,
        value: messageHelp('commands', 'translate', '3 you can run `./help translate` for help'),
      };
    }
  },
};
