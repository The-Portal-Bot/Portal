import { BanOptions, ChatInputCommandInteraction, GuildMember, Message } from 'discord.js';
import { askForApproval, isMod, messageHelp } from '../../libraries/help.library';
import { ban } from '../../libraries/user.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('ban').setDescription('bans given user'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    return {
      result: false,
      value: 'not yet implemented',
    };

    // if (!interaction.member) {
    //   return {
    //     result: false,
    //     value: 'message author could not be fetched',
    //   };
    // }

    // if (!isMod((interaction.member as GuildMember))) {
    //   return {
    //     result: false,
    //     value: `you must be a Portal moderator to ban users`,
    //   };
    // }

    // if (!interaction.guild) {
    //   return {
    //     result: false,
    //     value: `user guild could not be fetched`,
    //   };
    // }

    // let banReason = args
    //   .join(' ')
    //   .substring(args.join(' ').indexOf('|') + 1, args.join(' ').lastIndexOf('|') - 1)
    //   .replace(/\s/g, ' ')
    //   .trim();

    // if (banReason === '') {
    //   banReason = 'banned by admin';
    // }

    // let banDays = +args
    //   .join(' ')
    //   .substring(args.join(' ').lastIndexOf('|') + 1)
    //   .replace(/\s/g, ' ');

    // if (isNaN(banDays)) {
    //   banDays = 1;
    // }

    // if (interaction.mentions && interaction.mentions.members) {
    //   if (interaction.mentions.members.size === 0) {
    //     return {
    //       result: false,
    //       value: messageHelp('commands', 'ban', `you must tag a member`),
    //     });
    //   }

    //   const memberToBan = interaction.mentions.members.first() || interaction.guild.members.cache.get(args[0]);

    //   if (memberToBan) {
    //     if (interaction.member === memberToBan) {
    //       return {
    //         result: false,
    //         value: messageHelp('commands', 'ban', `you can't ban on yourself`),
    //       };
    //     }

    //     askForApproval(
    //       interaction,
    //       interaction.member,
    //       `*${interaction.member}, are you sure you want to ban ` +
    //       `member ${memberToBan}*, do you **(yes / no)** ? reason : ${banReason}`
    //     )
    //       .then((result) => {
    //         if (result) {
    //           const banOptions: BanOptions = {
    //             deleteMessageDays: banDays,
    //             reason: banReason,
    //           };

    //           ban(memberToBan, banOptions)
    //             .then((r) => {
    //               return {
    //                 result: r,
    //                 value: r
    //                   ? `${memberToBan} has been banned by ${interaction.author} ` +
    //                   `for ${banDays} ${banDays > 1 ? 'days' : 'day'}, because: *${banReason}*`
    //                   : `${memberToBan} is not bannable`,
    //               };
    //             })
    //             .catch((e) => {
    //               return {
    //                 result: false,
    //                 value:
    //                   `failed to ban member ${memberToBan}\n` +
    //                   `Portal's role must be higher than member you want to ban: ${e}`,
    //               };
    //             });
    //         } else {
    //           return {
    //             result: false,
    //             value: `user ${memberToBan} will not be banned`,
    //           };
    //         }
    //       })
    //       .catch((e) => {
    //         return {
    //           result: false,
    //           value: `failed to ban: ${e}`,
    //         };
    //       });
    //   } else {
    //     return {
    //       result: false,
    //       value: `could not find member`,
    //     };
    //   }
    // } else {
    //   return {
    //     result: false,
    //     value: `no user mentioned to ban`,
    //   };
    // }
  },
};
