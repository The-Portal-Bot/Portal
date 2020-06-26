const help_mngr = require('../functions/help_manager');
const locales = ['gr', 'en', 'de'];

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
						{ emote: 'Arguments', role: '*' + attr.args + '*', inline: false },
						{ emote: 'Example', role: '*' + attr.example + '*', inline: false }
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
	set: function (voice_channel, voice_object, portal_object, guild_object, attr, value, member) {
		for (let l = 0; l < this.attributes.length; l++) {
			if (attr === this.attributes[l].name) {
				switch (this.attributes[l].auth) {
				case 'admin':
					if (!member.hasPermission('ADMINISTRATOR')) {
						return -2;
					}
					break;
				case 'portal':
					if(portal_object.creator_id !== member.id) {
						return -3;
					}
					break;
				case 'voice':
					if(voice_object.creator_id !== member.id) {
						return -4;
					}
					break;
				default:
					break;
				}

				return this.attributes[l].set(voice_channel, voice_object, portal_object, guild_object, value);
			}
		}
		return -1;
	},
	prefix: '&',
	attributes: [
		{
			name: 'regex_portal',
			description: 'returns/sets title-guidelines of portal channel',
			super_description: '**regex_portal**, returns/sets title-guidelines of portal channel',
			example: '&regex_portal',
			args: '!regex',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.regex_portal;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				portal_object.regex_portal = value;
				return 1;
			},
			auth: 'portal'
		},
		{
			name: 'regex_voice',
			description: 'returns/sets the default title for created voice channels',
			super_description: '**regex_voice**, returns/sets the default title for created voice channels',
			example: '&regex_voice',
			args: '!regex',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.regex_voice;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				portal_object.regex_voice = value;
				return 1;
			},
			auth: 'portal'
		},
		{
			name: 'regex',
			description: 'returns/sets the title for current voice channel',
			super_description: '**regex**, returns/sets the title for current voice channel',
			example: '&regex',
			args: '!regex',
			get: (voice_channel, voice_object) => {
				return voice_object.regex;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				voice_object.regex = value;
				return 1;
			},
			auth: 'voice'
		},
		{
			name: 'locale_guild',
			description: 'locale_guild of the guild',
			super_description: '**locale_guild**, guild locale makes the bot talk your language and all communication is done' +
				'in your local language',
			example: '&locale_guild',
			args: 'en/gr/de',
			get: (voice_channel, voice_object, portal_object, guild_object) => {
				return guild_object.locale;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				if (locales.includes(value)) {
					guild_object.locale = String(value);
					return 1;
				} else {
					return -5;
				}
			},
			auth: 'admin'
		},
		{
			name: 'locale_portal',
			description: 'locale_portal of current channel',
			super_description: '**locale_portal**, returns/language used in statuses',
			example: '&locale_portal',
			args: 'en/gr/de',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.locale;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				if (locales.includes(value)) {
					portal_object.locale = String(value);
					return 1;
				} else {
					return -5;
				}
			},
			auth: 'portal'
		},
		{
			name: 'locale',
			description: 'locale of current channel',
			super_description: '**locale**, returns/language used in statuses',
			example: '&locale',
			args: 'en/gr/de',
			get: (voice_channel, voice_object) => {
				return voice_object.locale;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				if (locales.includes(value)) {
					voice_object.locale = String(value);
					return 1;
				} else {
					return -5;
				}
			},
			auth: 'voice'
		},
		{
			name: 'user_limit_portal',
			description: 'returns/maximum number of members guideline for portal',
			super_description: '**user_limit_portal**, returns/maximum number of members guideline for portal',
			example: '&user_limit_portal',
			args: '!number of maximum members (0 is infinite)',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.user_limit_portal;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				if (value >= 0) {
					console.log('setting ' + portal_object.regex_portal + ' to ' + Number(value));
					console.log('was portal_object.user_limit_portal: ' + portal_object.user_limit_portal);
					portal_object.user_limit_portal = Number(value);
					console.log('is portal_object.user_limit_portal: ' + portal_object.user_limit_portal);
					return 1;
				}
				return -6;
			},
			auth: 'portal'
		},
		{
			name: 'user_limit',
			description: 'returns/maximum number of members allowed',
			super_description: '**user_limit**, returns/maximum number of members allowed',
			example: '&user_limit',
			args: '!number of maximum members (0 is infinite)',
			get: (voice_channel) => {
				return voice_channel.userLimit;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				if (value >= 0) {
					voice_channel.userLimit = Number(value);
					return 1;
				}
				return -6;
			},
			auth: 'voice'
		},
		{
			name: 'position',
			description: 'returns/the position of the channel',
			super_description: '**position**, returns/the position of the channel',
			example: '&position',
			args: '!position of channel',
			get: (voice_channel) => {
				return voice_channel.position;
			},
			set: (voice_channel, voice_object, portal_object, guild_object, value) => {
				voice_channel.edit({ position: Number(value) })
					.then(channel => console.log(
						`Channel's new position is ${channel.position} and should be ${value}`))
					.catch(console.error);
				return 1;
			},
			auth: 'voice'
		},
		{
			name: 'bitrate',
			description: 'returns/bitrate of channel',
			super_description: '**bitrate** returns/bitrate of channel,',
			example: '&bitrate',
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
				return 1;
			},
			auth: 'voice'
		}
	]
};
