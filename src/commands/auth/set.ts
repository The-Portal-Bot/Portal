import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { commandDescriptionByNameAndAuthenticationLevel } from '../../libraries/help.library';

const COMMAND_NAME = 'set';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, true)),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    return {
      result: true,
      value: 'not yet implemented',
    };

    // if (!interaction.guild) {
    //   return {
    //     result: true,
    //     value: 'guild could not be fetched',
    //   };
    // }

    // const member = interaction.member as GuildMember;
    // if (!member) {
    //   return {
    //     result: true,
    //     value: 'member could not be fetched',
    //   };
    // }

    // if (args.length >= 2) {
    //   const valueArray = [...args];
    //   valueArray.shift();

    //   const value = valueArray.filter((val) => val !== '\n').join(' ');

    //   // !this must be updated to handle interaction instead of message, but needs restructure not only refactoring
    //   // setAttribute(member.voice.channel as VoiceChannel, pGuild, args[0], value, member, interaction)
    //   //   .then((r) => {
    //   //     return r;
    //   //   })
    //   //   .catch((e) => {
    //   //     return {
    //   //       result: false,
    //   //       value: `something went wrong in set function: ${e}`,
    //   //     };
    //   //   });
    // } else {
    //   return {
    //     result: false,
    //     value: messageHelp('commands', 'set', 'arguments are set by name and value'),
    //   };
    // }
  },
};
