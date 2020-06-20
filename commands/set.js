/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');
const attr_objct = require('../properties/attribute_list');

const locales = ['gr', 'en', 'de'];

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	let current_portal_list = portal_guilds[message.guild.id].portal_list;
	
	if (message.member.voice.channel === undefined || message.member.voice.channel === null) {
		return {
			result: false, value: '*You must be in a channel handled by* **Portal™** *to set attributes*'
		};
	} else if (!guld_mngr.included_in_voice_list(message.member.voice.channel.id, current_portal_list)) {
		return {
			result: false, value: '*The channel you are in is not handled by* **Portal™**'
		};
	}
	
	if (args.length > 1) { // check for type accuracy and make better
		for (let portal_key in current_portal_list) {
			for (let voice_key in current_portal_list[portal_key].voice_list) {
				if (voice_key === message.member.voice.channel.id) {
					let current_voice_channel = current_portal_list[portal_key].voice_list[voice_key];
					let current_portal_channel = current_portal_list[portal_key];

					if (message.member.id === current_voice_channel.creator_id) {
						let value = [...args]; value.shift(); value = value.filter(val => val !== '\n').join(' ');					

						let return_value = attr_objct.set(
							message.member.voice.channel, current_voice_channel, current_portal_channel,
							portal_guilds[message.guild.id], args[0], value
						);
						
						switch (return_value) {
						case 1:
							return { result: true, value: '**Attribute ' + args[0] + ' updated successfully**' };
						case -1:
							return { result: false, value: '**Attribute ' + args[0] + ' is read only**' };
						case -2:
							return { result: false, value: '**' + args[0] + ' is not an attribute**' };
						case -3:
							return { result: false, value: '**' + args[0] + ' is not an attribute**' };
						case -4:
							return { result: false, value: '**Locale can only be ' + locales.join(', ') + '**' };
						case -5:
							return { result: false, value: '**User limit can be a number from 0-n (0 means unlimited)**' };
						}
					} else {
						return {
							result: false, value: '**Only the channel creator can change attributes**'
						};
					}
				}
			}
		}
	}

	return {
		result: true, value: '**Attribute was set.**'
	};
};
