import { EmbedBuilder } from 'discord.js';

import { PipeBlueprints } from '../../../blueprints/pipe.blueprint.js';
import { createEmbed } from '../../../libraries/help.library.js';
import { Field, HelpDocumentation } from '../../../types/classes/PTypes.interface.js';
import { Prefix } from '../../../types/enums/Prefix.enum.js';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';

export class PipeDocumentation implements HelpDocumentation {
  public getGuide(): EmbedBuilder {
    const pipe_array: Field[] = [
      {
        emote: 'Used in Regex Interpreter',
        role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
        inline: true,
      },
      {
        emote: 'Pipes are inextricably linked with text',
        role: '*pipes can used on plain text or even variables and attributes*',
        inline: true,
      },
      {
        emote: '1.\tIn any text channel execute command `./run`',
        role: './run just like channel name generation uses the text interpreter',
        inline: false,
      },
      {
        emote: '2.\t`./run My locale in caps is = &g.locale | upperCase`',
        role: './run executes the given text and replies with the processed output',
        inline: false,
      },
      {
        emote: '3.\tAwait a reply from portal which will be gr, de or en',
        role: '*The replied string will look like this: `My locale in caps is = GR`*',
        inline: false,
      },
    ];

    return createEmbed(
      'Pipe Guide',
      '[Pipes](' +
        PORTAL_URL +
        INTERPRETER_URL +
        '/pipes/description) ' +
        'are small programs you can pass text, variables or attributes, to manipulate their outcome\n' +
        'How to use pipes with the Text Interpreter',
      '#6EEB83',
      pipe_array,
      null,
      null,
      null,
      null,
      null,
    );
  }

  public getHelp(): EmbedBuilder[] {
    const pipeArray: Field[][] = [];

    for (let l = 0; l <= PipeBlueprints.length / 25; l++) {
      pipeArray[l] = [];
      for (let i = 24 * l; i < PipeBlueprints.length && i < 24 * (l + 1); i++) {
        pipeArray[l].push({
          emote: `${i + 1}. ${PipeBlueprints[i].name}`,
          role:
            `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
            `/pipes/detailed/${PipeBlueprints[i].name} "${PipeBlueprints[i].hover}")`,
          inline: true,
        });
      }
    }

    return pipeArray.map((_pipe, index): EmbedBuilder => {
      if (index === 0) {
        return createEmbed(
          'Pipes',
          '[Pipes](' +
            PORTAL_URL +
            INTERPRETER_URL +
            '/pipes/description) ' +
            'are small programs you can pass text, variables or attributes, to manipulate their outcome\n' +
            'Prefix: ' +
            Prefix.PIPE,
          '#6EEB83',
          pipeArray[0],
          null,
          null,
          null,
          null,
          null,
        );
      } else {
        return createEmbed(null, null, '#6EEB83', pipeArray[index], null, null, null, null, null);
      }
    });
  }

  public getHelpDetailed(candidate: string): EmbedBuilder | boolean {
    for (let i = 0; i < PipeBlueprints.length; i++) {
      if (PipeBlueprints[i].name === candidate) {
        return createEmbed(
          PipeBlueprints[i].name,
          null,
          '#6EEB83',
          [
            { emote: 'Type', role: 'Pipe', inline: true },
            { emote: 'Prefix', role: `${Prefix.PIPE}`, inline: true },
            {
              emote: 'Description',
              role:
                `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
                `/pipes/detailed/${candidate} "${PipeBlueprints[i].hover}")`,
              inline: true,
            },
          ],
          null,
          null,
          null,
          null,
          null,
        );
      }
    }

    return false;
  }
}
