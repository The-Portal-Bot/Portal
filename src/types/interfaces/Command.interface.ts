import { EmbedBuilder } from 'discord.js';
import { AuthType } from '../enums/Admin.enum';
import { createEmbed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from '../classes/PTypes.interface';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
export const COMMAND_PREFIX = './';

const commands: InterfaceBlueprint[] = [
  {
    name: 'about',
    hover: 'about Portal',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'announce',
    hover: 'make an announcement',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'announcement',
    hover: 'create an announcement channel',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'bet',
    hover: 'get betting information',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'ban',
    hover: 'ban a member',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'corona',
    hover: 'get the latest covid19 data',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'crypto',
    hover: 'get the latest crypto currency data',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'delete_messages',
    hover: 'bulk delete message',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'focus',
    hover: 'talk exclusively with a member',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'force',
    hover: 'force refresh your current channel',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'help',
    hover: 'get help about Portal',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'join',
    hover: 'make Portal join your current voice channel',
    auth: AuthType.voice,
    get: null,
    set: null,
  },
  {
    name: 'joke',
    hover: 'get a joke',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'kick',
    hover: 'kick a member',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'leader board',
    hover: 'get current leader board',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'leave',
    hover: 'make Portal leave your current voice channel',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'level',
    hover: 'get your current level information',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'music',
    hover: 'create a music channel',
    auth: AuthType.voice,
    get: null,
    set: null,
  },
  {
    name: 'news',
    hover: 'get the latest news',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'ignore',
    hover: 'ignore current channel',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'ping',
    hover: 'ping Portal',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'poll',
    hover: 'create a Poll',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'portal',
    hover: 'create a portal channel',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'ranks',
    hover: 'get current ranks',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'vendor',
    hover: 'create roll assigning message',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'roll',
    hover: 'roll a dice',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'run',
    hover: 'run text through Text Interpreter',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'set_ranks',
    hover: 'set new ranks',
    auth: AuthType.admin,
    get: null,
    set: null,
  },
  {
    name: 'set',
    hover: "update an attribute's value",
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'state',
    hover: 'get current state of Portal visualised',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  // {
  // 	name: 'translate',
  //  hover: 'hover me | click me',
  // 	auth: AuthEnum.none,
  // 	get: null,
  // 	set: null
  // },
  {
    name: 'url',
    hover: 'create a url-only channel',
    auth: AuthType.voice,
    get: null,
    set: null,
  },
  {
    name: 'weather',
    hover: 'get current weather forecast',
    auth: AuthType.none,
    get: null,
    set: null,
  },
  {
    name: 'whoami',
    hover: 'get current information about you',
    auth: AuthType.none,
    get: null,
    set: null,
  },
];

export function isCommand(candidate: string): string {
  for (let i = 0; i < commands.length; i++) {
    const sub_str = String(candidate).substring(1, String(commands[i].name).length + 1);

    if (sub_str == commands[i].name) {
      return commands[i].name;
    }
  }

  return '';
}

export function getCommandGuide(): EmbedBuilder {
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
    '[Commands](' +
    PORTAL_URL +
    '/commands/description) ' +
    'are the way you communicate with Portal.\n' +
    'how to use commands',
    '#9775A9',
    commandArray,
    null,
    null,
    null,
    null,
    null
  );
}

export function getCommandHelp(): EmbedBuilder[] {
  const commandArray: Field[][] = [];

  for (let l = 0; l <= commands.length / 25; l++) {
    commandArray[l] = [];
    for (let i = 24 * l; i < commands.length && i < 24 * (l + 1); i++) {
      commandArray[l].push({
        emote: `${i + 1}. ${commands[i].name}`,
        role: `[hover or click](${PORTAL_URL}` + `/commands/detailed/${commands[i].name} "${commands[i].hover}")`,
        inline: true,
      });
    }
  }

  return commandArray.map((command, index) => {
    if (index === 0) {
      return createEmbed(
        'Commands',
        '[Commands](' +
        PORTAL_URL +
        '/commands/description) ' +
        'are the way you communicate with Portal.\n' +
        'Prefix: ' +
        COMMAND_PREFIX,
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

export function getCommandHelpSuper(candidate: string): EmbedBuilder | boolean {
  for (let i = 0; i < commands.length; i++) {
    if (commands[i].name === candidate) {
      return createEmbed(
        commands[i].name,
        null,
        '#9775A9',
        [
          { emote: `Type`, role: `Command`, inline: true },
          { emote: `Prefix`, role: `${COMMAND_PREFIX}`, inline: true },
          {
            emote: `Description`,
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
