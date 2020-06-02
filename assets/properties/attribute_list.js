module.exports =
{
	get: () => {

	},

	set: function(voice_channel, voice_object, voice_portal, attr, value) {
		for (l = 0; l < this.attributes.length; l++) {
			if (attr === this.attributes[l].name) {
				if (this.attributes[l].set !== undefined) {
					this.attributes[l].set(
						voice_channel, voice_object, voice_portal, value
					);
					return 1;
				}
				return -1
			}
		}
		return -2;
	}
	,

	prefix: '&',
	attributes: [
		{
			name: 'regex_portal',
			description: 'returns/sets title-guidelines of portal channel',
			super_description: '**regex_portal**, returns/sets title-guidelines of portal channel',
			args: '!regex',
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].regex_portal; 
					}
				}
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
				var args_arr = Array.prototype.slice.call(value);
				voice_portal.regex_portal = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'regex_voice',
			description: 'returns/sets the default title for created voice channels',
			super_description: '**regex_voice**, returns/sets the default title for created voice channels',
			args: '!regex',
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].regex_voice; 
					}
				}
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
				var args_arr = Array.prototype.slice.call(value);
				voice_portal.regex_voice = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'regex',
			description: 'returns/sets the title for current voice channel',
			super_description: '**regex**, returns/sets the title for current voice channel',
			args: '!regex',
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].regex; 
					}
				}
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
				var args_arr = Array.prototype.slice.call(value);
				voice_object.regex = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'user_limit_portal',
			description: 'returns/maximum number of members guideline for portal',
			super_description: '**user_limit_portal**, returns/maximum number of members guideline for portal',
			args: '!number of maximum members',
			get: (id, portal_list, guild) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].user_limit_portal; 
					}
				}
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
				voice_portal.user_limit_portal = Number(value);
			}
		},
		{
			name: 'user_limit_voice',
			description: 'returns/maximum number of members allowed',
			super_description: '**user_limit_voice**, returns/maximum number of members allowed',
			args: '!number of maximum members',
			get: (id, portal_list, guild) => {
				return guild.channels.cache.find(channel => channel.id === id).userLimit;
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
				voice_channel.userLimit = Number(value);
			}
		},
		{
			name: 'position',
			description: 'returns/the position of the channel',
			super_description: '**position**, returns/the position of the channel',
			args: '!position of channel',
			get: (id, portal_list, guild) => {
				return guild.channels.cache.find(channel => channel.id === id).position;
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
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
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].locale; 
					}
				}
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
				voice_object.locale = String(value);
			}
		},
		{
			name: 'bitrate',
			description: 'returns/bitrate of channel',
			super_description: '**bitrate** returns/bitrate of channel,',
			args: 'number',
			get: (id, portal_list, guild) => {
				return guild.channels.cache.find(channel => channel.id === id).bitrate;
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
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
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].force_update;
					}
				}
			},
			set: (voice_channel, voice_object, voice_portal, value) => {
				voice_object.force_update = Boolean(value);
			}
		},
		{
			name: 'last_update',
			description: 'is the last time the channel name was updated',
			super_description: '**last_update**, is the last time the channel name was updated',
			args: 'none',
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].last_update;
					}
				}
			}
		}
	]
}
