import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { createEmbed, messageHelp } from '../../libraries/help.library';
import { Field, ReturnPromise } from '../../types/classes/PTypes.interface';
import { getAttributeGuide, getAttributeHelp, getAttributeHelpSuper } from '../../types/interfaces/Attribute.interface';
import { getCommandGuide, getCommandHelp, getCommandHelpSuper } from '../../types/interfaces/Command.interface';
import { getPipeGuide, getPipeHelp, getPipeHelpSuper } from '../../types/interfaces/Pipe.interface';
import { getStructureGuide, getStructureHelp, getStructureHelpSuper } from '../../types/interfaces/Structure.interface';
import { getVariableGuide, getVariableHelp, getVariableHelpSuper } from '../../types/interfaces/Variable.interface';

export = {
  data: new SlashCommandBuilder().setName('help').setDescription('returns help message'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    if (args.length === 0) {
      return { result: !!(await simpleReply(interaction)), value: '' };
    }

    if (args.length === 1) {
      return { result: !!(await propertyReply(interaction, args)), value: '' };
    }

    if (args.length === 2 && args[1] === 'guide') {
      return { result: !!(await guideReply(interaction, args)), value: '' };
    }

    return { result: false, value: messageHelp('commands', 'help') };
  },
};

const helpArray: Field[] = [
  {
    emote: null,
    role: '**[Commands](https://portal-bot.xyz/docs/commands/description)**',
    inline: false,
  },
  {
    emote: '`./help commands` or `./help commands guide`',
    role: 'Commands are mini programs you can use to get a response or action\n',
    inline: false,
  },
  {
    emote: null,
    role: '**[Text Interpreter](https://portal-bot.xyz/docs/interpreter/description)**',
    inline: false,
  },
  {
    emote: '`./help variables` or `./help variables guide`',
    role:
      'Variables are live data about the current state of things\n' +
      '_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/variables/description)_',
    inline: false,
  },
  {
    emote: '`./help pipes` or `./help pipes guide`',
    role:
      'Pipes are mini-programs that manipulate text or even variables and attributes\n' +
      '_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/pipes/description)_',
    inline: false,
  },
  {
    emote: '`./help attributes` or `./help attributes guide`',
    role:
      'Attributes are options that can be altered with **[set](https://portal-bot.xyz/docs/commands/detailed/set)** command\n' +
      '_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/attributes/description)_',
    inline: false,
  },
  {
    emote: '`./help structures` or `./help structures guide`',
    role:
      'Structures are rules to further manipulate the text outcome\n' +
      '_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/structures/description)_',
    inline: false,
  },
  {
    emote: null,
    role: 'Specific help',
    inline: false,
  },
  {
    emote: '`./help <specific_property_name>`',
    role:
      'If you want to get a complete description of any property\n' +
      '_(lets say you want to learn more about variables year, just type **./help year**)_',
    inline: false,
  },
  {
    emote: null,
    role: '**[FAQ](https://portal-bot.xyz/help#faq)** _frequently asked questioned_',
    inline: false,
  },
];

async function simpleReply(interaction: ChatInputCommandInteraction) {
  return !!(await interaction.channel
    ?.send({
      embeds: [
        createEmbed(
          'Help Card',
          'Detailed documentation at [portal-bot.xyz/docs](https://portal-bot.xyz/docs)\n\n' +
          '> make a member an **admin**, give role `p.admin`\n' +
          '> make a member an **moderator**, give role `p.mod`\n' +
          '> make a member a **dj**, give role `p.dj`\n' +
          '> to **whitelist** a member, give role `p.mod`\n' +
          '> to **ignore** a member, give role `p.ignore`\n' +
          '> for more click [here](https://portal-bot.xyz/help#q-how-can-i-give-members-authority)',
          '#05d1ff',
          helpArray,
          null,
          null,
          true,
          null,
          null
        ),
      ],
    })
    .catch((e) => {
      return Promise.reject(e);
    }));
}

async function propertyReply(interaction: ChatInputCommandInteraction, args: string[]) {
  let embedArray: EmbedBuilder[] | null = null;

  switch (args[0]) {
    case 'commands':
      embedArray = getCommandHelp();
      break;
    case 'variables':
      embedArray = getVariableHelp();
      break;
    case 'pipes':
      embedArray = getPipeHelp();
      break;
    case 'attributes':
      embedArray = getAttributeHelp();
      break;
    case 'structures':
      embedArray = getStructureHelp();
      break;
  }

  if (embedArray) {
    embedArray.forEach(async (embed) => {
      await interaction.user.send({ embeds: [embed] }).catch((e) => {
        return Promise.reject(e);
      });
    });

    return true;
  } else {
    let detailed = getCommandHelpSuper(args[0]);
    if (!detailed) {
      detailed = getVariableHelpSuper(args[0]);
      if (!detailed) {
        detailed = getPipeHelpSuper(args[0]);
        if (!detailed) {
          detailed = getAttributeHelpSuper(args[0]);
          if (!detailed) {
            detailed = getStructureHelpSuper(args[0]);
            if (!detailed) {
              return Promise.reject(messageHelp('commands', 'help', `*${args[0]}* does not exist in portal`));
            }
          }
        }
      }
    }

    if (detailed instanceof EmbedBuilder) {
      return !!interaction.user.send({ embeds: [detailed] }).catch(() => {
        return Promise.reject('failed to send message');
      });
    } else {
      return Promise.reject(messageHelp('commands', 'help', `*${args[0]} ${args[1]}* does not exist in portal`));
    }
  }
}

async function guideReply(interaction: ChatInputCommandInteraction, args: string[]) {
  let guide: EmbedBuilder | null = null;

  switch (args[0]) {
    case 'commands':
      guide = getCommandGuide();
      break;
    case 'variables':
      guide = getVariableGuide();
      break;
    case 'pipes':
      guide = getPipeGuide();
      break;
    case 'attributes':
      guide = getAttributeGuide();
      break;
    case 'structures':
      guide = getStructureGuide();
      break;
  }

  if (guide) {
    return !!interaction.user.send({ embeds: [guide] }).catch(() => {
      return Promise.reject('failed to send message');
    });
  } else {
    return Promise.reject(messageHelp('commands', 'help', `*${args[0]} ${args[1]}* does not exist in portal`));
  }
}
