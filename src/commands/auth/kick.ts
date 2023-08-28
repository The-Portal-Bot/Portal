import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types/Command';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'kick';
const DESCRIPTION = 'kick a user';

export = {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION),
  async execute(/* interaction: ChatInputCommandInteraction */): Promise<ReturnPromise> {
    return {
      result: false,
      value: 'not yet implemented',
    };

    // const member = interaction.member as GuildMember;
    // if (!member) {
    //   return {
    //     result: false,
    //     value: 'message author could not be fetched',
    //   };
    // }

    // if (!isMod(member)) {
    //   return {
    //     result: false,
    //     value: `you must be a Portal moderator to kick users`,
    //   };
    // }

    // if (!interaction.guild) {
    //   return {
    //     result: false,
    //     value: `user guild could not be fetched`,
    //   };
    // }

    // let kickReason = args
    //   .join(' ')
    //   .substring(args.join(' ').indexOf('|') + 1)
    //   .replace(/\s/g, ' ')
    //   .trim();

    // if (kickReason === '') {
    //   kickReason = 'kicked by admin';
    // }

    // if (interaction.mentions && interaction.mentions.members) {
    //   if (interaction.mentions.members.size === 0) {
    //     return {
    //       result: false,
    //       value: messageHelp('commands', 'kick', `you must tag a member`),
    //     };
    //   }

    //   const memberToKick = interaction.mentions.members.first() || interaction.guild.members.cache.get(args[0]);

    //   if (memberToKick) {
    //     if (member === memberToKick) {
    //       return {
    //         result: false,
    //         value: messageHelp('commands', 'kick', `you can't kick on yourself`),
    //       };
    //     }

    //     askForApproval(
    //       interaction,
    //       member,
    //       `*${member}, are you sure you want to kick ` + `user ${memberToKick}*, do you **(yes / no)** ?`
    //     )
    //       .then((result) => {
    //         if (result) {
    //           kick(memberToKick, kickReason)
    //             .then((r) => {
    //               return {
    //                 result: r,
    //                 value: r
    //                   ? `${memberToKick} has been kicked by ${interaction.author} ` + `because: *${kickReason}*`
    //                   : `${memberToKick} is not kickable`,
    //               };
    //             })
    //             .catch((e) => {
    //               return {
    //                 result: false,
    //                 value:
    //                   `failed to kick member ${memberToKick}, ` +
    //                   `Portal's role must be higher than member you want to kick: ${e}`,
    //               };
    //             });
    //         } else {
    //           return {
    //             result: false,
    //             value: `user ${memberToKick} will not be kicked`,
    //           };
    //         }
    //       })
    //       .catch((e) => {
    //         return {
    //           result: false,
    //           value: `failed to kick: ${e}`,
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
    //     value: `no user mentioned to kick`,
    //   };
    // }
  },
} as Command;
