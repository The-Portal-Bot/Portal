import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { createEmbed, messageHelp } from '../../libraries/help.library';
import { Command } from '../../types/Command';
import { Field, ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';
import { AttributeDocumentation } from './help/AttributeDocumentation';
import { CommandDocumentation } from './help/CommandDocumentation';
import { PipeDocumentation } from './help/PipeDocumentation';
import { StructureDocumentation } from './help/StructureDocumentation';
import { VariableDocumentation } from './help/VariableDocumentation';

const COMMAND_NAME = 'help';
const DESCRIPTION = 'returns requested help page'

export = {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
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
      const response = await simpleReply();
      return { result: !!response, value: response };
    }

    if (category.startsWith('description')) {
      const response = await propertyReply(category.split('_')[1], specific);
      return { result: !!response, value: response };
    }

    if (category.startsWith('guide')) {
      const response = await guideReply(category.split('_')[1]);
      return { result: !!response, value: response };
    }

    return { result: false, value: messageHelp('commands', 'help') };
  },
} as Command;

const commandDocumentation = new CommandDocumentation();
const variableDocumentation = new VariableDocumentation();
const pipeDocumentation = new PipeDocumentation();
const attributeDocumentation = new AttributeDocumentation();
const structureDocumentation = new StructureDocumentation();

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

async function simpleReply() {
  const helpMessage = [createEmbed(
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
  )];

  return helpMessage;
}

async function propertyReply(type: string, specific: string | null) {
  if (specific) {
    const detailed = commandDocumentation.getHelpDetailed(specific) ||
      variableDocumentation.getHelpDetailed(specific) ||
      pipeDocumentation.getHelpDetailed(specific) ||
      attributeDocumentation.getHelpDetailed(specific) ||
      structureDocumentation.getHelpDetailed(specific);

    if (detailed instanceof EmbedBuilder) {
      return [detailed];
    } else {
      return messageHelp('commands', 'help', `*${specific}* does not exist in portal`);
    }
  }

  switch (type) {
  case 'commands':
    return commandDocumentation.getHelp();
  case 'variables':
    return variableDocumentation.getHelp();
  case 'pipes':
    return pipeDocumentation.getHelp();
  case 'attributes':
    return attributeDocumentation.getHelp();
  case 'structures':
    return structureDocumentation.getHelp();
  }

  return messageHelp('commands', 'help', `*${type}* does not exist in portal`);
}

async function guideReply(type: string) {
  let guide: EmbedBuilder | null = null;

  switch (type) {
  case 'commands':
    guide = commandDocumentation.getGuide();
    break;
  case 'variables':
    guide = variableDocumentation.getGuide();
    break;
  case 'pipes':
    guide = pipeDocumentation.getGuide();
    break;
  case 'attributes':
    guide = attributeDocumentation.getGuide();
    break;
  case 'structures':
    guide = structureDocumentation.getGuide();
    break;
  }

  if (!guide) {
    return messageHelp('commands', 'help', `*${type}* does not exist in portal`);
  }

  return [guide];
}
