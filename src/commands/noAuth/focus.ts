import { Message } from 'discord.js';
import { createFocusChannel, includedInVoiceList, moveMembersBack } from '../../libraries/guild.library';
import { askForApproval, messageHelp } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder()
    .setName('focus')
    .setDescription('creates a dedicated channel for two users to privately talk in'),
  async execute(message: Message, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    if (!message.member) {
      return Promise.reject('message author could not be fetched');
    }

    if (!message.member.voice.channel) {
      return Promise.reject(messageHelp('commands', 'focus', 'you must be in a channel handled by Portal'));
    }

    if (!includedInVoiceList(message.member.voice.channel.id, pGuild.pChannels)) {
      return Promise.reject(messageHelp('commands', 'focus', 'the channel you are in is not handled by Portal'));
    }

    if (message.member.voice.channel.members.size <= 2) {
      return Promise.reject(
        messageHelp('commands', 'focus', 'you can *only* use focus in channels with *more* than 2 members')
      );
    }

    const argA = args
      .join(' ')
      .substring(0, args.join(' ').indexOf('|') - 1)
      .replace(/\s/g, ' ');
    const argB = args.join(' ').substring(args.join(' ').indexOf('|')).replace(/\s/g, ' ');

    const focusName = (argA === '' ? argB : argA).trim();
    const focusTime = argA === '' ? 0 : parseFloat(argB);

    if (isNaN(focusTime)) {
      return Promise.reject(messageHelp('commands', 'focus', 'focus time must be a number'));
    }

    if (!message.mentions) {
      return Promise.reject('no user mentioned to focus');
    }

    if (!message.mentions.members) {
      return Promise.reject('no user mentioned to focus');
    }

    if (!message.guild) {
      return Promise.reject('user guild could not be fetched');
    }

    if (message.mentions.members.size === 0) {
      return Promise.reject(messageHelp('commands', 'focus', 'you must tag a member'));
    }

    const memberToFocus = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!memberToFocus) {
      return Promise.reject(`could not find "**${focusName}**" in current voice channel`);
    }

    if (message.member === memberToFocus) {
      return Promise.reject(messageHelp('commands', 'focus', "you can't focus on yourself"));
    }

    if (message.member.voice.channel !== memberToFocus.voice.channel) {
      return Promise.reject(messageHelp('commands', 'focus', "you can't focus on user from another channel"));
    }

    const gotApproval = await askForApproval(
      message,
      memberToFocus,
      `*${memberToFocus.user}, member ${message.author}, would like to talk in ` +
        `private${focusTime === 0 ? '' : ` for ${focusTime}'`}*, do you **(yes / no)** ?`
    ).catch((e) => {
      return Promise.reject(`failed to get approval: ${e}`);
    });

    if (!gotApproval) {
      return Promise.reject('user declined the request');
    }

    if (!message.guild) {
      return Promise.reject("could not fetch message's guild");
    }

    if (!message.member) {
      return Promise.reject("could not fetch message's member");
    }

    const pChannel = pGuild.pChannels.find((p) =>
      p.pVoiceChannels.some((v) => v.id === message.member?.voice.channel?.id)
    );

    if (!pChannel) {
      return Promise.reject("could not find member's portal channel");
    }

    const oldChannel = message.member.voice.channel;
    const focusChannelOutcome = await createFocusChannel(
      message.guild,
      message.member,
      memberToFocus,
      focusTime,
      pChannel
    ).catch((e) => {
      return Promise.reject(`error while creating focus channel ${e}`);
    });

    setTimeout(async () => {
      if (!message.member) {
        return Promise.reject("could not fetch message's member");
      }

      const movedMembers = await moveMembersBack(oldChannel, message.member, memberToFocus).catch((e) => {
        return Promise.reject(e);
      });

      if (!movedMembers) {
        return Promise.reject('could not move members back');
      }
    }, focusTime * 60 * 1000);

    return {
      result: true,
      value: focusChannelOutcome,
    };
  },
};
