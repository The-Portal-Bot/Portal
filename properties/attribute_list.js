const help_mngr = require('../functions/help_manager');

module.exports =
{
	is_attribute: function (arg) {
		for (let i = 0; i < this.attributes.length; i++)
			if (String(arg).substring(1, (String(this.attributes[i].name).length + 1)) == this.attributes[i].name)
				return this.attributes[i].name;
		return false;
	},
	get_help: function () {
		let attr_array = [];
		for (let i = 0; i < this.attributes.length; i++) {
			attr_array.push({
				emote: this.attributes[i].name,
				role: '**desc**: *' + this.attributes[i].description + '*' +
					'\n**args**: *' + this.attributes[i].args + '*',
				inline: true
			});
		}
		return help_mngr.create_rich_embed('Attributes',
			'Prefix: ' + this.prefix + '\nCommands to access portal bot.' +
			'\n**!**: *mandatory*, **@**: *optional*',
			'#FF5714', attr_array);
	},
	get_help_super: function (check) {
		for (let i = 0; i < this.attributes.length; i++) {
			let attr = this.attributes[i];
			if (attr.name === check) {
				return help_mngr.create_rich_embed(
					attr.name,
					'Type: Attribute' +
					'\nPrefix: ' + this.prefix +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF5714',
					[
						{ emote: 'Description', role: '*' + attr.super_description + '*', inline: false },
						{ emote: 'Arguments', role: '*' + attr.args + '*', inline: false }
					]
				);
			}
		}
		return false;
	},
	get: function (voice_channel, voice_object, portal_object, guild_object, attr) {
		for (let l = 0; l < this.attributes.length; l++) {
			if (attr === this.attributes[l].name) {
				return this.attributes[l].get(voice_channel, voice_object, portal_object, guild_object);
			}
		}
		return -1;
	},
	set: function (voice_channel, voice_object, portal_object, guild_object, attr, value) {
		for (let l = 0; l < this.attributes.length; l++) {
			if (attr === this.attributes[l].name) {
				if (this.attributes[l].set !== undefined) {
					this.attributes[l].set(voice_channel, voice_object, portal_object, guild_object, value);
					return 1;
				}
				return -1;
			}
		}
		return -2;
	},
	prefix: '&',
	attributes: [
		{
			name: 'regex_portal',
			description: 'returns/sets title-guidelines of portal channel',
			super_description: '**regex_portal**, returns/sets title-guidelines of portal channel',
			args: '!regex',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.regex_portal;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				var args_arr = Array.prototype.slice.call(value);
				portal_object.regex_portal = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'regex_voice',
			description: 'returns/sets the default title for created voice channels',
			super_description: '**regex_voice**, returns/sets the default title for created voice channels',
			args: '!regex',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.regex_voice;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				var args_arr = Array.prototype.slice.call(value);
				portal_object.regex_voice = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'regex',
			description: 'returns/sets the title for current voice channel',
			super_description: '**regex**, returns/sets the title for current voice channel',
			args: '!regex',
			get: (voice_channel, voice_object) => {
				return voice_object.regex;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				var args_arr = Array.prototype.slice.call(value);
				voice_object.regex = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'user_limit_portal',
			description: 'returns/maximum number of members guideline for portal',
			super_description: '**user_limit_portal**, returns/maximum number of members guideline for portal',
			args: '!number of maximum members',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.user_limit_portal;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				portal_object.user_limit_portal = Number(value);
			}
		},
		{
			name: 'user_limit_voice',
			description: 'returns/maximum number of members allowed',
			super_description: '**user_limit_voice**, returns/maximum number of members allowed',
			args: '!number of maximum members',
			get: (voice_channel) => {
				return voice_channel.userLimit;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				voice_channel.userLimit = Number(value);
			}
		},
		{
			name: 'position',
			description: 'returns/the position of the channel',
			super_description: '**position**, returns/the position of the channel',
			args: '!position of channel',
			get: (voice_channel) => {
				return voice_channel.position;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				voice_channel.edit({ position: Number(value) })
					.then(channel => console.log(
						`Channel's new position is ${channel.position} and should be ${value}`))
					.catch(console.error);
			}
		},
		{
			name: 'locale_voice',
			description: 'locale_voice of current channel',
			super_description: '**locale_voice**, returns/language used in statuses',
			args: 'en/gr',
			get: (voice_channel, voice_object) => {
				return voice_object.locale;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				voice_object.locale = String(value);
			}
		},
		{
			name: 'locale_portal',
			description: 'locale_portal of current channel',
			super_description: '**locale_portal**, returns/language used in statuses',
			args: 'en/gr',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.locale;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				portal_object.locale = String(value);
			}
		},
		{
			name: 'locale_guild',
			description: 'locale_guild of the guild',
			super_description: '**locale_guild**, guild locale makes the bot talk your language and all communication is done' +
				'in your local language',
			args: 'en/gr',
			get: (voice_channel, voice_object, portal_object, guild_object) => {
				return guild_object.locale;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				guild_object.locale = String(value);
			}
		},
		{
			name: 'bitrate',
			description: 'returns/bitrate of channel',
			super_description: '**bitrate** returns/bitrate of channel,',
			args: 'number',
			get: (voice_channel) => {
				return voice_channel.bitrate;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				// voice_channel.setBitrate(Number(value));
				voice_channel.edit({ bitrate: Number(value) })
					.then(channel => console.log(
						`Channel's new position is ${channel.bitrate} and should be ${value}`))
					.catch(console.error);
			}
		},
		{
			name: 'force_update',
			description: 'forces a channel creation and move of members to change name',
			super_description: '**force_update**, forces a channel creation and move of members to change name',
			args: '!true/false',
			get: (voice_channel, voice_object) => {
				return voice_object.force_update;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				voice_object.force_update = Boolean(value);
			}
		},
		{
			name: 'last_update',
			description: 'is the last time the channel name was updated',
			super_description: '**last_update**, is the last time the channel name was updated',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return `${Math.round(((Date.now() - voice_object.last_update) / 1000 / 60))}m` +
					`${Math.round(((Date.now() - voice_object.last_update) / 1000) % 60)}s`;
			}
		}
	]
};

