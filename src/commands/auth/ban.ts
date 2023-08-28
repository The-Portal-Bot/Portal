import { SlashCommandBuilder } from '@discordjs/builders';
import { BanOptions, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { askForApproval, isMod, messageHelp } from '../../libraries/help.library';
import { ban } from '../../libraries/user.library';
import { Command } from '../../types/Command';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'ban';
const DESCRIPTION = 'ban a user';

export = {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.MEMBER,
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addUserOption(option =>
      option
        .setName('user_to_ban')
        .setDescription('user to ban')
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('ban_days')
        .setDescription('days to ban user for')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('ban_reason')
        .setDescription('ban reason')
        .setRequired(false))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const memberToBan = interaction.options.getMember('user_to_ban') as GuildMember;
    const banDays = interaction.options.getNumber('ban_days');
    const banReason = interaction.options.getString('ban_reason');

    if (!memberToBan) {
      return {
        result: false,
        value: messageHelp('commands', 'corona', 'user must be provided'),
      };
    }

    if (!banDays) {
      return {
        result: false,
        value: messageHelp('commands', 'corona', 'days to ban must be provided'),
      };
    }

    if (!interaction.member) {
      return {
        result: false,
        value: 'message author could not be fetched',
      };
    }

    if (!isMod((interaction.member as GuildMember))) {
      return {
        result: false,
        value: 'you must be a Portal moderator to ban users',
      };
    }

    if (!interaction.guild) {
      return {
        result: false,
        value: 'user guild could not be fetched',
      };
    }

    const deleteMessageDays = banDays ?? 1;
    const reason = banReason ?? 'banned by admin';

    const approval = await askForApproval(
      interaction,
      interaction.member as GuildMember,
      `*${interaction.member}, are you sure you want to ban ` +
      `member ${memberToBan}*, do you **(yes / no)** ? reason : ${reason}`
    );

    if (!approval) {
      return {
        result: false,
        value: `failed to ban ${memberToBan}`,
      };
    }

    const banOptions: BanOptions = {
      deleteMessageDays,
      reason,
    };

    const banResponse = await ban(memberToBan, banOptions);

    return {
      result: !!banResponse,
      value: banResponse
        ? `${memberToBan} has been banned by ${interaction.user} ` +
        `for ${banDays} ${deleteMessageDays > 1 ? 'days' : 'day'}, because: *${reason}*`
        : `${memberToBan} is not bannable`,
    };
  },
} as Command;
