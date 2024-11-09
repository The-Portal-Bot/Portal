import { EmbedBuilder } from 'discord.js';

import { VariableBlueprints } from '../../../blueprints/variable.blueprint.js';
import { createEmbed } from '../../../libraries/help.library.js';
import { Field, HelpDocumentation } from '../../../types/classes/PTypes.interface.js';
import { Prefix } from '../../../types/enums/Prefix.enum.js';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';

export class VariableDocumentation implements HelpDocumentation {
  public getGuide(): EmbedBuilder {
    const structArray: Field[] = [
      {
        emote: 'Used in Regex Interpreter',
        role: '*used by channel name (regex, regexVoice, regexPortal) and run command*',
        inline: true,
      },
      {
        emote: 'variables are immutable and live data',
        role: '*data corresponds to server, portal or voice channel live data*',
        inline: true,
      },
      {
        emote: '1.\tIn any text channel execute command `./run`',
        role: './run just like channel name generation uses the text interpreter',
        inline: false,
      },
      {
        emote: '2.\t`./run The year is $year`',
        role: './run executes the given text and replies with the processed output',
        inline: false,
      },
      {
        emote: '3.\tAwait a reply from portal which will be `The year is 2021',
        role: '*note that at the time of writhing it is 2021*',
        inline: false,
      },
    ];

    return createEmbed(
      'Variable Guide',
      '[Variables](' +
        PORTAL_URL +
        INTERPRETER_URL +
        '/variables/description) ' +
        'are immutable and live data that return information about your current voice channel.\n' +
        'how to use variables with text interpreter',
      '#1BE7FF',
      structArray,
      null,
      null,
      null,
      null,
      null,
    );
  }

  public getHelp(): EmbedBuilder[] {
    const variableArray: Field[][] = [];

    for (let l = 0; l <= VariableBlueprints.length / 25; l++) {
      variableArray[l] = [];
      for (let i = 24 * l; i < VariableBlueprints.length && i < 24 * (l + 1); i++) {
        variableArray[l].push({
          emote: `${i + 1}. ${VariableBlueprints[i].name}`,
          role: `[hover or click](${this.getLink(VariableBlueprints[i].name)} "${VariableBlueprints[i].hover}")`,
          inline: true,
        });
      }
    }

    return variableArray.map((_variable, index) => {
      if (index === 0) {
        return createEmbed(
          'Variables',
          '[Variables](' +
            PORTAL_URL +
            INTERPRETER_URL +
            '/variables/description) ' +
            'are immutable and live data that return information about your current voice channel.\n' +
            'Prefix: ' +
            Prefix.VARIABLE,
          '#1BE7FF',
          variableArray[0],
          null,
          null,
          null,
          null,
          null,
        );
      } else {
        return createEmbed(null, null, '#1BE7FF', variableArray[index], null, null, null, null, null);
      }
    });
  }

  public getHelpDetailed(candidate: string): EmbedBuilder | boolean {
    for (let i = 0; i < VariableBlueprints.length; i++) {
      if (VariableBlueprints[i].name === candidate) {
        return createEmbed(
          VariableBlueprints[i].name,
          null,
          '#1BE7FF',
          [
            { emote: 'Type', role: 'Variables', inline: true },
            { emote: 'Prefix', role: `${Prefix.VARIABLE}`, inline: true },
            {
              emote: 'Description',
              role: `[hover or click](${this.getLink(candidate)} "${VariableBlueprints[i].hover}")`,
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
