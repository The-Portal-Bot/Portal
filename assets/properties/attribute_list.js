module.exports =
{
	prefix: '@',
	attributes: [
		{
			name: 'no_bots',
			description: 'no bots allowed',
			args: '!true/false',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].no_bots;
			},
			set: (args, portal, voice, voice_channel) => {
				voice.no_bots = Boolean(args[1]);
			}
		},
		{
			name: 'regex_portal',
			description: 'sets title-guidelines of portal channel',
			args: '!regex',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].regex_portal;
			},
			set: (args, portal, voice, voice_channel) => {
				var args_arr = Array.prototype.slice.call(args);
				portal.regex_portal = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'regex_voice',
			description: 'sets the default title for created voice channels',
			args: '!regex',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].regex_voice;
			},
			set: (args, portal, voice, voice_channel) => {
				var args_arr = Array.prototype.slice.call(args);
				portal.regex_voice = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'regex',
			description: 'sets the title for current voice channel',
			args: '!regex',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].regex;
			},
			set: (args, portal, voice, voice_channel) => {
				var args_arr = Array.prototype.slice.call(args);
				voice.regex = args_arr.slice(1).join(' ');
			}
		},
		{
			name: 'limit_portal',
			description: 'maximum number of members guideline for portal',
			args: '!number of maximum members',
			get: (id, portal_list, guild) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].limit_portal;
			},
			set: (args, portal, voice, voice_channel) => {
				portal.limit_portal = Number(args[1]);
			}
		},
		{
			name: 'limit_voice',
			description: 'maximum number of members allowed',
			args: '!number of maximum members',
			get: (id, portal_list, guild) => {
				let member_limit = 0;
				guild.channels.some(channel => {
					if (id === channel.id) {
						member_limit = channel.userLimit;
						return;
					}
				});
				return member_limit;
			},
			set: (args, portal, voice, voice_channel) => {
				voice_channel.userLimit = Number(args[1]);
			}
		},
		{
			name: 'time_to_live',
			description: 'time to live',
			args: '!number in seconds',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].time_to_live;
			},
			set: (args, portal, voice, voice_channel) => {
				voice.time_to_live = Number(args[1]);
			}
		},
		{
			name: 'refresh_rate',
			description: 'how often titles are being refreshed',
			args: '!number in seconds',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].refresh_rate;
			},
			set: (args, portal, voice, voice_channel) => {
				voice.refresh_rate = Number(args[1]);
			}
		},
		{
			name: 'locale',
			description: 'language used in statuses',
			args: 'en/gr',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].locale;
			},
			set: (args, portal, voice, voice_channel) => {
				voice.locale = String(args[1]);
			}
		},
		{
			name: 'position',
			description: 'position of channel',
			args: 'number',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].position();
			},
			set: (args, portal, voice, voice_channel) => {
				voice.position = Number(args[1]);
				voice_channel.setPosition(Number(args[1]));
			}
		},
		{
			name: 'bitrate',
			description: 'bitrate of channel',
			args: 'number',
			get: (id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].bitrate();
			},
			set: (args, portal, voice, voice_channel) => {
				voice.bitrate = Number(args[1]);
				voice_channel.setBitrate(Number(args[1]));
			}
		}
	]
}