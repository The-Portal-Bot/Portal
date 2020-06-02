module.exports =
{
	get: () => {

	},
	set: (message, portal_list, args) => {
        for (l = 0; l < this.attributes.length; l++) {
            if (args[0] === this.attributes[l].name) {
                for (let key in portal_list) {
                    for (let key2 in portal_list[key].voice_list) {
                            if (key2 === message.member.voice.channelID) {
                            // checks whether you have created the voice channel not the portalchannel
                            if (message.member.id === portal_list[key].voice_list[key2].creator_id) {
                                if (this.attributes[l].set === undefined) {
                                    return -2;
                                } else {
                                    this.attributes[l].set(
                                        args,
                                        portal_list[i],
                                        portal_list[key].voice_list[key2],
                                        message.member.voice.channel
                                    );
                                    return 1;
                                }
                            } else {
                                return -3
                            }
                        }
                    }
                }
            }
        }
        return -1;
	}
	,

	prefix: '&',
	attributes: [
		{
			name: 'no_bots',
			description: 'returns/no bots allowed',
			super_description: '**no_bots returns/no bots allowedl**,',
			args: '!true/false',
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].no_bots; 
					}
				}
			},
			set: (args, portal, voice, voice_channel) => {
				voice.no_bots = Boolean(args[1]);
			}
		},
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
			set: (args, portal, voice, voice_channel) => {
				var args_arr = Array.prototype.slice.call(args);
				portal.regex_portal = args_arr.slice(1).join(' ');
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
			set: (args, portal, voice, voice_channel) => {
				var args_arr = Array.prototype.slice.call(args);
				portal.regex_voice = args_arr.slice(1).join(' ');
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
			set: (args, portal, voice, voice_channel) => {
				var args_arr = Array.prototype.slice.call(args);
				voice.regex = args_arr.slice(1).join(' ');
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
			set: (args, portal, voice, voice_channel) => {
				portal.user_limit_portal = Number(args[1]);
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
			set: (args, portal, voice, voice_channel) => {
				voice_channel.userLimit = Number(args[1]);
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
			set: (args, portal, voice, voice_channel) => {
				voice_channel.edit({ position: Number(args[1]) })
					.then(channel => console.log(
						`Channel's new position is ${channel.position} and should be ${args[1]}`))
					.catch(console.error);
			}
		},
		{
			name: 'time_to_live',
			description: 'returns/time to live',
			super_description: '**time_to_live returns/time to livertal**,',
			args: '!number in seconds',
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].time_to_live; 
					}
				}
			},
			set: (args, portal, voice, voice_channel) => {
				voice.time_to_live = Number(args[1]);
			}
		},
		{
			name: 'refresh_rate',
			description: 'returns/how often titles are being refreshed',
			super_description: '**refresh_rate**, returns/how often titles are being refreshed',
			args: '!number in seconds',
			get: (id, portal_list) => {
				for (let key in portal_list) {
					if (portal_list[key].voice_list[id]) {
						return portal_list[key].voice_list[id].refresh_rate; 
					}
				}
			},
			set: (args, portal, voice, voice_channel) => {
				voice.refresh_rate = Number(args[1]);
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
			set: (args, portal, voice, voice_channel) => {
				voice.locale = String(args[1]);
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
			set: (args, portal, voice, voice_channel) => {
				// voice_channel.setBitrate(Number(args[1]));
				voice_channel.edit({ bitrate: Number(args[1]) })
					.then(channel => console.log(
						`Channel's new position is ${channel.bitrate} and should be ${args[1]}`))
					.catch(console.error);
			}
		}
	]
}
