import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { commandDescriptionByNameAndAuthenticationLevel } from '../../libraries/help.library';

const COMMAND_NAME = 'url';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, true)),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    return {
      result: false,
      value: 'not yet implemented',
    };

    // if (!interaction.guild) {
    //   return {
    //     result: false,
    //     value: 'guild could not be fetched',
    //   };
    // }

    // if (!interaction.channel) {
    //   return {
    //     result: false,
    //     value: 'channel could not be fetched',
    //   };
    // }

    // if (args.length === 0) {
    //   if (isUrlOnlyChannel(interaction.channel.id, pGuild)) {
    //     removeURL(pGuild.id, interaction.channel.id)
    //       .then((r: boolean) => {
    //         return {
    //           result: r,
    //           value: r ? 'successfully removed url channel' : 'failed to remove url channel',
    //         };
    //       })
    //       .catch((e: string) => {
    //         return {
    //           result: false,
    //           value: `failed to remove url channel: ${e}`,
    //         };
    //       });
    //   } else if (isAnnouncementChannel(interaction.channel.id, pGuild)) {
    //     return {
    //       result: false,
    //       value: "this can't be set as a URL channel for it is the Announcement channel",
    //     };
    //   } else if (isMusicChannel(interaction.channel.id, pGuild)) {
    //     return {
    //       result: true,
    //       value: "this can't be set as a URL channel for it is the Music channel",
    //     };
    //   } else {
    //     insertURL(pGuild.id, interaction.channel.id)
    //       .then((r) => {
    //         return {
    //           result: r,
    //           value: r ? 'set as an url channel successfully' : 'failed to set as an url channel',
    //         };
    //       })
    //       .catch((e) => {
    //         return {
    //           result: false,
    //           value: `failed to set as an url channel: ${e}`,
    //         };
    //       });
    //   }
    // } else if (args.length > 0) {
    //   let urlChannel: string = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1);
    //   let urlCategory: string | null = args.join(' ').substring(args.join(' ').indexOf('|'));

    //   if (urlChannel === '' && urlCategory !== '') {
    //     urlChannel = urlCategory;
    //     urlCategory = null;
    //   }

    //   const urlOptions = getOptions(interaction.guild, 'url only channel');

    //   createChannel(interaction.guild, urlChannel, urlOptions, urlCategory)
    //     .then((rCreate) => {
    //       insertURL(pGuild.id, rCreate)
    //         .then((rUrl) => {
    //           return {
    //             result: rUrl,
    //             value: rUrl ? 'created url channel and category successfully' : 'failed to create a url channel',
    //           };
    //         })
    //         .catch((e) => {
    //           return {
    //             result: false,
    //             value: `failed to create a url channel: ${e}`,
    //           };
    //         });
    //     })
    //     .catch((e) => {
    //       return {
    //         result: false,
    //         value: `failed to create a url channel: ${e}`,
    //       };
    //     });
    // }

    // return {
    //   result: false,
    //   value: messageHelp('commands', 'url'),
    // };
  },
};
