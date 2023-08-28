import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, InviteCreateOptions, TextChannel } from 'discord.js';
import { isMod, messageHelp } from '../../libraries/help.library';
import { Command } from '../../types/Command';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'invite';
const DESCRIPTION = 'generate an invite link';

export = {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addBooleanOption(option =>
      option
        .setName('temporary')
        .setDescription('should invite be temporary')
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('max_age')
        .setDescription('what the maximum age of the invitee shall be')
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('max_uses')
        .setDescription('maximum usages')
        .setRequired(true))
    .addBooleanOption(option =>
      option
        .setName('unique')
        .setDescription('should invite be unique')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('the reason for the invite')
        .setRequired(true))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const member = interaction.member as GuildMember;
    if (!interaction.guild) {
      return {
        result: false,
        value: 'guild could not be fetched',
      };
    }

    if (!member) {
      return {
        result: false,
        value: 'member could not be fetched',
      };
    }

    if (!isMod(member)) {
      return {
        result: false,
        value: 'you must be a Portal moderator to invite users',
      };
    }

    const temporary = interaction.options.getBoolean('temporary');
    const maxAge = interaction.options.getNumber('max_age');
    const maxUses = interaction.options.getNumber('max_uses');
    const unique = interaction.options.getBoolean('unique');
    const reason = interaction.options.getString('reason');

    if (!(temporary && maxAge && maxUses && unique && reason)) {
      return {
        result: false,
        value: messageHelp('commands', 'invite', 'all invite options are required'),
      };
    }

    const inviteCreationOptions: InviteCreateOptions = {
      temporary,
      maxAge,
      maxUses,
      unique,
      reason,
    }

    const createdInvite = await (<TextChannel>interaction.channel).createInvite(inviteCreationOptions);

    if (!createdInvite) {
      return {
        result: false,
        value: 'failed to remove ignore channel',
      };
    }

    const sentMessage = await member?.send(`https://discord.gg/${createdInvite.code}`);

    if (!sentMessage) {
      return {
        result: false,
        value: 'failed to remove ignore channel',
      };
    }

    return {
      result: true,
      value: 'I sent you an invite as a private message',
    };
  },
} as Command;
