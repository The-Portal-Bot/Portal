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
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('returns help message')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category to get help for')
        .setRequired(true)
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'Command description', value: 'description_commands' },
          { name: 'Variable description', value: 'description_variables' },
          { name: 'Pipe description', value: 'description_pipes' },
          { name: 'Attribute description', value: 'description_attributes' },
          { name: 'Structure description', value: 'description_structures' },
          { name: 'Command guide', value: 'guide_commands' },
          { name: 'Variable guide', value: 'guide_variables' },
          { name: 'Pipe guide', value: 'guide_pipes' },
          { name: 'Attribute guide', value: 'guide_attributes' },
          { name: 'Structure guide', value: 'guide_structures' },
        ))
    .addStringOption(option =>
      option.setName('command_unauthorised')
        .setDescription('Command to get help for')
        .setRequired(false)
        .addChoices(
          { name: 'about', value: 'about' },
          { name: 'announce', value: 'announce' },
          { name: 'bet', value: 'bet' },
          { name: 'corona', value: 'corona' },
          { name: 'crypto', value: 'crypto' },
          { name: 'focus', value: 'focus' },
          { name: 'football', value: 'football' },
          { name: 'help', value: 'help' },
          { name: 'join', value: 'join' },
          { name: 'leaderboard', value: 'leaderboard' },
          { name: 'leave', value: 'leave' },
          { name: 'level', value: 'level' },
          { name: 'ping', value: 'ping' },
          { name: 'poll', value: 'poll' },
          { name: 'ranks', value: 'ranks' },
          { name: 'roll', value: 'roll' },
          { name: 'run', value: 'run' },
          { name: 'state', value: 'state' },
          { name: 'spam_rules', value: 'spam_rules' },
          { name: 'weather', value: 'weather' },
          { name: 'whoami', value: 'whoami' },
        ))
    .addStringOption(option =>
      option.setName('command_authorised')
        .setDescription('Command to get help for')
        .setRequired(false)
        .addChoices(
          { name: 'announcement', value: 'announcement' },
          { name: 'ban', value: 'ban' },
          { name: 'delete_messages', value: 'delete_messages' },
          { name: 'force', value: 'force' },
          { name: 'ignore', value: 'ignore' },
          { name: 'invite', value: 'invite' },
          { name: 'kick', value: 'kick' },
          { name: 'music', value: 'music' },
          { name: 'portal', value: 'portal' },
          { name: 'vendor', value: 'vendor' },
          { name: 'set_ranks', value: 'set_ranks' },
          { name: 'set', value: 'set' },
          { name: 'url', value: 'url' },
        ))
    .addStringOption(option =>
      option.setName('variable')
        .setDescription('Variable to get help for')
        .setRequired(false)
        .addChoices(
          { name: '##', value: '##' },
          { name: '#', value: '#' },
          { name: 'creatorPortal', value: 'creatorPortal' },
          { name: 'creatorVoice', value: 'creatorVoice' },
          { name: 'date', value: 'date' },
          { name: 'dayNumber', value: 'dayNumber' },
          { name: 'dayName', value: 'dayName' },
          { name: 'monthNumber', value: 'monthNumber' },
          { name: 'monthName', value: 'monthName' },
          { name: 'year', value: 'year' },
          { name: 'time', value: 'time' },
          { name: 'hour', value: 'hour' },
          { name: 'minute', value: 'minute' },
          { name: 'second', value: 'second' },
          { name: 'memberActiveCount', value: 'memberActiveCount' },
          { name: 'memberCount', value: 'memberCount' },
          { name: 'memberHistory', value: 'memberHistory' },
          { name: 'pMembers', value: 'pMembers' },
          { name: 'memberWithStatus', value: 'memberWithStatus' },
          { name: 'statusCount', value: 'statusCount' },
          { name: 'statusHistory', value: 'statusHistory' },
          { name: 'statusList', value: 'statusList' },
        ))
    .addStringOption(option =>
      option.setName('pipe')
        .setDescription('Pipe to get help for')
        .setRequired(false)
        .addChoices(
          { name: 'acronym', value: 'acronym' },
          { name: 'vowels', value: 'vowels' },
          { name: 'consonants', value: 'consonants' },
          { name: 'camelCase', value: 'camelCase' },
          { name: 'capitalise', value: 'capitalise' },
          { name: 'decapitalise', value: 'decapitalise' },
          { name: 'lowerCase', value: 'lowerCase' },
          { name: 'upperCase', value: 'upperCase' },
          { name: 'populous_count', value: 'populous_count' },
          { name: 'populous', value: 'populous' },
          { name: 'snakeCase', value: 'snakeCase' },
          { name: 'souvlakiCase', value: 'souvlakiCase' },
          { name: 'words', value: 'words' },
          { name: 'titleCase', value: 'titleCase' },
          { name: 'length', value: 'length' },
        ))
    .addStringOption(option =>
      option.setName('attribute')
        .setDescription('Attribute to get help for')
        .setRequired(false)
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'Command description', value: 'description_commands' },
          { name: 'Variable description', value: 'description_variables' },
          { name: 'Pipe description', value: 'description_pipes' },
          { name: 'Attribute description', value: 'description_attributes' },
          { name: 'Structure description', value: 'description_structures' },
          { name: 'Command guide', value: 'guide_commands' },
          { name: 'Variable guide', value: 'guide_variables' },
          { name: 'Pipe guide', value: 'guide_pipes' },
          { name: 'Attribute guide', value: 'guide_attributes' },
          { name: 'Structure guide', value: 'guide_structures' },
        ))
    .addStringOption(option =>
      option.setName('structure')
        .setDescription('Structure to get help for')
        .setRequired(false)
        .addChoices(
          { name: 'annAnnounce', value: 'annAnnounce' },
          { name: 'noBots', value: 'noBots' },
          { name: 'allowedRoles', value: 'allowedRoles' },
          { name: 'render', value: 'render' },
          { name: 'annUser', value: 'annUser' },
          { name: 'bitrate', value: 'bitrate' },
          { name: 'kickAfter', value: 'kickAfter' },
          { name: 'banAfter', value: 'banAfter' },
          { name: 'prefix', value: 'prefix' },
          { name: 'muteRole', value: 'muteRole' },
          { name: 'rankSpeed', value: 'rankSpeed' },
          { name: 'profanityLevel', value: 'profanityLevel' },
          { name: 'initialRole', value: 'initialRole' },
          { name: 'locale', value: 'locale' },
          { name: 'position', value: 'position' },
          { name: 'regexOverwrite', value: 'regexOverwrite' },
          { name: 'regexPortal', value: 'regexPortal' },
          { name: 'regexVoice', value: 'regexVoice' },
          { name: 'regex', value: 'regex' },
          { name: 'userLimitPortal', value: 'userLimitPortal' },
          { name: 'userLimit', value: 'userLimit' },
        )),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const category = interaction.options.getString('category');
    const command_unauthorised = interaction.options.getString('command_unauthorised');
    const command_authorised = interaction.options.getString('command_authorised');
    const variable = interaction.options.getString('variable');
    const pipe = interaction.options.getString('pipe');
    const attribute = interaction.options.getString('attribute');
    const structure = interaction.options.getString('structure');
    const specific = command_unauthorised ?? command_authorised ?? variable ?? pipe ?? attribute ?? structure;

    if (!category) {
      return {
        result: false,
        value: messageHelp('commands', 'help', 'category must be provided'),
      };
    }

    if (category === 'all') {
      return { result: !!(await simpleReply(interaction)), value: '' };
    }

    if (category.startsWith('description')) {
      return { result: !!(await propertyReply(interaction, category.split('_')[1], specific)), value: '' };
    }

    if (category.startsWith('guide')) {
      return { result: !!(await guideReply(interaction, category.split('_')[1])), value: '' };
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
  const message = {
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
  }

  return !!(await interaction.channel?.send(message));
}

async function propertyReply(interaction: ChatInputCommandInteraction, type: string, specific: string | null) {
  let embedArray: EmbedBuilder[] | null = null;

  if (specific) {
    let detailed = getCommandHelpSuper(specific);
    if (!detailed) {
      detailed = getVariableHelpSuper(specific);
      if (!detailed) {
        detailed = getPipeHelpSuper(specific);
        if (!detailed) {
          detailed = getAttributeHelpSuper(specific);
          if (!detailed) {
            detailed = getStructureHelpSuper(specific);
            if (!detailed) {
              return Promise.reject(messageHelp('commands', 'help', `*${specific}* does not exist in portal`));
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
      return Promise.reject(messageHelp('commands', 'help', `*${type}* does not exist in portal`));
    }
  }

  switch (type) {
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
  }

  return false;
}

async function guideReply(interaction: ChatInputCommandInteraction, type: string) {
  let guide: EmbedBuilder | null = null;

  switch (type) {
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
    return Promise.reject(messageHelp('commands', 'help', `*${type}* does not exist in portal`));
  }
}
