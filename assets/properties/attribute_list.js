module.exports =
{
	prefix: "@",
	attributes: [
		{
			name: "no_bots",
			description: "no bots allowed",
			args: "!true/false",
			get: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].no_bots;
			},
			set: (args, portal, voice) => {
                voice.no_bots = Boolean(args[1]);
            }
		},
		{
			name: "creator_id",
			description: "no bots allowed",
			args: "!true/false",
			get: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].creator_id;
			},
			set: (args, portal, voice) => {
				voice.creator_id = Number(args[1]);
			}
		},
		{
			name: "regex_voice",
			description: "set the voice of you current voice channel",
			args: "!regex",
			get: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].regex_voice;
			},
			set: (args, portal, voice) => {
                var args_arr = Array.prototype.slice.call(args);
                portal.regex_portal = args_arr.slice(1).join(' ');
            }
		},
		{
			name: "regex_portal",
			description: "set the portal of you current voice channel",
			args: "!regex",
			get: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].regex_portal;
			},
			set: (args, portal, voice) => {
                var args_arr = Array.prototype.slice.call(args);
                portal.regex_voice = args_arr.slice(1).join(' ');
            }
		},
		{
			name: "member_limit",
			description: "maximum number of members allowed",
			args: "!number of maximum members",
			get: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].member_limit;
			},
			set: (args, portal, voice) => {
                voice.member_cap = Number(args[1]);
            }
		},
		{
			name: "time_to_live",
			description: "time to live",
			args: "!number in seconds",
			get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].time_to_live;
			},
			set: (args, portal, voice) => {
                voice.time_to_live = Number(args[1]);
            }
		},
		{
			name: "refresh_rate",
			description: "how often titles are being refreshed",
			args: "!number in seconds",
			get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].refresh_rate;
			},
			set: (args, portal, voice) => {
                voice.refresh_rate = Number(args[1]);
            }
		},
		{
			name: "locale",
			description: "language used in statuses",
			args: "en/gr",
			get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].locale;
			},
			set: (args, portal, voice) => {
                voice.locale = String(args[1]);
            }
		},
		{
			name: "position",
			description: "position of channel",
			args: "number",
			get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].position();
			},
			set: (args, portal, voice) => {
                voice.position = Number(args[1]);
            }
		}
	]
}