import {
  EmbedBuilder
} from 'discord.js';
import { createEmbed } from '../../../libraries/help.library';
import { Field, HelpDocumentation } from '../../../types/classes/PTypes.interface';
import { AttributeBlueprints } from '../../../blueprints/attribute.blueprint';
import { Prefix } from '../../../types/enums/Prefix.enum';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';

export class AttributeDocumentation implements HelpDocumentation {
  public getGuide():  EmbedBuilder {
    const attrArray: Field[] = [
      {
        emote: 'Used in Regex Interpreter',
        role: '*used by channel name (regex, regexVoice, regexPortal) and run command*',
        inline: true,
      },
      {
        emote: 'attributes are mutable data options',
        role: '*options correspond to server, portal or voice channels*',
        inline: true,
      },
      {
        emote: '1.\tIn any text channel execute command `./run`',
        role: './run just like channel name generation uses the text interpreter',
        inline: false,
      },
      {
        emote: '2.\t`./run My set locale is = &g.locale`',
        role: './run executes the given text and replies with the processed output',
        inline: false,
      },
      {
        emote: '3.\tAwait a reply from portal which will be gr, de or en',
        role: '*The replied string will look like this: `My set locale is = gr`*',
        inline: false,
      },
      {
        emote: '4.\t`./set g.locale de` (no prefix & needed)',
        role: '*set command, updates the data of an attribute in this case **locale** to **de***',
        inline: false,
      },
      {
        emote: '5.\tWait for portal response which will be inform you if it was executed without issues',
        role: '*portal will either confirm update or inform you of the error it faced*',
        inline: false,
      },
    ];

    return createEmbed(
      'Attribute Guide',
      '[Attributes](' +
      PORTAL_URL +
      INTERPRETER_URL +
      '/attributes/description) ' +
      'are options that can be manipulated by whomever has clearance.\n' +
      'How to use attributes with the Text Interpreter',
      '#FF5714',
      attrArray,
      null,
      null,
      null,
      null,
      null
    );
  }

  public getHelp():  EmbedBuilder[] {
    const attributeArray: Field[][] = [];

    for (let l = 0; l <= AttributeBlueprints.length / 25; l++) {
      attributeArray[l] = [];
      for (let i = 24 * l; i < AttributeBlueprints.length && i < 24 * (l + 1); i++) {
        attributeArray[l].push({
          emote: `${i + 1}. ${AttributeBlueprints[i].name}`,
          role: `[hover or click](${this.getLink(AttributeBlueprints[i].name)} "${AttributeBlueprints[i].hover}")`,
          inline: true,
        });
      }
    }

    return attributeArray.map((_attribute, index) => {
      if (index === 0) {
        return createEmbed(
          'Attributes',
          '[Attributes](' +
          PORTAL_URL +
          INTERPRETER_URL +
          '/attributes/description) ' +
          'are options that can be manipulated by whomever has clearance.\n' +
          'Prefix: ' +
          Prefix.ATTRIBUTE,
          '#FF5714',
          attributeArray[0],
          null,
          null,
          null,
          null,
          null
        );
      } else {
        return createEmbed(null, null, '#FF5714', attributeArray[index], null, null, null, null, null);
      }
    });
  }

  public getHelpDetailed(candidate: string):  EmbedBuilder | boolean {
    for (let i = 0; i < AttributeBlueprints.length; i++) {
      if (AttributeBlueprints[i].name === candidate) {
        return createEmbed(
          AttributeBlueprints[i].name,
          null,
          '#FF5714',
          [
            { emote: 'Type', role: 'Attribute', inline: true },
            { emote: 'Prefix', role: `${Prefix.ATTRIBUTE}`, inline: true },
            {
              emote: 'Description',
              role: `[hover or click](${this.getLink(candidate)} "${AttributeBlueprints[i].hover}")`,
              inline: true,
            },
          ],
          null,
          null,
          null,
          null,
          null
        );
      }
    }

    return false;
  }

  private getLink(attribute: string): string {
    const url = PORTAL_URL + INTERPRETER_URL + '/attributes';

    if (attribute.indexOf('g.') > -1) {
      return `${url}/detailed/global/${attribute}`;
    } else if (attribute.indexOf('m.') > -1) {
      return `${url}/detailed/member/${attribute}`;
    } else if (attribute.indexOf('p.') > -1) {
      return `${url}/detailed/portal/${attribute}`;
    } else if (attribute.indexOf('v.') > -1) {
      return `${url}/detailed/voice/${attribute}`;
    } else {
      return `${url}/description`;
    }
  }
}