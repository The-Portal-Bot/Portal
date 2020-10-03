const Discord = require('discord.js');
const file_system = require('file-system');
const lodash = require('lodash');

// const guld_mngr = require('./guild_manager'); // circular module call doesnt work !
const lclz_mngr = require('./localization_manager');

const role_class = require('../assets/classes/role_class');

module.exports = {

	create_role_message: function(channel, role_list, title, desc, colour, role_emb, role_map) {
		const role_message_emb = this.create_rich_embed(title, desc, colour, role_emb);
		channel
			.send(role_message_emb)
			.then(sent_message => {
				for (let i = 0; i < role_map.length; i++) {
					sent_message.react(role_map[i].give);
					sent_message.react(role_map[i].strip);
				}
				role_list[sent_message.id] = new role_class(role_map);
			})
			.catch(error => console.log(error));
	},

	create_music_message: function(channel, thumbnail, guild_object) {
		const music_message_emb = this.create_rich_embed(
			'Music Player',
			'just type and I\'ll play',
			'#0000FF',
			[
				{ emote: 'Duration', role: '-', inline: true },
				{ emote: 'Views', role: '-', inline: true },
				{ emote: 'Uploaded', role: '-', inline: true },
			],
			false,
			false,
			true,
			false,
			thumbnail,
		);

		channel
			.send(music_message_emb)
			.then(sent_message => {
				sent_message.react('▶️');
				sent_message.react('⏸');
				sent_message.react('⏹');
				sent_message.react('⏭');
				sent_message.react('📜');
				sent_message.react('❌');

				guild_object.music_data.message_id = sent_message.id;
			});
	},

	update_message: function(guild, guild_object, yts) {
		const music_message_emb = this.create_rich_embed(
			yts.title,
			yts.url,
			'#0000FF',
			[
				{ emote: 'Duration', role: yts.timestamp, inline: true },
				{ emote: 'Views', role: yts.views, inline: true },
				{ emote: 'Uploaded', role: yts.ago, inline: true },
			],
			false,
			false,
			true,
			false,
			yts.thumbnail,
		);
		const channel = guild_object.channels.cache.get(guild.music_data.channel_id);

		if(channel) {
			channel.messages.channel.messages
				.fetch(guild.music_data.message_id)
				.then(message => {
					message.edit(music_message_emb)
						.then(msg =>
							console.log(`Updated the content of a message to ${msg.content}`))
						.catch(console.error);
				})
				.catch(console.error);
		}
	},

	join_user_voice: async function(client, message, portal_guilds, join) { // localize
		return new Promise((resolve) => {
			const current_voice = message.member.voice.channel;

			if (current_voice === null) {
				return resolve ({ result: false, value: 'you are not connected to any channel.' });
			}

			if (current_voice.guild.id !== message.guild.id) {
				return resolve ({ result: false, value: 'your current channel is on another guild.' });
			}
			const portal_list = portal_guilds[message.guild.id].portal_list;

			let included_in_voice_list = false;
			for (const key in portal_list) {
				if (portal_list[key].voice_list[current_voice.id]) {included_in_voice_list = true;}
			}

			if (!included_in_voice_list) {
				console.log('I can only connect to my channels.');
				return resolve ({ result: false, value: 'I can only connect to my channels.' });
			}

			const existing_voice_connection = client.voice.connections.find(connection =>
				connection.channel.id === message.member.voice.channel.id);

			if (existing_voice_connection) {
				return resolve ({
					result: true,
					value: 'already in voice channel',
					voice_connection: existing_voice_connection,
				});
			}

			// let new_voice_connection = null;
			current_voice.join()
				.then(conn => {
					if(join) lclz_mngr.client_talk(client, portal_guilds, 'join');

					return resolve ({
						result: true,
						value: lclz_mngr.client_write(message, portal_guilds, 'join'),
						voice_connection: conn,
					});
				})
				.catch(e => { console.log('ERRROINO: ', e); });
		});
	},

	getJSON: function(str) {
		let data = null;
		try {
			data = JSON.parse(str);
		}
		catch (error) {
			return null;
		}

		return data;
	},

	create_rich_embed: function(title, description, colour, field_array, thumbnail, member, from_bot, url, image) {
		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';
		const keybraker_url = 'https://github.com/keybraker';

		const rich_message = new Discord.MessageEmbed()
			.setTimestamp();
			// .setAuthor('Portal', portal_icon_url, keybraker_url)

		if(title) {
			rich_message
				.setTitle(title);
		}
		if(url) {
			rich_message
				.setURL(url);
		}
		if(colour) {
			rich_message
				.setColor(colour);
		}
		if(description) {
			rich_message
				.setDescription(description);
		}
		if (from_bot) {
			rich_message
				.setFooter('Portal bot by Keybraker', portal_icon_url, keybraker_url);
		}
		if (member) {
			rich_message
				.setAuthor(member.displayName, member.user.avatarURL());
		}
		if (thumbnail) {
			rich_message
				.setThumbnail(thumbnail);
		}
		if (image) {
			rich_message
				.setImage(image);
		}

		if (field_array) {
			field_array.forEach(row => {
				rich_message
					.addField(
						(row.emote === '' || row.emote === null || row.emote === false)
							? '\u200b'
							: '`' + row.emote + '`',
						(row.role === '' || row.role === null || row.role === false)
							? '\u200b'
							: row.role,
						row.inline,
					);
			});
		}
		else {
			rich_message.addField('\u200b', '\u200b');
		}

		return rich_message;
	},

	empty_channel_remover: function(current_guild, portal_guilds, portal_managed_guilds_path) {
		current_guild.channels.cache.forEach(channel => {
			if(portal_guilds[current_guild.id]) {
				for(const portal_channel in portal_guilds[current_guild.id].portal_list) {
					if(portal_guilds[current_guild.id].portal_list[portal_channel].voice_list[channel.id]) {
						if(!channel.members.size) {
							console.log('Deleting channel: ', channel.name, 'from ', channel.guild.name);
							// guld_mngr.delete_channel(channel);
							if (channel.deletable) {
								channel
									.delete()
									.then(g => console.log(`Deleted channel with id: ${g}`))
									.catch(console.error);
							}
							return true;
						}
					}
					return false;
				}
			}
			else {
				current_guild.leave()
					.then(guild => console.log(`Left guild ${guild}`))
					.catch(console.error);
			}
		});

		this.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds);
	},

	update_portal_managed_guilds: async function(force, portal_managed_guilds_path, portal_guilds) {
		return new Promise((resolve) => { // , reject) => {
			setTimeout(() => {
				const portal_guilds_no_voice = lodash.cloneDeep(portal_guilds);
				for(const guild_id in portal_guilds_no_voice) {
					portal_guilds_no_voice[guild_id].dispatcher = null;
				}

				if (force) {
					file_system.writeFileSync(
						portal_managed_guilds_path,
						JSON.stringify(portal_guilds_no_voice),
						'utf8',
					);
				}
				else {
					file_system.writeFile(
						portal_managed_guilds_path,
						JSON.stringify(portal_guilds_no_voice),
						'utf8',
					);
				}
			}, 1000);
			return resolve ({ result: true, value: '*updated portal guild json.*' });
		});
	},

	is_authorized: function(auth_role, member) {
		return !member.hasPermission('ADMINISTRATOR')
			? member.roles.cache !== undefined && member.roles.cache !== null
				? member.roles.cache.some(role =>
					auth_role
						? auth_role.some(auth => auth === role.id)
						: false)
				: false
			: true;
	},

	// channel should be removed !
	message_reply: function(status, channel, message, user, str, portal_guilds,
		client, to_delete = true, emote_pass = '✔️', emote_fail = '❌') {
		if (!message.channel.deleted) {
			message.channel
				.send(`${user}, ${str}`)
				.then(msg => { msg.delete({ timeout: 5000 }); })
				.catch(error => console.log(error));
		}
		if (!message.deleted) {
			if (status === true) {
				message
					.react(emote_pass)
					.catch(error => console.log(error));
				if(to_delete) {
					message
						.delete({ timeout: 5000 })
						.catch(error => console.log(error));
				}
			}
			else if (status === false) {
				lclz_mngr.client_talk(client, portal_guilds, 'fail');
				message
					.react(emote_fail)
					.catch(error => console.log(error));
				if(to_delete) {
					message
						.delete({ timeout: 5000 })
						.catch(error => console.log(error));
				}
			}
		}
	},

	is_url: function(potential_url) {
		const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

		return pattern.test(potential_url);
	},

	pad: function(num) {
		if (num.toString().length >= 2) {
			return num;
		}
		else {
			return '0' + num;
		}
	},

	time_elapsed: function(timestamp, timeout) {
		const time_elapsed = Date.now() - timestamp;
		const timeout_time = timeout * 60 * 1000;

		const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0
			? Math.round((timeout_time / 1000 / 60))
			: 0;
		const timeout_sec = Math.round((timeout_time / 1000) % 60);

		const remaining_hrs = Math.round(
			(time_elapsed / 1000 / 60 / 60)) > 0
			? Math.round((time_elapsed / 1000 / 60 / 60))
			: 0;
		const remaining_min = Math.round(
			(time_elapsed / 1000 / 60) - 1) > 0
			? Math.round((time_elapsed / 1000 / 60) - 1)
			: 0;
		const remaining_sec = Math.round(
			(time_elapsed / 1000) % 60) > 0
			? Math.round((time_elapsed / 1000) % 60)
			: 0;

		return { timeout_min, timeout_sec, remaining_hrs, remaining_min, remaining_sec };
	},

	time_remaining: function(timestamp, timeout) {
		const time_elapsed = Date.now() - timestamp;
		const timeout_time = timeout * 60 * 1000;
		const time_remaining = timeout_time - time_elapsed;

		const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0
			? Math.round((timeout_time / 1000 / 60))
			: 0;
		const timeout_sec = Math.round((timeout_time / 1000) % 60)
			? Math.round((timeout_time / 1000) % 60)
			: 0;
		const remaining_min = Math.round((time_remaining / 1000 / 60) - 1) > 0
			? Math.round((time_remaining / 1000 / 60) - 1)
			: 0;

		const remaining_sec = Math.round((time_remaining / 1000) % 60);

		return { timeout_min, timeout_sec, remaining_min, remaining_sec };
	},

};