const voca = require('voca');

const vrbl_objct = require('../properties/variable_list');
const pipe_objct = require('../properties/pipe_list');
const attr_objct = require('../properties/attribute_list');

const guild_class = require('../assets/classes/guild_class');
const portal_class = require('../assets/classes/portal_class');
const voice_class = require('../assets/classes/voice_class');
const member_class = require('../assets/classes/member_class');

const help_mngr = require('./help_manager');
const musc_mngr = require('./music_manager');

const getOptions = function(guild, topic) {
	return {
		type: 'text',
		topic: topic,
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['SEND_MESSAGES'],
			},
		],
	};
};

module.exports = {

	included_in_portal_guilds: function(guild_id, portal_guilds) {
		if (portal_guilds[guild_id] !== undefined) {return true;}
		return false;
	},

	included_in_portal_list: function(channel_id, portal_list) {
		if (portal_list[channel_id]) {return true;}
		return false;
	},

	included_in_voice_list: function(channel_id, portal_list) {
		for (const key in portal_list) {
			if (portal_list[key].voice_list[channel_id]) {return true;}
		}
		return false;
	},

	included_in_url_list: function(channel_id, guild_object) {
		for (let i = 0; i < guild_object.url_list.length; i++) {
			if (guild_object.url_list[i] === channel_id) {return true;}
		}
		return false;
	},

	is_spotify_channel: function(channel_id, guild_object) {
		if (guild_object.spotify === channel_id) {return true;}
		return false;
	},

	is_music_channel: function(channel_id, guild_object) {
		if (guild_object.music_data.channel_id === channel_id) {return true;}
		return false;
	},

	is_announcement_channel: function(channel_id, guild_object) {
		if (guild_object.announcement === channel_id) {return true;}
		return false;
	},

	//

	is_role: function(guild, role_name) {
		const role = guild.roles.cache.find(cached_role => cached_role.name === role_name);

		if (role) {return role;}
		else {return null;}
	},

	//

	create_focus_channel: async function(guild, member, member_found, focus_time) {
		return new Promise((resolve) => {
			const return_value = { result: false, value: '*you can run "./help focus" for help.*' };

			const oldChannel = member.voice.channel;
			let newChannel = null;

			guild.channels.create(
				`${member.displayName}&${member_found.displayName}`, {
					type: 'voice',
					bitrate: 64000,
					userLimit: 2,
				})
				.then(channel => {
					newChannel = channel;
					member.voice.setChannel(channel);
					member_found.voice.setChannel(channel);

					console.log('mpika edo 1');
					return_value.result = true;
					return_value.value = 'users have been moved.';
				})
				.catch(console.error);

			setTimeout(() => {
				console.log('mpika edo 2');
				if (!oldChannel.deleted) {
					member.voice.setChannel(oldChannel)
						.then(() => {
							member_found.voice.setChannel(oldChannel)
								.then(() => {
									if (newChannel.deletable) {
										newChannel.delete().catch(console.error);
										return_value.result = true;
										return_value.value = 'focus ended properly.';
										return resolve (return_value);
									}
								}).catch(console.error);
						}).catch(console.error);


				}
				else {
					return_value.result = false;
					return_value.value = 'could not move to original channel because it was deleted.';
					return resolve (return_value);
				}
			}, focus_time * 60 * 1000);
		});
	},

	create_url_channel: function(guild, url_name, url_category, url_list) {
		if (url_category && typeof url_category === 'string') { // with category
			guild.channels
				.create(`${url_name}-url`, { type: 'text', topic: 'Portal URL-only' })
				.then(channel => {
					url_list
						.push(channel.id);
					guild.channels
						.create(url_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		}
		else if (url_category) { // with category given
			guild.channels
				.create(`${url_name}-url`, { type: 'text', topic: 'Portal URL-only' }, { parent: url_category })
				.then(channel => {
					channel.setParent(url_category);
					url_list.push(channel.id);
				})
				.catch(console.error);
		}
		else { // without category
			guild.channels
				.create(`${url_name}-url`, { type: 'text', topic: 'Portal URL-only' })
				.then(channel => url_list.push(channel.id));
		}
	},

	create_spotify_channel: function(guild, spotify_channel, spotify_category, guild_object) {
		if (spotify_category && typeof spotify_category === 'string') { // with category
			return guild.channels
				.create(
					`${spotify_channel}-sptfy`,
					getOptions(guild, 'Portal Spotify'),
				)
				.then(channel => {
					guild_object.spotify = channel.id;
					guild.channels
						.create(spotify_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		}
		else if (spotify_category) { // with category given
			return guild.channels
				.create(
					`${spotify_channel}-sptfy`,
					getOptions(guild, 'Portal Spotify'),
					{ parent: spotify_category },
				)
				.then(channel => {
					channel.setParent(spotify_category);
					guild_object.spotify = channel.id;
				})
				.catch(console.error);
		}
		else { // without category
			return guild.channels
				.create(
					`${spotify_channel}-sptfy`,
					getOptions(guild, 'Portal Spotify'),
				)
				.then(channel => {
					guild_object.spotify = channel.id;
				})
				.catch(console.error);
		}
	},

	create_music_channel: async function(guild, music_channel, music_category, guild_object) {
		const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';
		return new Promise((resolve) => {
			if (music_category && typeof music_category === 'string') { // with category
				guild.channels
					.create(
						`${music_channel}-music`,
						{
							type: 'text',
							topic: 'Portal Music, play:▶️, pause:⏸, stop:⏹, skip:⏭, list:📜, clear list:❌',
						},
					)
					.then(channel => {
						guild_object.music_data.channel_id = channel.id;
						guild.channels
							.create(music_category, { type: 'category' })
							.then(cat_channel => channel.setParent(cat_channel))
							.catch(error => resolve(error));
						help_mngr.create_music_message(
							channel,
							portal_icon_url,
							guild_object,
						);
					})
					.catch(error => resolve(error));
			}
			else if (music_category) { // with category given
				guild.channels
					.create(
						`${music_channel}-music`,
						{
							type: 'text',
							topic: 'Portal Music, play:▶️, pause:⏸, stop:⏹, skip:⏭, list:📜, clear list:❌',
						},
						{ parent: music_category },
					)
					.then(channel => {
						channel.setParent(music_category);
						guild_object.music_data.channel_id = channel.id;
						help_mngr.create_music_message(
							channel,
							portal_icon_url,
							guild_object,
						);
					})
					.catch(error => resolve(error));
			}
			else { // without category
				guild.channels
					.create(
						`${music_channel}-music`,
						{
							type: 'text',
							topic: 'Portal Music, play:▶️, pause:⏸, stop:⏹, skip:⏭, list:📜, clear list:❌',
						},
					)
					.then(channel => {
						guild_object.music_data.channel_id = channel.id;
						help_mngr.create_music_message(
							channel,
							portal_icon_url,
							guild_object,
						);
					})
					.catch(error => resolve(error));
			}
		});
	},

	create_announcement_channel: function(guild, announcement_channel, announcement_category, guild_object) {
		if (announcement_category && typeof announcement_category === 'string') { // with category
			return guild.channels
				.create(
					`${announcement_channel}-annc`,
					getOptions(guild, 'Portal Announcements'),
				)
				.then(channel => {
					guild_object.announcement = channel.id;
					guild.channels
						.create(announcement_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		}
		else if (announcement_category) { // with category given
			return guild.channels
				.create(
					`${announcement_channel}-annc`,
					getOptions(guild, 'Portal Announcements',
					),
					{ parent: announcement_category },
				)
				.then(channel => {
					channel.setParent(announcement_category);
					guild_object.announcement = channel.id;
				})
				.catch(console.error);
		}
		else { // without category
			return guild.channels
				.create(
					`${announcement_channel}-annc`,
					getOptions(guild, 'Portal Announcements'),
				)
				.then(channel => { guild_object.announcement = channel.id; })
				.catch(console.error);
		}
	},

	create_portal_channel: function(guild, portal_channel, portal_category, portal_objct, guild_object, creator_id) {
		if (portal_category && typeof portal_category === 'string') { // with category
			return guild.channels
				.create(portal_channel, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					portal_objct[channel.id] = new portal_class(
						creator_id,
						portal_channel,
						guild_object[guild.id].premium
							? 'G$#-P$member_count | $status_list'
							: 'Channel $#',
						{}, false, 0, 0, 0, guild_object[guild.id].locale, false, true,
					);
					guild.channels
						.create(portal_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		}
		else if (portal_category) { // with category given
			return guild.channels
				.create(portal_channel, { type: 'voice', bitrate: 8000 }, { parent: portal_category })
				.then(channel => {
					channel.setParent(portal_category);
					portal_objct[channel.id] = new portal_class(
						creator_id,
						portal_channel,
						guild_object[guild.id].premium
							? 'G$#-P$member_count | $status_list'
							: 'Channel $#',
						{}, false, 0, 0, 0, guild_object[guild.id].locale, false, true,
					);
				})
				.catch(console.error);
		}
		else { // without category
			return guild.channels
				.create(portal_channel, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					portal_objct[channel.id] = new portal_class(
						creator_id,
						portal_channel,
						guild_object[guild.id].premium
							? 'G$#-P$member_count | $status_list'
							: 'Channel $#',
						{}, false, 0, 0, 0, guild_object[guild.id].locale, false, true,
					);
				})
				.catch(console.error);
		}
	},

	create_voice_channel: function(state, portal_objct, portal_channel, creator_id) {
		console.log('portal_channel.position :>> ', portal_channel.position);
		state.channel.guild.channels
			.create('loading...', {
				type: 'voice',
				bitrate: 64000,
				position: portal_channel.position ? portal_channel.position : portal_channel.position + 1,
			})
			.then(channel => {
				console.log('channel.position :>> ', channel.position);
				channel.userLimit = portal_objct.user_limit_portal;
				portal_objct['voice_list'][channel.id] = new voice_class(
					creator_id, portal_objct.regex_voice, false, 0, 0,
					portal_objct.locale, portal_objct.ann_announce, portal_objct.ann_user,
				);
				if (state.channel.parentID !== null && state.channel.parentID !== undefined) {
					channel.setParent(state.channel.parentID);
				}

				state.member.voice.setChannel(channel);
			})
			.catch(console.error);

		return;
	},

	create_member_list: function(guild_id, client) {
		const member_list = {};
		const guild = client.guilds.cache.find(cached_guild => cached_guild.id === guild_id);

		guild.members.cache.forEach(member => {
			if (member.id !== '704400876860735569' && !member.user.bot) {
				member_list[member.id] = new member_class(1, 0, 0, 0, null);
			}
		});

		return member_list;
	},

	insert_guild: function(guild_id, portal_guilds, client) {
		const portal_list = {};
		const member_list = this.create_member_list(guild_id, client);
		const url_list = [];
		const role_list = {};
		const ranks = {};
		const auth_role = [];
		const spotify = null;
		const music_data = { channel_id: null, message_id: null, votes: [] };
		const music_queue = [];
		const dispatcher = null;
		const announcement = null;
		const locale = 'en';
		const announce = 0;
		const level_speed = 'normal';
		const premium = false;

		portal_guilds[guild_id] = new guild_class(portal_list, member_list, url_list, role_list, ranks, auth_role,
			spotify, music_data, music_queue, dispatcher, announcement, locale, announce, level_speed, premium);
	},

	//

	delete_guild: function(guild_id, portal_guilds) {
		delete portal_guilds[guild_id];
	},

	delete_channel: (channel_to_delete, message, isPortal = false) => {
		if(!isPortal) {
			const author = message.author;
			const channel_to_delete_name = channel_to_delete.name;
			let channel_deleted = false;

			message.channel
				.send(`${message.author}, do you wish to delete old music channel **"${channel_to_delete}"** (yes / no) ?`)
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
		}
		else if (channel_to_delete.deletable) {
			channel_to_delete
				.delete()
				.then(g => console.log(`Deleted channel with id: ${g}`))
				.catch(console.error);
		}
	},

	channel_deleted_update_state: function(channel_to_remove, guild_list) {
		const TypesOfChannel = { Unknown: 0, Portal: 1, Voice: 2, Url: 3, Spotify: 4, Announcement: 5, Music: 6 };
		const current_guild = guild_list[channel_to_remove.guild.id];
		let type_of_channel = TypesOfChannel.Unknown;

		for (const portal_id in current_guild.portal_list) {
			if (portal_id === channel_to_remove.id) {
				delete current_guild.portal_list[portal_id];
				type_of_channel = TypesOfChannel.Portal;
				break;
			}
			else {
				const current_voice_list = current_guild.portal_list[portal_id].voice_list;
				for (const voice_id in current_voice_list) {
					if (voice_id === channel_to_remove.id) {
						delete current_voice_list[voice_id];
						type_of_channel = TypesOfChannel.Voice;
						break;
					}
				}
			}
		}

		for (let i = 0; i < current_guild.url_list.length; i++) {
			console.log(`${current_guild.url_list[i]} === ${channel_to_remove.id}`);
			if (current_guild.url_list[i] === channel_to_remove.id) {
				current_guild.url_list.splice(i, 1);
				type_of_channel = TypesOfChannel.Url;
				break;
			}
		}
		if (current_guild.spotify === channel_to_remove.id) {
			current_guild.spotify = null;
			type_of_channel = TypesOfChannel.Spotify;
		}
		if (current_guild.announcement === channel_to_remove.id) {
			current_guild.announcement = null;
			type_of_channel = TypesOfChannel.Announcement;
		}
		if (current_guild.music_data.channel_id === channel_to_remove.id) {
			musc_mngr.stop(channel_to_remove.guild.id, guild_list, channel_to_remove.guild);

			current_guild.music_data.channel_id = null;
			current_guild.music_data.message_id = null;
			current_guild.music_data.votes = [];
			current_guild.dispatcher = null;
			type_of_channel = TypesOfChannel.Music;
		}
		return type_of_channel;
	},

	//

	generate_channel_name: function(voice_channel, portal_object, guild_object, guild) {
		for (const portal_id in portal_object) {
			if (portal_object[portal_id].voice_list[voice_channel.id]) {
				const voice_object = portal_object[portal_id].voice_list[voice_channel.id];

				const new_name = this.regex_interpreter(
					voice_object.regex,
					voice_channel,
					voice_object,
					portal_object,
					guild_object,
					guild,
				);

				if (new_name.length >= 1) { // check if it works correctly tsiakkas
					if (voice_channel.name !== new_name.substring(0, 99)) {
						voice_channel.edit({ name: new_name.substring(0, 99) })
							.then(newChannel => console.log(`Voice's new name from promise is ${newChannel.name}`))
							.catch(console.log);
						return 1;
					}
					else {
						return 2;
					}
				}
				else {
					return 3;
				}
			}
		}
		return false;
	},

	regex_interpreter: function(regex, voice_channel, voice_object, portal_object, guild_object, guild) {

		let last_space_index = 0;
		let last_vatiable_end_index = 0;
		let last_attribute_end_index = 0;

		let last_variable = '';
		let last_attribute = '';

		let new_channel_name = '';

		for (let i = 0; i < regex.length; i++) {

			if (regex[i] === vrbl_objct.prefix) {

				const vrbl = vrbl_objct.is_variable(regex.substring(i));

				if (vrbl) {
					const return_value = vrbl_objct
						.get(voice_channel, voice_object, portal_object, guild_object, guild, vrbl);

					if (return_value) {
						last_variable = return_value;
						new_channel_name += return_value;
						i += voca.chars(vrbl).length;
						last_vatiable_end_index = i;
					}
					else {
						new_channel_name += regex[i];
					}
				}
				else {
					new_channel_name += regex[i];
				}

			}
			else if (regex[i] === attr_objct.prefix) {

				const attr = attr_objct.is_attribute(regex.substring(i));

				if (attr) {
					const return_value = attr_objct
						.get(voice_channel, voice_object, portal_object, guild_object, attr);

					if (return_value) {
						last_attribute = return_value;
						new_channel_name += return_value;
						i += voca.chars(attr).length;
						last_attribute_end_index = i;
					}
					else {
						new_channel_name += regex[i];
					}
				}
				else {
					new_channel_name += regex[i];
				}

			}
			else if (regex[i] === pipe_objct.prefix) {

				const pipe = pipe_objct.is_pipe(regex.substring(i));

				if (pipe) {
					if (last_vatiable_end_index + 1 === i) {

						const return_value = pipe_objct.get(last_variable, pipe);

						if (return_value) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_variable).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						}
						else {
							new_channel_name += regex[i];
						}

					}
					else if (last_attribute_end_index + 1 === i) {

						const return_value = pipe_objct.get(last_attribute, pipe);

						if (return_value) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_attribute).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						}
						else {
							new_channel_name += regex[i];
						}

					}
					else {

						const return_value = pipe_objct
							.get(new_channel_name.substring(last_space_index, new_channel_name.length), pipe);

						if (return_value) {
							const str_for_pipe = return_value;
							new_channel_name = new_channel_name.substring(0, last_space_index);
							new_channel_name += str_for_pipe;
							i += voca.chars(pipe).length;
						}
						else {
							new_channel_name += regex[i];
						}

					}
				}
				else {
					new_channel_name += regex[i];
				}

			}
			else if (regex[i] === '{' && (regex[i + 1] !== undefined && regex[i + 1] === '{')) {

				const inline = {
					'==':	(a, b) => (a == b) ? true : false,
					'===':	(a, b) => (a === b) ? true : false,
					'!=':	(a, b) => (a != b) ? true : false,
					'!==':	(a, b) => (a !== b) ? true : false,
					'>':	(a, b) => (a > b) ? true : false,
					'<':	(a, b) => (a < b) ? true : false,
					'>=':	(a, b) => (a >= b) ? true : false,
					'<=':	(a, b) => (a <= b) ? true : false,
				};

				try {
					// did not put into structure_list due to many unnecessary function calls
					let is_valid = false;
					const statement = help_mngr
						.getJSON(regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1));

					if (Object.prototype.hasOwnProperty.call(statement, 'if')) {
						if (Object.prototype.hasOwnProperty.call(statement, 'is')) {
							if (Object.prototype.hasOwnProperty.call(statement, 'with')) {
								if (Object.prototype.hasOwnProperty.call(statement, 'yes')) {
									if (Object.prototype.hasOwnProperty.call(statement, 'no')) {
										is_valid = true;
									}
								}
							}
						}
					}

					if(!is_valid) {
						new_channel_name += regex[i];
						if (regex[i] === ' ') {last_space_index = i + 1;}
					}
					else {
						if (inline[statement.is](
							this.regex_interpreter(
								statement.if, voice_channel, voice_object, portal_object, guild_object, guild,
							),
							this.regex_interpreter(
								statement.with, voice_channel, voice_object, portal_object, guild_object, guild,
							),
						)) {
							const value = this.regex_interpreter(
								statement.yes, voice_channel, voice_object, portal_object, guild_object, guild,
							);
							if (value !== '--') {new_channel_name += value;}
						}
						else {
							const value = this.regex_interpreter(
								statement.no, voice_channel, voice_object, portal_object, guild_object, guild,
							);
							if (value !== '--') {new_channel_name += value;}
						}
						i += regex.substring(i + 1).indexOf('}}') + 2;
					}
				}
				catch (error) {
					console.log('ERROR: in JSON parse: ', error);
					new_channel_name += regex[i];
				}

			}
			else {
				new_channel_name += regex[i];
				if (regex[i] === ' ') {last_space_index = i + 1;}
			}
		}

		if (new_channel_name === '') {return '.';}
		return new_channel_name;

	},
};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));