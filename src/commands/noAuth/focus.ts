import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { messageHelp } from '../../libraries/help.library';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';
import { Command } from '../../types/Command';

const COMMAND_NAME = 'focus';
const DESCRIPTION = 'creates a dedicated channel for two users to privately talk in';

export default {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addUserOption((option) => option.setName('member').setDescription('member to focus on').setRequired(true))
    .addNumberOption((option) => option.setName('duration').setDescription('duration in seconds').setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
    const member = interaction.options.getMember('member');
    const duration = interaction.options.getNumber('duration');

    if (!member) {
      return {
        result: false,
        value: messageHelp('commands', COMMAND_NAME, 'user must be provided'),
      };
    }

    if (!duration) {
      return {
        result: false,
        value: messageHelp('commands', COMMAND_NAME, 'duration must be provided'),
      };
    }

    return {
      result: false,
      value: 'focus is currently disabled',
    };

    // if (!member.voice.channel) {
    //   return Promise.reject(messageHelp('commands', 'focus', 'you must be in a channel handled by Portal'));
    // }

    // if (!includedInVoiceList(member.voice.channel.id, pGuild.pChannels)) {
    //   return Promise.reject(messageHelp('commands', 'focus', 'the channel you are in is not handled by Portal'));
    // }

    // if (member.voice.channel.members.size <= 2) {
    //   return Promise.reject(
    //     messageHelp('commands', 'focus', 'you can *only* use focus in channels with *more* than 2 members')
    //   );
    // }

    // const argA = args
    //   .join(' ')
    //   .substring(0, args.join(' ').indexOf('|') - 1)
    //   .replace(/\s/g, ' ');
    // const argB = args.join(' ').substring(args.join(' ').indexOf('|')).replace(/\s/g, ' ');

    // const focusName = (argA === '' ? argB : argA).trim();
    // const focusTime = argA === '' ? 0 : parseFloat(argB);

    // if (isNaN(focusTime)) {
    //   return Promise.reject(messageHelp('commands', 'focus', 'focus time must be a number'));
    // }

    // if (!interaction.mentions) {
    //   return Promise.reject('no user mentioned to focus');
    // }

    // if (!interaction.mentions.members) {
    //   return Promise.reject('no user mentioned to focus');
    // }

    // if (!interaction.guild) {
    //   return Promise.reject('user guild could not be fetched');
    // }

    // if (interaction.mentions.members.size === 0) {
    //   return Promise.reject(messageHelp('commands', 'focus', 'you must tag a member'));
    // }

    // const memberToFocus = interaction.mentions.members.first() || interaction.guild.members.cache.get(args[0]);

    // if (!memberToFocus) {
    //   return Promise.reject(`could not find "**${focusName}**" in current voice channel`);
    // }

    // if (member === memberToFocus) {
    //   return Promise.reject(messageHelp('commands', 'focus', 'you can\'t focus on yourself'));
    // }

    // if (member.voice.channel !== memberToFocus.voice.channel) {
    //   return Promise.reject(messageHelp('commands', 'focus', 'you can\'t focus on user from another channel'));
    // }

    // const gotApproval = await askForApproval(
    //   interaction,
    //   memberToFocus,
    //   `*${memberToFocus.user}, member ${interaction.user}, would like to talk in ` +
    //     `private${focusTime === 0 ? '' : ` for ${focusTime}'`}*, do you **(yes / no)** ?`
    // ).catch((e) => {
    //   return Promise.reject(`failed to get approval: ${e}`);
    // });

    // if (!gotApproval) {
    //   return Promise.reject('user declined the request');
    // }

    // if (!interaction.guild) {
    //   return Promise.reject('could not fetch message\'s guild');
    // }

    // if (!member) {
    //   return Promise.reject('could not fetch message\'s member');
    // }

    // const pChannel = pGuild.pChannels.find((p) => p.pVoiceChannels.some((v) => v.id === member?.voice.channel?.id));

    // if (!pChannel) {
    //   return Promise.reject('could not find member\'s portal channel');
    // }

    // const oldChannel = member.voice.channel;
    // const focusChannelOutcome = await createFocusChannel(
    //   interaction.guild,
    //   member,
    //   memberToFocus,
    //   focusTime,
    //   pChannel
    // ).catch((e) => {
    //   return Promise.reject(`error while creating focus channel ${e}`);
    // });

    // setTimeout(async () => {
    //   if (!member) {
    //     return Promise.reject('could not fetch message\'s member');
    //   }

    //   const movedMembers = await moveMembersBack(oldChannel, member, memberToFocus).catch((e) => {
    //     return Promise.reject(e);
    //   });

    //   if (!movedMembers) {
    //     return Promise.reject('could not move members back');
    //   }
    // }, focusTime * 60 * 1000);

    // return {
    //   result: true,
    //   value: focusChannelOutcome,
    // };
  },
} as Command;
