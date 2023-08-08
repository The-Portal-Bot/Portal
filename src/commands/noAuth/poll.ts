import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ColorResolvable, TextChannel } from 'discord.js';
import { commandDescriptionByNameAndAuthenticationLevel, createEmbed, getJSONFromString, messageHelp } from '../../libraries/help.library';
import { insertPoll } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { PPoll } from '../../types/classes/PPoll.class';
import { Field, ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'poll';
const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, false))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Poll title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('poll_json_string')
        .setDescription('Poll JSON string')
        .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    if (!interaction.guild) {
      return {
        result: true,
        value: 'guild could not be fetched',
      };
    }

    const title = interaction.options.getString('title');
    const pollJSONString = interaction.options.getString('body');

    if (!title || !pollJSONString) {
      return {
        result: false,
        value: messageHelp('commands', 'poll'),
      };
    }

    const pollJSON = getJSONFromString(pollJSONString);
    if (!pollJSON) {
      return {
        result: false,
        value: messageHelp('commands', 'poll', 'poll must be in JSON array format `./help poll`'),
      };
    }

    const pollMap = <string[]>pollJSON;
    if (pollMap.length > 9) {
      return {
        result: false,
        value: messageHelp('commands', 'poll', 'polls can have maximum 9 options'),
      };
    }

    if (pollMap.length < 2) {
      return {
        result: false,
        value: messageHelp('commands', 'poll', 'polls must have minimum 2 options'),
      };
    }

    if (!Array.isArray(pollMap)) {
      return {
        result: false,
        value: messageHelp('commands', 'poll', 'must be array even for one role'),
      };
    }

    pollMap.forEach((r) => r.trim());
    const pollMapField = pollMap.map((p, i) => {
      return <Field>{
        emote: emoji[i],
        role: p,
        inline: true,
      };
    });

    const response = await createRoleMessage(<TextChannel>interaction.channel, pGuild, title, '', '#9900ff', pollMapField, interaction.user.id);

    if (!response) {
      return {
        result: false,
        value: 'error creating role message',
      };
    }

    return {
      result: response.result,
      value: response.result ? '' : response.value,
    };
  },
};

async function createRoleMessage(
  channel: TextChannel,
  pGuild: PGuild,
  title: string,
  desc: string,
  colour: ColorResolvable,
  pollMap: Field[],
  memberId: string
): Promise<ReturnPromise> {
  const roleMessageEmbed = createEmbed(title, desc, colour, pollMap, null, null, true, null, null);

  const sentMessage = await channel.send({ embeds: [roleMessageEmbed] });

  if (!sentMessage) {
    return {
      result: false,
      value: 'failed to create role assigner message',
    };
  }

  const reactionCheckered = await sentMessage.react('🏁');

  if (!reactionCheckered) {
    return {
      result: true,
      value: 'failed to react to message',
    };
  }

  for (let i = 0; i < pollMap.length; i++) {
    if (typeof pollMap[i].emote === 'string') {
      sentMessage.react(<string>pollMap[i].emote).catch((e) => {
        return {
          result: true,
          value: `failed to react to message: ${e}`,
        };
      });
    }
  }

  const poll: PPoll = { messageId: sentMessage.id, memberId: memberId };
  const newPoll = await insertPoll(pGuild.id, poll);

  if (!newPoll) {
    return {
      result: false,
      value: 'failed to set new ranks',
    };
  }

  return {
    result: newPoll,
    value: newPoll ? 'successfully created poll' : 'failed to create poll',
  };
}