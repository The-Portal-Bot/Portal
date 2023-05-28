import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { getJSONFromString, isMod, messageHelp } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('generate an invite link')
    .addStringOption(option =>
      option
        .setName('invite_options_string')
        .setDescription('JSON string of invite options')
        .setRequired(true))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const inviteOptionsString = interaction.options.getString('invite_options_string');

    if (!inviteOptionsString) {
      return {
        result: false,
        value: messageHelp('commands', 'invite', 'invite options string is required'),
      };
    }

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
        value: `you must be a Portal moderator to ban users`,
      };
    }

    const inviteOptionsJSON = getJSONFromString(inviteOptionsString);

    if (!inviteOptionsJSON) {
      return {
        result: false,
        value: messageHelp('commands', 'invite', 'must be in JSON format'),
      };
    }

    const inviteOptions = inviteOptionsJSON;
    if (
      !(
        inviteOptions.temporary ||
        inviteOptions.maxAge ||
        (inviteOptions.maxUses && inviteOptions.unique) ||
        inviteOptions.reason
      )
    ) {
      return {
        result: false,
        value: messageHelp('commands', 'invite', 'JSON syntax has spelling errors'),
      };
    }

    const createdInvite = await (<TextChannel>interaction.channel).createInvite(inviteOptions);

    if (!createdInvite) {
      return {
        result: false,
        value: `failed to remove ignore channel`,
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
};
