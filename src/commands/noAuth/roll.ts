import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import Roll from 'roll';
import { createEmbed, maxString, messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('roll').setDescription('rolls dice'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    if (args.length === 0) {
      return {
        result: false,
        value: messageHelp('commands', 'roll'),
      };
    }

    let rollCommand: string = args.join(' ').substring(0, args.join(' ').indexOf('|'));
    let rollOptions: string | null = args.join(' ').substring(args.join(' ').indexOf('|') + 1);

    if (rollCommand === '' && rollOptions !== '') {
      rollCommand = rollOptions;
      rollOptions = null;
    }

    rollCommand = rollCommand.replace(/\s/g, '');

    try {
      const member = interaction.member as GuildMember;
      const rollLibrary = new Roll();
      const roll = rollLibrary.roll(rollCommand);
      const show = rollOptions && rollOptions.trim() === 'show' ? ` (${roll.rolled} from ${rollCommand})` : ``;
      const rollMsg = `${member.displayName} rolled ${roll.result}${show}`;

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
        value: sentMessage ? '' : `failed to send message`,
      };
    } catch (e) {
      return {
        result: false,
        value: `error while rolling: ${e}`,
      };
    }
  },
};
