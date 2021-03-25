import { GuildMember, Message } from "discord.js";
import { create_focus_channel, included_in_voice_list } from "../../libraries/guild.library";
import { message_help } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

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
			.catch(() => {
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
				value: message_help('commands', 'focus', 'message author could not be fetched')
			});

		if (!message.member.voice.channel) {
			return resolve({
				result: false,
				value: message_help('commands', 'focus', 'you must be in a channel handled by Portal')
			});
		}

		if (!included_in_voice_list(message.member.voice.channel.id, guild_object.portal_list)) {
			return resolve({
				result: false,
				value: message_help('commands', 'focus', 'the channel you are in is not handled by Portal')
			});
		}

		if (message.member.voice.channel.members.size <= 2) {
			return resolve({
				result: false,
				value: message_help('commands', 'focus', 'you can *only* use focus in channels with *more* than 2 members')
			});
		}

		const arg_a = args.join(' ').substr(0, args.join(' ').indexOf('|')).replace(/\s/g, ' ');
		const arg_b = args.join(' ').substr(args.join(' ').indexOf('|') + 1).replace(/\s/g, ' ');

		const focus_name = (arg_a === '' ? arg_b : arg_a).trim();
		const focus_time = arg_a === '' ? 0 : parseFloat(arg_b);

		if (isNaN(focus_time)) {
			return resolve({
				result: false,
				value: message_help('commands', 'focus', 'focus time must be a number')
			});
		}

		if (message.mentions) {
			if (message.mentions.members) {
				if (message.guild) {
					if (message.mentions.members.array().length === 0) {
						return resolve({
							result: false,
							value: message_help('commands', 'focus', `you must tag a member`)
						});
					}

					const member_to_focus = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

					if (member_to_focus) {
						if (message.member === member_to_focus) {
							return resolve({
								result: false,
								value: message_help('commands', 'focus', `you can't focus on yourself`)
							});
						}

						ask_for_focus(message, member_to_focus, focus_time)
							.then(result => {
								if (result) {
									if (!message.guild) {
										return resolve({
											result: false,
											value: message_help('commands', 'focus', 'could not fetch message\'s guild')
										});
									}

									if (!message.member) {
										return resolve({
											result: false,
											value: message_help('commands', 'focus', 'could not fetch message\'s member')
										});
									}

									const portal_object = guild_object.portal_list.find(p => {
										return p.voice_list.some(v => v.id === message.member?.voice.channel?.id);
									});

									if (!portal_object) {
										return resolve({
											result: false,
											value: message_help('commands', 'focus', 'could not find member\'s portal channel')
										});
									}

									create_focus_channel(message.guild, message.member, member_to_focus, focus_time, portal_object)
										.then(return_value => {
											return resolve(return_value);
										})
										.catch(e => {
											return resolve({
												result: false,
												value: message_help('commands', 'focus', `error while creating focus channel ${e}`)
											});
										});
								} else {
									return resolve({
										result: false,
										value: message_help('commands', 'focus', 'user declined the request')
									});
								}
							});
					}
					else {
						return resolve({
							result: false,
							value: message_help('commands', 'focus', `could not find "**${focus_name}**" in current voice channel`)
						});
					}
				} else {
					return resolve({
						result: false,
						value: `user guild could not be fetched`
					});
				}
			} else {
				return resolve({
					result: false,
					value: `no user mentioned to focus`
				});
			}
		} else {
			return resolve({
				result: false,
				value: `no user mentioned to focus`
			});
		}
	});
};
