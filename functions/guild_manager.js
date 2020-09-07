const voca = require('voca');

const vrbl_objct = require('../properties/variable_list');
const pipe_objct = require('../properties/pipe_list');
const attr_objct = require('../properties/attribute_list');

const guild_class = require('../assets/classes/guild_class');
const portal_class = require('../assets/classes/portal_class');
const voice_class = require('../assets/classes/voice_class');
const role_class = require('../assets/classes/role_class');
const member_class = require('../assets/classes/member_class');

const help_mngr = require('./help_manager');

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

	create_focus_channel: function(guild, portal_objct, member, focus_name, focus_time) {

		console.log('focus_name: ', focus_name);
		console.log('focus_time: ', focus_time);

		let return_value = null;
		const member_found = member.voice.channel.members
			.find(member_find => member_find.displayName === focus_name, focus_time);

		if (member_found) {
			const oldChannel = member.voice.channel;
			// let newChannel = null;

			guild.channels.create(
				`${member.displayName}&${member_found.displayName}`, { type: 'voice', bitrate: 64000 })
				.then(channel => {
					// newChannel = channel;
					channel.userLimit = 2;
					member.voice.setChannel(channel);
					member_found.voice.setChannel(channel);
				}).catch(console.error);

			setTimeout(() => {
				if (!oldChannel.deleted) {
					// member.voice.setChannel(oldChannel).then(moved => {
					// 	member_found.voice.setChannel(oldChannel).then(moved => {
					// 		if (newChannel.deletable()) {
					// 			newChannel.delete().catch(console.error);
					// 		}
					// 	}).catch(console.error);
					// }).catch(console.error);
				}
				else {
					return_value = 'oldChannel.name was deleted before transport back could occur.';
				}
			}, focus_time * 60 * 1000);
			if (return_value) { return return_value; }
			return true;
		}
		else {
			return false;
		}
	},

	create_url_channel: function(guild, url_name, url_category, url_list) {
		if (url_category) { // with category
			guild.channels.create(`${url_name}-url`, { type: 'text' })
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
		else { // withou category
			guild.channels
				.create(`${url_name}-url`, { type: 'text' })
				.then(channel => url_list.push(channel.id));
		}
	},

	create_spotify_channel: function(guild, spotify_channel, spotify_category, guild_object) {
		if (spotify_category) { // with category
			return guild.channels
				.create(`${spotify_channel}-sptfy`, { type: 'text' })
				.then(channel => {
					guild_object.spotify = channel.id;
					guild.channels
						.create(spotify_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		}
		else { // without category
			return guild.channels
				.create(`${spotify_channel}-sptfy`, { type: 'text' })
				.then(channel => { guild_object.spotify = channel.id; })
				.catch(console.error);
		}
	},

	create_music_channel: async function(guild, music_channel, music_category, guild_object) {
		return new Promise((resolve) => {
			if (music_category) { // with category
				guild.channels
					.create(`${music_channel}-music`, { type: 'text' })
					.then(channel => {
						guild_object.music_data.message_id = channel.id;
						guild.channels
							.create(music_category, { type: 'category' })
							.then(cat_channel => channel.setParent(cat_channel))
							.catch(error => { return resolve(error); });
						return resolve(channel);
					})
					.catch(error => { return resolve(error); });
			}
			else { // without category
				guild.channels
					.create(`${music_channel}-music`, { type: 'text' })
					.then(channel => {
						guild_object.music_data.message_id = channel.id;
						return resolve(channel);
					})
					.catch(error => { return resolve(error); });
			}
		});
	},

	create_announcement_channel: function(guild, announcement_channel, announcement_category, guild_object) {
		if (announcement_category) { // with category
			return guild.channels
				.create(`${announcement_channel}-annc`, { type: 'text' })
				.then(channel => {
					guild_object.announcement = channel.id;
					guild.channels
						.create(announcement_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		}
		else { // without category
			return guild.channels
				.create(`${announcement_channel}-annc`, { type: 'text' })
				.then(channel => { guild_object.announcement = channel.id; })
				.catch(console.error);
		}
	},

	create_portal_channel: function(guild, portal_channel, portal_category, portal_objct, guild_object, creator_id) {
		if (portal_category) { // with category
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
		else { // without category
			return guild.channels
				.create(portal_channel, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					portal_objct[channel.id] = new portal_class(
						creator_id,
						portal_channel,
						guild_object[guild.id].premium
							? 'G$#-P$member_count | $status_list'
							: 'CHN$# CNT$member_count',
						{}, false, 0, 0, 0, guild_object[guild.id].locale, false, true,
					);
				})
				.catch(console.error);
		}
	},

	create_voice_channel: function(state, portal_objct, portal_channel, creator_id) {
		state.channel.guild.channels
			.create('loading...', { type: 'voice', bitrate: 64000, position: portal_channel.position })
			.then(channel => {
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

	create_role_message: function(channel, role_list, title, desc, colour, role_emb, role_map) {
		const role_message_emb = help_mngr.create_rich_embed(title, desc, colour, role_emb);
		channel
			.send(role_message_emb)
			.then(sent_message => {
				for (let i = 0; i < role_map.length; i++) {
					sent_message.react(role_map[i].give);
					sent_message.react(role_map[i].strip);
				}
				role_list[sent_message.id] = new role_class(role_map);
			});
	},

	create_music_message: function(channel, thumbnail, guild_object) {
		const music_message_emb = help_mngr.create_rich_embed(
			'Music Player',
			'just type and I\'ll play',
			'#0000FF',
			false,
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

				guild_object.music_data.message_id = sent_message.id;
			});
	},

	create_member_list: function(guild_id, client) {
		const member_list = {};
		const guild = client.guilds.cache.find(cached_guild => cached_guild.id === guild_id);

		guild.members.cache.forEach(member => {
			if (member.id !== '704400876860735569') {member_list[member.id] = new member_class(1, 0, 0, 0, null);}
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
		const music_data = { channel_id: null, message: null };
		const music_queue = [];
		const announcement = null;
		const locale = 'en';
		const announce = 0;
		const level_speed = 'normal';
		const dispatcher = null;
		const premium = false;

		portal_guilds[guild_id] = new guild_class(portal_list, member_list, url_list, role_list, ranks, auth_role,
			spotify, music_data, music_queue, announcement, locale, announce, level_speed, dispatcher, premium);
	},

	//

	delete_guild: function(guild_id, portal_guilds) {
		delete portal_guilds[guild_id];
	},

	delete_channel: (channel_to_delete) => {
		if (channel_to_delete.deletable) {
			channel_to_delete
				.delete()
				.then(g => console.log(`Deleted channel with id: ${g}`))
				.catch(console.error);
		}
	},

	channel_deleted_update_state: function(channel_to_remove, guild_list) {
		let type_of_channel = 0;
		for (const portal_id in guild_list[channel_to_remove.guild.id].portal_list) {
			if (portal_id === channel_to_remove.id) {
				delete guild_list[channel_to_remove.guild.id].portal_list[portal_id];
				type_of_channel = 1;
				break;
			}
			else {
				const current_voice_list = guild_list[channel_to_remove.guild.id]
					.portal_list[portal_id]
					.voice_list;
				for (const voice_id in current_voice_list) {
					if (voice_id === channel_to_remove.id) {
						delete current_voice_list[voice_id];
						type_of_channel = 2;
						break;
					}
				}
			}
		}

		for (const urld_id in guild_list[channel_to_remove.guild.id].url_list) {
			if (urld_id === +channel_to_remove.id) {
				delete guild_list[channel_to_remove.guild.id].url_list[urld_id];
				type_of_channel = 3;
				break;
			}
		}
		if (guild_list[channel_to_remove.guild.id].spotify === channel_to_remove.id) {
			guild_list[channel_to_remove.guild.id].spotify = null;
			type_of_channel = 4;
		}
		if (guild_list[channel_to_remove.guild.id].announcement === channel_to_remove.id) {
			guild_list[channel_to_remove.guild.id].announcement = null;
			type_of_channel = 5;
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