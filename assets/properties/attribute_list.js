module.exports =
{
	get_help: function () {
		let attr_array = [];
		for (i = 0; i < this.attributes.length; i++) {
			attr_array.push({
				emote: this.attributes[i].name,
				role: '**desc**: *' + this.attributes[i].description + '*' +
					'\n**args**: *' + this.attributes[i].args + '*',
				inline: true
			});
		}
		return create_rich_embed('Attributes',
			'Prefix: ' + this.prefix + '\nCommands to access portal bot.' +
			'\n**!**: *mandatory*, **@**: *optional*',
			'#FF7F00', attr_array);
	},
	get_help_super: function (check) {
		for (i = 0; i < this.attributes.length; i++) {
			let attr = this.attributes[i]
			if (attr.name === check) {
				return create_rich_embed(
					attr.name,
					'Type: Attribute' +
					'\nPrefix: ' + this.prefix +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF7F00',
					[
						{ emote: 'Description', role: '*' + attr.super_description + '*', inline: false },
						{ emote: 'Arguments', role: '*' + attr.args + '*', inline: false }
					]
				)
			}
		}
		return false;
	},
	get: function(voice_channel, voice_object, portal_object, attr) {
		for (l = 0; l < this.attributes.length; l++) {
			if (attr === this.attributes[l].name) {
				return this.attributes[l].get(voice_channel, voice_object, portal_object);
			}
		}
		return -1;
	},
	set: function(voice_channel, voice_object, portal_object, attr, value) {
		for (l = 0; l < this.attributes.length; l++) {
			if (attr === this.attributes[l].name) {
				if (this.attributes[l].set !== undefined) {
					this.attributes[l].set(voice_channel, voice_object, portal_object, value);
					return 1;
				}
				return -1
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
			set: (voice_channel, voice_object, portal_object, value) => {
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
			set: (voice_channel, voice_object, portal_object, value) => {
				var args_arr = Array.prototype.slice.call(value);
				portal_object.regex_voice = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'regex',
			description: 'returns/sets the title for current voice channel',
			super_description: '**regex**, returns/sets the title for current voice channel',
			args: '!regex',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_object.regex; 
			},
			set: (voice_channel, voice_object, portal_object, value) => {
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
			set: (voice_channel, voice_object, portal_object, value) => {
				portal_object.user_limit_portal = Number(value);
			}
		},
		{
			name: 'user_limit_voice',
			description: 'returns/maximum number of members allowed',
			super_description: '**user_limit_voice**, returns/maximum number of members allowed',
			args: '!number of maximum members',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_channel.userLimit;
			},
			set: (voice_channel, voice_object, portal_object, value) => {
				voice_channel.userLimit = Number(value);
			}
		},
		{
			name: 'position',
			description: 'returns/the position of the channel',
			super_description: '**position**, returns/the position of the channel',
			args: '!position of channel',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_channel.position;
			},
			set: (voice_channel, voice_object, portal_object, value) => {
				voice_channel.edit({ position: Number(value) })
					.then(channel => console.log(
						`Channel's new position is ${channel.position} and should be ${value}`))
					.catch(console.error);
			}
		},
		{
			name: 'locale',
			description: 'returns/language used in statuses',
			super_description: '**locale**, returns/language used in statuses',
			args: 'en/gr',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_object.locale;
			},
			set: (voice_channel, voice_object, portal_object, value) => {
				voice_object.locale = String(value);
			}
		},
		{
			name: 'bitrate',
			description: 'returns/bitrate of channel',
			super_description: '**bitrate** returns/bitrate of channel,',
			args: 'number',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_channel.bitrate;
			},
			set: (voice_channel, voice_object, portal_object, value) => {
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
			get: (voice_channel, voice_object, portal_object) => {
				return voice_object.force_update;
			},
			set: (voice_channel, voice_object, portal_object, value) => {
				voice_object.force_update = Boolean(value);
			}
		},
		{
			name: 'last_update',
			description: 'is the last time the channel name was updated',
			super_description: '**last_update**, is the last time the channel name was updated',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_object.last_update;
			}
		}
	]
}
