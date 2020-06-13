const voca = require('voca');

const vrbl_objct = require('../assets/properties/variable_list');
const pipe_objct = require('../assets/properties/pipe_list');
const attr_objct = require('../assets/properties/attribute_list');

const class_guild = require('../classes/guild');
const class_portal = require('../classes/portal');
const class_role = require('../classes/role');

module.exports =
{
	included_in_portal_guilds: function (guild_id, portal_guilds) {
		if (portal_guilds[guild_id] !== undefined) {
			return true;
		}
		return false;
	}
	,

	included_in_portal_list: function (channel_id, portal_list) {
		if (portal_list[channel_id]) {
			return true;
		}
		return false;
	}
	,

	included_in_voice_list: function (channel_id, portal_list) {
		for (let key in portal_list) {
			if (portal_list[key].voice_list[channel_id]) {
				return true;
			}
		}
		return false;
	}
	,

	//

	create_focus_channel: function (guild, portal_objct, member, focus_name, focus_time) {
		
		console.log('focus_name: ', focus_name)
		console.log('focus_time: ', focus_time)

		let return_value = null;
		if (member_found = member.voice.channel.members.find(member_find => 
			member_find.displayName === focus_name, focus_time)) {
			const oldChannel = member.voice.channel;
			let newChannel = null;
			
			guild.channels.create(
				`${member.displayName}&${member_found.displayName}`, { type: 'voice', bitrate: 64000 })
				.then(channel => {
					newChannel = channel;
					channel.userLimit = 2;
					member.voice.setChannel(channel);
					member_found.voice.setChannel(channel);
				}).catch(console.error);

			setTimeout(() => {
				if (!oldChannel.deleted) {
					member.voice.setChannel(oldChannel).then(moved => {
						member_found.voice.setChannel(oldChannel).then(moved => {
							if (newChannel.deletable()) {
								newChannel.delete().catch(console.error);
							}
						}).catch(console.error);
					}).catch(console.error);
				} else {
					return_value =  `oldChannel.name was deleted before transport back could occur.`;
				}
			}, focus_time * 60 * 1000);
			if (return_value) { return return_value}
			return true;
		} else {
			return false;
		}
	}
	,

	create_url_channel: function (guild, url_name, portal_category, url_list) {
		if (portal_category) { // with category
			guild.channels.create(`${url_name}-url`, { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);

					guild.channels.create(portal_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				}).catch(console.error);
		} else { // withou category
			guild.channels.create(`${url_name}-url`, { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);
					console.log('url_list = ' + url_list);
				})
		}
	}
	,
	
	create_spotify_channel: function (guild, spotify_channel, spotify_category, guild_objct) {
		if (spotify_category) { // with category
			return guild.channels.create(`${spotify_channel}-sptfy`, { type: 'text' })
				.then(channel => {
					guild_objct.spotify = channel.id
					guild.channels.create(spotify_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		} else { // without category
			return guild.channels.create(`${spotify_channel}-sptfy`, { type: 'text' })
				.then(channel => { guild_objct.spotify = channel.id })
				.catch(console.error);
		}
	}
	,

	create_announcement_channel: function (guild, announcement_channel, announcement_category, guild_objct) {
		if (announcement_category) { // with category
			return guild.channels.create(`${announcement_channel}-annc`, { type: 'text' })
				.then(channel => {
					guild_objct.announcement = channel.id
					guild.channels.create(announcement_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		} else { // without category
			return guild.channels.create(`${announcement_channel}-annc`, { type: 'text' })
				.then(channel => { guild_objct.announcement = channel.id })
				.catch(console.error);
		}
	}
	,

	create_portal_channel: function (guild, portal_channel, portal_category, portal_objct, creator_id) {
		if (portal_category) { // with category
			return guild.channels.create(portal_channel, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					portal_objct[channel.id] = new class_portal.portal_channel(
						creator_id, portal_channel, 'G$#-P$member_count | $status_list', {},
						false, 0, 0, 0, 'gr', false, Date.now()
					);
					guild.channels.create(portal_category, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		} else { // without category
			return guild.channels.create(portal_channel, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					portal_objct[channel.id] = new class_portal.portal_channel(
						creator_id, portal_channel, 'G$#-P$member_count | $status_list', {},
						false, 0, 0, 0, 'gr', false, Date.now()
					);
				})
				.catch(console.error);
		}
	}
	,

	create_voice_channel: function (state, portal_objct, creator_id) {
		state.channel.guild.channels.create('loading...', { type: 'voice', bitrate: 64000 })
			.then(channel => {
				channel.userLimit = portal_objct.user_limit_portal;
				portal_objct['voice_list'][channel.id] = new class_portal.voice_channel(
					creator_id, portal_objct.regex_voice,
					false, 0, 0, 'gr', 1, Date.now()
				);
				if (state.channel.parentID !== null && state.channel.parentID !== undefined) {
					channel.setParent(state.channel.parentID);
				}
				state.member.voice.setChannel(channel);
			}).catch(console.error);

		return
	}
	,

	create_role_message: function (message, role_list, title, desc, colour, role_emb) {
		role_message_emb = create_rich_embed(title, desc, colour, role_emb);
		message.channel.send(role_message_emb)
			.then(sent_message => {
				// add roles emotes
				role_list.push(new class_role.role_message(sent_message.id, role_emb));
			});
	}
	,

	insert_guild: function (guild_id, portal_guilds) {
		portal_guilds[guild_id] = new class_guild({}, [], {}, null, null, `gr`);
	}
	,

	//

	delete_guild: function (guild_id, portal_guilds) {
		delete portal_guilds[guild_id];
	}
	,

	delete_voice_channel: function (channel_to_delete, portal_list) {
		// for (let key in portal_list) {
		// 	if (portal_list[key].voice_list[channel_to_delete.id]) {
		// 		delete portal_list[key].voice_list[channel_to_delete.id];
		// 	}
		// }
		if(channel_to_delete.deletable) {
			channel_to_delete.delete()
				.then(g => console.log(`Deleted channel with id: ${g}`))
				.catch(console.error);
		}
	}
	,

	delete_portal_channel: function (channel_to_delete, portal_list) {
		for (let key in portal_list) {
			if (key == channel_to_delete.id) {
				delete portal_list[key];
			}
		}
		if (channel_to_delete.deletable) {
			channel_to_delete.delete()
				.then(g => console.log(`Deleted channel with id: ${g}`))
				.catch(console.error);
		}
	}
	,

	remove_channel_from_guild_list: function (channel_to_remove, guild_list) {
		let type_of_channel = 0;
		for (let portal_id in guild_list[channel_to_remove.guild.id].portal_list) {
			console.log('inside portal_id: ' + portal_id + ' === ' + channel_to_remove.id)
			if (portal_id === channel_to_remove.id) {
				delete guild_list[channel_to_remove.guild.id].portal_list[portal_id];
				type_of_channel = 1;
				break;
			} else {
				for (let voice_id in guild_list[channel_to_remove.guild.id].portal_list[portal_id].voice_list) {
					console.log('inside voice_id: ' + voice_id + ' === ' + channel_to_remove.id)
					if (voice_id === channel_to_remove.id) {
						delete guild_list[channel_to_remove.guild.id].portal_list[portal_id].voice_list[voice_id];
						type_of_channel = 2;
						break;
					}
				}
			}
		}
		for (let urld_id in guild_list[channel_to_remove.guild.id].url_list) {
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
	}
	,
	//

	generate_channel_name: function (voice_channel, portal_object, guild_object) {
		for (let portal_id in portal_object) {
			if (portal_object[portal_id].voice_list[voice_channel.id]) {
				let voice_object = portal_object[portal_id].voice_list[voice_channel.id];
				let new_name = this.regex_interpreter(voice_object.regex, voice_channel, voice_object, portal_object, guild_object);
				if (voice_channel.name !== new_name) {
					voice_channel.edit({ name: new_name })
						.then(newChannel => console.log(
							`Voice's new name from promise is ${newChannel.name}`))
						.catch(console.log);
					return true;
				} else {
					return false;
				}
			}
		}
		return false;
	}
	,

	regex_interpreter: function (regex, voice_channel, voice_object, portal_object, guild_object) {
		let last_space_index = 0;
		let last_vatiable_end_index = 0;
		let last_attribute_end_index = 0;

		let last_variable = '';
		let last_attribute = '';

		let new_channel_name = '';

		for (let i = 0; i < regex.length; i++) {

			if (regex[i] === vrbl_objct.prefix) {
				if (vrbl = vrbl_objct.is_variable(regex.substring(i))) {
					if (return_value = vrbl_objct.get(voice_channel, voice_object, portal_object, vrbl)) {
						last_variable = return_value;
						new_channel_name += return_value;
						i += voca.chars(vrbl).length;
						last_vatiable_end_index = i;
					} else { new_channel_name += regex[i]; }
				} else { new_channel_name += regex[i]; }

			} else if (regex[i] === attr_objct.prefix) {

				if (attr = attr_objct.is_attribute(regex.substring(i))) {
					if (return_value = attr_objct.get(voice_channel, voice_object, portal_object, guild_object, attr)) {
						last_attribute = return_value;
						new_channel_name += return_value;
						i += voca.chars(attr).length;
						last_attribute_end_index = i;
					} else { new_channel_name += regex[i]; }
				} else { new_channel_name += regex[i]; }

			} else if (regex[i] === pipe_objct.prefix) {

				if (pipe = pipe_objct.is_pipe(regex.substring(i))) {
					if (last_vatiable_end_index + 1 === i) {
						if (return_value = pipe_objct.get(last_variable, pipe)) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_variable).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						} else { new_channel_name += regex[i]; }
					} else if (last_attribute_end_index + 1 === i) {
						if (return_value = pipe_objct.get(last_attribute, pipe)) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_attribute).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						} else { new_channel_name += regex[i]; }
					} else {
						if (return_value = pipe_objct.get(
							new_channel_name.substring(last_space_index, new_channel_name.length), pipe)) {
							let str_for_pipe = return_value
							new_channel_name = new_channel_name.substring(0, last_space_index);
							new_channel_name += str_for_pipe;
							i += voca.chars(pipe).length;
						} else { new_channel_name += regex[i]; }
					}
				} else {
					new_channel_name += regex[i];
				}

			} else if (regex[i] === '{' && (regex[i + 1] !== undefined && regex[i + 1] === '{')) {
				let inline = {
					"==": (a, b) => { if (a == b) return true; else false; },
					"===": (a, b) => { if (a === b) return true; else false; },
					"!=": (a, b) => { if (a != b) return true; else false; },
					"!==": (a, b) => { if (a !== b) return true; else false; },
					">": (a, b) => { if (a > b) return true; else false; },
					"<": (a, b) => { if (a < b) return true; else false; },
					">=": (a, b) => { if (a >= b) return true; else false; },
					"<=": (a, b) => { if (a <= b) return true; else false; }
				};

				try {
					// did not put into structure_list due to many unnecessary function calls
					let statement = JSON.parse(regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1));
					if (inline[statement.is](
						this.regex_interpreter(statement.if, voice_channel, voice_object, portal_object, guild_object),
						this.regex_interpreter(statement.with, voice_channel, voice_object, portal_object, guild_object)
					)) {
						let value = this.regex_interpreter(statement.yes, voice_channel, voice_object, portal_object, guild_object);
						if ('--' !== value)
							new_channel_name += value;
					} else {
						let value = this.regex_interpreter(statement.no, voice_channel, voice_object, portal_object, guild_object);
						if ('--' !== value)
							new_channel_name += value;
					}
					i += regex.substring(i + 1).indexOf('}}') + 2;
				} catch (error) {
					console.log('Error: in JSON parse: ', error);
					new_channel_name += regex[i];
				}
			} else {
				new_channel_name += regex[i];
				if (regex[i] === ' ') {
					last_space_index = i + 1;
				}
			}
		}

		if (new_channel_name === '') {
			return '.';
		} else {
			return new_channel_name;
		}
	}
};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));