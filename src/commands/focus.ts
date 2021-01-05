import { Client, GuildMember, Message } from "discord.js";
import { create_focus_channel, included_in_voice_list } from "../libraries/guildOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

const ask_for_focus = async function (message: Message, requester: GuildMember, focus_time: number) {
	return new Promise((resolve) => {

		message.channel
			.send(`${requester.user}, member ${message.author}, would like to talk in ` +
				`private for ${focus_time}, do you (yes / no) ?`)
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
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		if (!message.member) {
			return resolve({ result: true, value: 'message author could not be fetched' });
		}
		const current_portal_list = guild_object.portal_list;

		if (message.member.voice.channel === undefined || message.member.voice.channel === null) {
			return resolve({
				result: false,
				value: 'you must be in a channel handled by Portal™.',
			});
		}
		else if (!included_in_voice_list(message.member.voice.channel.id, current_portal_list)) {
			return resolve({
				result: false,
				value: 'the channel you are in is not handled by Portal™.',
			});
		}

		const arg_a = args.join(' ').substr(0, args.join(' ').indexOf('|')).replace(/\s/g, ' ');
		const arg_b = args.join(' ').substr(args.join(' ').indexOf('|') + 1).replace(/\s/g, ' ');

		const focus_name = (arg_a === '' ? arg_b : arg_a).trim();
		const focus_time = arg_a === '' ? 5 : parseInt(arg_b);

		if (focus_name === '') {
			return resolve({ result: false, value: 'you must give a member name.' });
		}
		if (isNaN(focus_time)) {
			return resolve({ result: false, value: 'focus time must be a number.' });
		}

		const member_object = message.member.voice.channel.members.find(member => {
			if (message.member && member.id !== message.member.id) {
				if (member.displayName === focus_name) return true;
				if (member.id === focus_name) return true;
			}
			return false;
		});

		if (member_object) {
			ask_for_focus(message, member_object, focus_time)
				.then(result => {
					if (result) {
						if (!message.guild) {
							return resolve({ result: false, value: 'could not fetch message\'s guild' });
						}
						if (!message.member) {
							return resolve({ result: false, value: 'could not fetch message\'s member' });
						}
						create_focus_channel(message.guild, message.member, member_object, focus_time)
							.then(return_value => { return resolve(return_value); });
					}
				});
		}
		else {
			return resolve({ result: false, value: `could not find "**${focus_name}**" in current voice channel.` });
		}
	});
};
