const voca = require('voca');

const vrbl_objct = require('../assets/properties/variable_list');
const pipe_objct = require('../assets/properties/pipe_list');
const attr_objct = require('../assets/properties/attribute_list');

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

	included_in_portal_list: function(channel_id, portal_list) {
		if (portal_list[channel_id]) {
			return true;
		}
		return false;
	}
	,

	included_in_voice_list: function(channel_id, portal_list) {
		for (let key in portal_list) {
			if (portal_list[key].voice_list[channel_id]) {
				return true;
			}
		}
		return false;
	}
	,

	//

	create_portal_channel: function(guild, portal_name, category_name, json_portal_list, creator_id) {
		if (category_name) { // with category
			return guild.channels.create(portal_name, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					json_portal_list[channel.id] =  new class_portal.portal_channel(
						creator_id, portal_name, 'G$#-P$member_count | $status_list', {},
						false, 0, 0, 0, 'gr', false, Date.now()
					);
					guild.channels.create(category_name, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		} else { // without category
			return guild.channels.create(portal_name, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					json_portal_list[channel.id] = new class_portal.portal_channel(
						creator_id, portal_name, 'G$#-P$member_count | $status_list', {},
						false, 0, 0, 0, 'gr', false, Date.now()
					);
				})
				.catch(console.error);
		}
	}
	,

	create_voice_channel: function(state, json_portal, creator_id) {
		state.channel.guild.channels.create('loading...', { type: 'voice', bitrate: 64000 })
			.then(channel => {
				channel.userLimit = json_portal.user_limit_portal;
				json_portal['voice_list'][channel.id] = new class_portal.voice_channel(
					creator_id, json_portal.regex_voice,
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

	create_url_channel: function(guild, url_name, category_name, url_list) {
		if (category_name) { // with category
			guild.channels.create(url_name + ' (url-only)', { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);

					guild.channels.create(category_name, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				}).catch(console.error);
		} else { // withou category
			guild.channels.create(url_name + ' (url-only)', { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);
					console.log('url_list = ' + url_list);
				})
		}
	}
	,

	create_role_message: function(message, role_list, title, desc, colour, role_emb) {
		role_message_emb = create_rich_embed(title, desc, colour, role_emb);
		message.channel.send(role_message_emb)
			.then(sent_message => {
				// add roles emotes
				role_list.push(new class_role.role_message(sent_message.id, role_emb));
			});
	}
	,

	insert_guild: function (guild_id, portal_guilds) {
		portal_guilds[guild_id] = { "portal_list": {}, "url_list": [], "role_list": {}, "spotify": null, "announcement": null };
	}
	,

	//

	delete_guild: function (guild_id, portal_guilds) {
		delete portal_guilds[guild_id];
	}
	,
	
	delete_voice_channel: function (channel_to_delete, portal_list) {
		for (let key in portal_list) {
			if (portal_list[key].voice_list[channel_to_delete.id]) {
				delete portal_list[key].voice_list[channel_to_delete.id];
			}
		}
		channel_to_delete.delete()
			.then(g => console.log(`Deleted channel with id: ${g}`))
			.catch(console.error);
	}
	,

	//

	generate_channel_name: function (voice_channel, portal_object) {
		for (let portal_id in portal_object) {
			if (portal_object[portal_id].voice_list[voice_channel.id]) {
				let voice_object = portal_object[portal_id].voice_list[voice_channel.id];
				let new_name = this.regex_interpreter(voice_object.regex, voice_channel, voice_object, portal_object);
				if(voice_channel.name !== new_name) {
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
		console.log('did not find channel');
		return false;
	}
	,

	regex_interpreter: function (regex, voice_channel, voice_object, portal_object) {
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
					if (return_value = attr_objct.get(voice_channel, voice_object, portal_object, attr)) {
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
						this.regex_interpreter(statement.if, voice_channel, voice_object, portal_object),
						this.regex_interpreter(statement.with, voice_channel, voice_object, portal_object)
					)) {
						let value = this.regex_interpreter(statement.yes, voice_channel, voice_object, portal_object);
						if ('--' !== value)
							new_channel_name += value;
					} else {
						let value = this.regex_interpreter(statement.no, voice_channel, voice_object, portal_object);
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