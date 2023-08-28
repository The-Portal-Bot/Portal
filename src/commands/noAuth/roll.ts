import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import Roll from 'roll';
import { createEmbed, maxString, messageHelp } from '../../libraries/help.library';
import { Command } from '../../types/Command';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'roll';
const DESCRIPTION = 'roll a dice'

export = {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption(option =>
      option.setName('roll_command')
        .setDescription('Roll command')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('show')
        .setDescription('show rolled dice in detail')
        .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    let rollCommand = interaction.options.getString('roll_command');
    const show = interaction.options.getBoolean('show');

    if (!rollCommand) {
      return {
        result: false,
        value: messageHelp('commands', 'roll'),
      };
    }

    rollCommand = rollCommand.replace(/\s/g, '');

    try {
      const member = interaction.member as GuildMember;
      const rollLibrary = new Roll();
      const roll = rollLibrary.roll(rollCommand);
      const rollDetail = show ? ` (${roll.rolled} from ${rollCommand})` : '';
      const rollMsg = `${member.displayName} rolled ${roll.result}${rollDetail}`;

      const sentMessage = await interaction.channel
        ?.send({
          embeds: [
            createEmbed(null, null, '#FF0000', null, null, null, false, null, null, undefined, {
              name: maxString(rollMsg, 256),
              icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/dice.gif',
            }),
          ],
        })

      return {
        result: true,
        value: sentMessage ? '' : 'failed to send message',
      };
    } catch (e) {
      return {
        result: false,
        value: 'error while rolling',
      };
    }
  },
} as Command;
