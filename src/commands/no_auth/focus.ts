import { Message } from "discord.js";
import { create_focus_channel, included_in_voice_list, moveMembersBack } from "../../libraries/guild.library";
import { ask_for_approval, message_help } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	if (!message.member) {
		return Promise.reject('message author could not be fetched');
	}

	if (!message.member.voice.channel) {
		return Promise.reject(message_help('commands', 'focus', 'you must be in a channel handled by Portal'));
	}

	if (!included_in_voice_list(message.member.voice.channel.id, guild_object.portal_list)) {
		return Promise.reject(message_help('commands', 'focus', 'the channel you are in is not handled by Portal'));
	}

	if (message.member.voice.channel.members.size <= 2) {
		return Promise.reject(message_help('commands', 'focus', 'you can *only* use focus in channels with *more* than 2 members'));
	}

	const arg_a = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1).replace(/\s/g, ' ');
	const arg_b = args.join(' ').substring(args.join(' ').indexOf('|')).replace(/\s/g, ' ');

	const focus_name = (arg_a === '' ? arg_b : arg_a).trim();
	const focus_time = arg_a === '' ? 0 : parseFloat(arg_b);

	if (isNaN(focus_time)) {
		return Promise.reject(message_help('commands', 'focus', 'focus time must be a number'));
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
		return Promise.reject(message_help('commands', 'focus', 'you must tag a member'));
	}

	const member_to_focus = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

	if (!member_to_focus) {
		return Promise.reject(`could not find "**${focus_name}**" in current voice channel`);
	}

	if (message.member === member_to_focus) {
		return Promise.reject(message_help('commands', 'focus', 'you can\'t focus on yourself'));
	}

	if (message.member.voice.channel !== member_to_focus.voice.channel) {
		return Promise.reject(message_help('commands', 'focus', 'you can\'t focus on user from another channel'));
	}

	const gotApproval = await ask_for_approval(
		message,
		member_to_focus,
		`*${member_to_focus.user}, member ${message.author}, would like to talk in ` +
		`private${focus_time === 0 ? '' : ` for ${focus_time}'`}*, do you **(yes / no)** ?`
	)
		.catch(e => Promise.reject(`failed Promise.reject(to focus / ${e}`));

	if (!gotApproval) {
		return Promise.reject('user declined the request');
	}

	if (!message.guild) {
		return Promise.reject('could not fetch message\'s guild');
	}

	if (!message.member) {
		return Promise.reject('could not fetch message\'s member');
	}

	const portal_object = guild_object.portal_list.find(p =>
		p.voice_list.some(v => v.id === message.member?.voice.channel?.id)
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
			.catch((e: string) => Promise.reject(e));

		if (!movedMembers) {
			return Promise.reject('could not move members back');
		}
	}, focus_time * 60 * 1000);

	return {
		result: true,
		value: focusChannelOutcome
	}
};
