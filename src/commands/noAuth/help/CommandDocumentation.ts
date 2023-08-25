import { EmbedBuilder } from 'discord.js';
import * as auth from '../../../commands/auth';
import * as noAuth from '../../../commands/noAuth';
import { createEmbed } from '../../../libraries/help.library';
import { Field, HelpDocumentation } from '../../../types/classes/PTypes.interface';

const PORTAL_URL = 'https://portal-bot.xyz/docs';

export class CommandDocumentation implements HelpDocumentation {
  public getGuide():  EmbedBuilder {
    const commandArray: Field[] = [
      {
        emote: '1. Go to any channel',
        role: '*you can write commands in any channel and Portal will see them*',
        inline: false,
      },
      {
        emote: '2. `./help`',
        role: '*write your command, for example help*',
        inline: false,
      },
      {
        emote: '3. Wait for portal response',
        role: '*portal will reply to almost all commands with an action or/and message*',
        inline: false,
      },
    ];

    return createEmbed(
      'Command Guide',
      `[Commands](${PORTAL_URL}/commands/description) are the way you communicate with Portal.\nhow to use commands`,
      '#9775A9',
      commandArray,
      null,
      null,
      null,
      null,
      null
    );
  }

  public getHelp():  EmbedBuilder[] {
    const commands = this.getCommandList();
    const commandArray: Field[][] = [];

    for (let l = 0; l <= commands.length / 25; l++) {
      commandArray[l] = [];
      for (let i = 24 * l; i < commands.length && i < 24 * (l + 1); i++) {
        commandArray[l].push({
          emote: `${i + 1}. ${commands[i].name}`,
          role: `[hover or click](${PORTAL_URL}/commands/detailed/${commands[i].name} "${commands[i].hover}")`,
          inline: true,
        });
      }
    }

    return commandArray.map((_command, index) => {
      if (index === 0) {
        return createEmbed(
          'Commands',
          `[Commands](${PORTAL_URL}/commands/description) are the way you communicate with Portal.`,
          '#9775A9',
          commandArray[0],
          null,
          null,
          null,
          null,
          null
        );
      } else {
        return createEmbed(null, null, '#9775A9', commandArray[index], null, null, null, null, null);
      }
    });
  }

  public getHelpDetailed(candidate: string):  EmbedBuilder | boolean {
    const commands = this.getCommandList();

    for (let i = 0; i < commands.length; i++) {
      if (commands[i].name === candidate) {
        return createEmbed(
          commands[i].name,
          null,
          '#9775A9',
          [
            { emote: 'Type', role: 'Command', inline: true },
            {
              emote: 'Description',
              role: `[hover or click](${PORTAL_URL}/commands/detailed/${candidate} "${commands[i].hover}")`,
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

  private getCommandList() {
    return [
      ...Object.values(auth),
      ...Object.values(noAuth),
    ].map(command => ({
      name: command.data.name,
      hover: command.data.description
    }));
  }
}