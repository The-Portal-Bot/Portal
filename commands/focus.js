/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-cond-assign */
const guld_mngr = require('../functions/guild_manager');

const ask_member_to_join = function(requester, member_to_join) {
	member_to_join
		.send(`${requester}, would like to talk to you, do you want ** (yes / no) ?`)
		.then(question_msg => {
			const filter = m => m.author.id === author.id;
			const collector = message.channel.createMessageCollector(filter, { time: 10000 });

			collector.on('collect', m => {
				if(m.content === 'yes') {
					if (channel_to_delete.deletable) {
						channel_to_delete
							.delete()
							.then(g => console.log(`Deleted channel with id: ${g}`))
							.catch(console.error);

						m.channel.send(`Deleted channel **"${channel_to_delete_name}"**.`)
							.then(msg => { msg.delete({ timeout: 5000 }); })
							.catch(error => console.log(error));

						channel_deleted = true;
					}
					else {
						message.channel.send(`Channel **"${channel_to_delete}"** is not deletable.`)
							.then(msg => { msg.delete({ timeout: 5000 }); })
							.catch(error => console.log(error));
					}
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
				if (!channel_deleted) {
					message.channel.send(`Channel **"${channel_to_delete}"** will not be deleted.`)
						.then(msg => { msg.delete({ timeout: 5000 }); })
						.catch(error => console.log(error));
				}
				question_msg.delete({ timeout: 5000 });
			});
		})
		.catch(error => console.log(error));
};

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
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
			console.log(`${member.displayName} === ${focus_name}`);
			if (member.displayName === focus_name || member.id === focus_name) {
				return true;
			}
		});

		if (member_found) {
			guld_mngr.create_focus_channel(message.guild, message.member, member_found, focus_time)
				.then(return_value => {
					console.log('perasa');
					return resolve (return_value);
				});
		}
		else {
			return resolve ({ result: false, value: `*could not find **"${focus_name}"** in current voice channel.*` });
		}
	});
};
