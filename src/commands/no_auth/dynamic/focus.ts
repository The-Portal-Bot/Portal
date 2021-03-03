import { GuildMember, Message } from "discord.js";
import { create_focus_channel, included_in_voice_list } from "../../../libraries/guildOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

async function ask_for_focus(message: Message, requester: GuildMember, focus_time: number) {
	return new Promise((resolve) => {
		message.channel
			.send(`*${requester.user}, member ${message.author}, would like to talk in ` +
				`private${focus_time === 0 ? '' : ` for ${focus_time}'`}*, do you **(yes / no)** ?`)
			.then(question_msg => {
				let reply = false;
				const filter = (m: Message) => m.author.id === requester.user.id;
				const collector = message.channel.createMessageCollector(filter, { time: 10000 });

				collector.on('collect', m => {
					if (m.content === 'yes') {
						reply = true;
						collector.stop();
					}
					else if (m.content === 'no') {
						collector.stop();
					}
				});

				collector.on('end', collected => {
					for (const reply_message of collected.values()) {
						if (reply_message.deletable) {
							reply_message.delete().catch(console.error);
						}
					}
					if (question_msg.deletable) {
						question_msg.delete();
					}
					return resolve(reply);
				});
			})
			.catch((error: any) => {
				return resolve(false);
			});
	});
};

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.member)
			return resolve({
				result: true,
				value: 'message author could not be fetched'
			});

		if (!message.member.voice.channel) {
			return resolve({
				result: false,
				value: 'you must be in a channel handled by Portal',
			});
		}

		if (!included_in_voice_list(message.member.voice.channel.id, guild_object.portal_list)) {
			return resolve({
				result: false,
				value: 'the channel you are in is not handled by Portal',
			});
		}

		if (message.member.voice.channel.members.size <= 2) {
			return resolve({
				result: false,
				value: 'you can *only* use focus in channels with *more* than 2 members',
			});
		}

		const arg_a = args.join(' ').substr(0, args.join(' ').indexOf('|')).replace(/\s/g, ' ');
		const arg_b = args.join(' ').substr(args.join(' ').indexOf('|') + 1).replace(/\s/g, ' ');

		const focus_name = (arg_a === '' ? arg_b : arg_a).trim();
		const focus_time = arg_a === '' ? 0 : parseFloat(arg_b);

		if (focus_name === '') {
			return resolve({
				result: false,
				value: 'you must give a member name'
			});
		}

		if (isNaN(focus_time)) {
			return resolve({
				result: false,
				value: 'focus time must be a number'
			});
		}

		if (message.member.id === focus_name || message.member.displayName === focus_name) {
			return resolve({
				result: false,
				value: `you can't focus on yourself`
			});
		}

		const member_object = message.member.voice.channel.members.find(member =>
			member.displayName === focus_name || member.id === focus_name);

		if (member_object) {
			ask_for_focus(message, member_object, focus_time)
				.then(result => {
					if (result) {
						if (!message.guild) {
							return resolve({
								result: false,
								value: 'could not fetch message\'s guild'
							});
						}

						if (!message.member) {
							return resolve({
								result: false,
								value: 'could not fetch message\'s member'
							});
						}

						const portal_object = guild_object.portal_list.find(p => {
							return p.voice_list.some(v => v.id === message.member?.voice.channel?.id);
						});

						if (!portal_object) {
							return resolve({
								result: false,
								value: 'could not find member\'s portal channel'
							});
						}

						create_focus_channel(message.guild, message.member, member_object, focus_time, portal_object)
							.then(return_value => {
								return resolve(return_value);
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `error while creating focus channel ${e}`
								});
							});
					} else {
						return resolve({
							result: false,
							value: 'user declined the request'
						});
					}
				});
		}
		else {
			return resolve({
				result: false,
				value: `could not find "**${focus_name}**" in current voice channel`
			});
		}
	});
};
