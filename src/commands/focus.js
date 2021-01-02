/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-cond-assign */
const { Client, Message } = require('discord.js');
const guld_mngr = require('../libraries/guild_manager');

const ask_for_focus = async function(message, requester, focus_time) {
	return new Promise((resolve) => {

		message.channel
			.send(`${requester.user}, member ${message.author}, would like to talk in ` +
				`private for ${focus_time}, do you (yes / no) ?`)
			.then(question_msg => {
				let reply = false;
				const filter = m => m.author.id === requester.user.id;
				const collector = message.channel.createMessageCollector(filter, { time: 10000 });

				collector.on('collect', m => {
					if(m.content === 'yes') {
						reply = true;
						collector.stop();
					}
					else if(m.content === 'no') {
						collector.stop();
					}
				});

				collector.on('end', collected => {
					for (const reply_message of collected.values()) {
						if (reply_message.deletable) {
							reply_message.delete().catch(console.error);
						}
					}
					if(question_msg.deletable) {
						question_msg.delete();
					}
					return resolve (reply);
				});
			})
			.catch(error => {
				return resolve (false);
			});
	});
};

module.exports = async (client: Client, message: Message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const current_portal_list = portal_guilds[message.guild.id].portal_list;

		if (message.member.voice.channel === undefined || message.member.voice.channel === null) {
			return resolve({
				result: false,
				value: '*you must be in a channel handled by* **Portal™***.*',
			});
		}
		else if (!guld_mngr.included_in_voice_list(message.member.voice.channel.id, current_portal_list)) {
			return resolve({
				result: false,
				value: '*the channel you are in is not handled by* **Portal™***.*',
			});
		}

		let focus_name = args.join(' ').substr(0, args.join(' ').indexOf('|')).replace(/\s/g, '');
		let focus_time = args.join(' ').substr(args.join(' ').indexOf('|') + 1).replace(/\s/g, '');

		if (focus_name === '') {
			focus_name = focus_time;
			focus_time = 5;
		}

		if (focus_name === '') {
			return resolve ({ result: false, value: '*you must give a member name.*' });
		}
		if (isNaN(focus_time)) {
			return resolve ({ result: false, value: '*focus time must be a number.*' });
		}

		const member_found = message.member.voice.channel.members.find(member => {
			if (member.displayName === focus_name || member.id === focus_name) {
				return true;
			}
		});

		if (member_found) {
			ask_for_focus(message, member_found, focus_time)
				.then(result => {
					if(result) {
						guld_mngr.create_focus_channel(message.guild, message.member, member_found, focus_time)
							.then(return_value => {
								return resolve (return_value);
							});
					}
				});
		}
		else {
			return resolve ({ result: false, value: `*could not find **"${focus_name}"** in current voice channel.*` });
		}
	});
};
