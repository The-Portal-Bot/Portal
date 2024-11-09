import { EmbedBuilder } from 'discord.js';

import { StructureBlueprint } from '../../../blueprints/structure.blueprint.js';
import { createEmbed } from '../../../libraries/help.library.js';
import { Field, HelpDocumentation } from '../../../types/classes/PTypes.interface.js';
import { Prefix } from '../../../types/enums/Prefix.enum.js';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';

export class StructureDocumentation implements HelpDocumentation {
  public getGuide(): EmbedBuilder {
    const structArray: Field[] = [
      {
        emote: 'Used in Regex Interpreter',
        role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
        inline: true,
      },
      {
        emote: 'structures are flow manipulators',
        role: '*you can change the outcome of the regex corresponding with live data*',
        inline: true,
      },
      {
        emote: '1.\tIn any text channel execute command `./run`',
        role: './run just like channel name generation uses the text interpreter',
        inline: false,
      },
      {
        emote:
          '2.\t`./run Is it 2020 ? {{ "if": "$year", "is": "===", "with": "2020", "yes": "yes it is", "no": "no it is not" }}!`',
        role: './run executes the given text and replies with the processed output',
        inline: false,
      },
      {
        emote: '3.\tAwait a reply from portal which will be `Is it 2020 ? no it is not!` (it is currently not 2020)',
        role: '*note that year is variable as it is preceded by &*',
        inline: false,
      },
    ];

    return createEmbed(
      'Structure Guide',
      '[Structures](' +
        PORTAL_URL +
        INTERPRETER_URL +
        '/structures/description) ' +
        'conditional flow manipulators (if this do that, or if that do this).\n' +
        'How to use structures with the Text Interpreter',
      '#EEB902',
      structArray,
      null,
      null,
      null,
      null,
      null,
    );
  }

  public getHelp(): EmbedBuilder[] {
    const structArray: Field[][] = [];

    for (let l = 0; l <= StructureBlueprint.length / 25; l++) {
      structArray[l] = [];
      for (let i = 24 * l; i < StructureBlueprint.length && i < 24 * (l + 1); i++) {
        structArray[l].push({
          emote: `${i + 1}. ${StructureBlueprint[i].name}`,
          role:
            `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
            `/structures/detailed/${StructureBlueprint[i].name} "${StructureBlueprint[i].hover}")`,
          inline: true,
        });
      }
    }

    return structArray.map((_structure, index) => {
      if (index === 0) {
        return createEmbed(
          'Structures',
          '[Structures](' +
            PORTAL_URL +
            INTERPRETER_URL +
            '/structures/description) ' +
            'conditional flow manipulators (if this do that, or if that do this).\n' +
            'Prefix: ' +
            Prefix.STRUCTURE,
          '#EEB902',
          structArray[0],
          null,
          null,
          null,
          null,
          null,
        );
      } else {
        return createEmbed(null, null, '#EEB902', structArray[index], null, null, null, null, null);
      }
    });
  }

  public getHelpDetailed(candidate: string): EmbedBuilder | boolean {
    for (let i = 0; i < StructureBlueprint.length; i++) {
      if (StructureBlueprint[i].name === candidate) {
        return createEmbed(
          StructureBlueprint[i].name,
          null,
          '#EEB902',
          [
            { emote: 'Type', role: 'structures', inline: true },
            { emote: 'Prefix', role: `${Prefix.STRUCTURE}`, inline: true },
            {
              emote: 'Description',
              role:
                `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
                `/structures/detailed/${candidate} "${StructureBlueprint[i].name}")`,
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

  private getLink(variable: string): string {
    const url = PORTAL_URL + INTERPRETER_URL + '/variables';
    const general = ['creatorPortal', 'creatorVoice', '##', '#'];
    const member = ['pMembers', 'memberCount', 'memberActiveCount', 'memberWithStatus', 'memberHistory'];
    const status = ['statusList', 'statusCount', 'statusHistory'];
    const time = [
      'date',
      'dayNumber',
      'dayName',
      'monthNumber',
      'monthName',
      'year',
      'time',
      'hour',
      'minute',
      'second',
    ];

    if (general.includes(variable)) {
      if (variable === '##') {
        return `${url}/detailed/general/slash`;
      } else if (variable === '#') {
        return `${url}/detailed/general/doubleSlash`;
      } else {
        return `${url}/detailed/general/${variable}`;
      }
    } else if (member.includes(variable)) {
      return `${url}/detailed/member/${variable}`;
    } else if (status.includes(variable)) {
      return `${url}/detailed/status/${variable}`;
    } else if (time.includes(variable)) {
      return `${url}/detailed/time/${variable}`;
    } else {
      return `${url}/description`;
    }
  }
}
