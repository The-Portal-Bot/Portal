import { Message } from "discord.js";
import { create_focus_channel, includedInVoiceList, moveMembersBack } from "../../libraries/guild.library";
import { askForApproval, messageHelp } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('focus')
		.setDescription('creates a dedicated channel for two users to privately talk in'),
	async execute(
		message: Message, args: string[], pGuild: PGuild
	): Promise<ReturnPromise> {
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
			return Promise.reject(messageHelp('commands', 'focus', 'you can *only* use focus in channels with *more* than 2 members'));
		}

		const arg_a = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1).replace(/\s/g, ' ');
		const arg_b = args.join(' ').substring(args.join(' ').indexOf('|')).replace(/\s/g, ' ');

		const focus_name = (arg_a === '' ? arg_b : arg_a).trim();
		const focus_time = arg_a === '' ? 0 : parseFloat(arg_b);

		if (isNaN(focus_time)) {
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

		const member_to_focus = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

		if (!member_to_focus) {
			return Promise.reject(`could not find "**${focus_name}**" in current voice channel`);
		}

		if (message.member === member_to_focus) {
			return Promise.reject(messageHelp('commands', 'focus', 'you can\'t focus on yourself'));
		}

		if (message.member.voice.channel !== member_to_focus.voice.channel) {
			return Promise.reject(messageHelp('commands', 'focus', 'you can\'t focus on user from another channel'));
		}

		const gotApproval = await askForApproval(
			message,
			member_to_focus,
			`*${member_to_focus.user}, member ${message.author}, would like to talk in ` +
			`private${focus_time === 0 ? '' : ` for ${focus_time}'`}*, do you **(yes / no)** ?`
		)
			.catch(e => { return Promise.reject(`failed to get approval: ${e}`); });

		if (!gotApproval) {
			return Promise.reject('user declined the request');
		}

		if (!message.guild) {
			return Promise.reject('could not fetch message\'s guild');
		}

		if (!message.member) {
			return Promise.reject('could not fetch message\'s member');
		}

		const portal_object = pGuild.pChannels.find(p =>
			p.voiceList.some(v => v.id === message.member?.voice.channel?.id)
		);

		if (!portal_object) {
			return Promise.reject('could not find member\'s portal channel');
		}

		const oldChannel = message.member.voice.channel;
		const focusChannelOutcome = await create_focus_channel(message.guild, message.member, member_to_focus, focus_time, portal_object)
			.catch(e => {
				return Promise.reject(`error while creating focus channel ${e}`);
			});

		setTimeout(async () => {
			if (!message.member) {
				return Promise.reject('could not fetch message\'s member');
			}

			const movedMembers = await moveMembersBack(oldChannel, message.member, member_to_focus)
				.catch(e => { return Promise.reject(e); });

			if (!movedMembers) {
				return Promise.reject('could not move members back');
			}
		}, focus_time * 60 * 1000);

		return {
			result: true,
			value: focusChannelOutcome
		}
	}
};
