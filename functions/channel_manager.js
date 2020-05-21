const regx = require('./regex_interpreter.js');

module.exports = {

    generate_channel_names: function (guild, portal_list) {
        guild.channels.some(channel => {
            for (i = 0; i < portal_list.length; i++)
                for (j = 0; j < portal_list[i].voice_list.length; j++)
                    if (channel.id === portal_list[i].voice_list[j].id) {
                        channel.setName(regx.regex_interpreter(
                            portal_list[i].regex_voice,
                            portal_list[i].voice_list[j].id,
                            guild,
                            portal_list
                        ));
                        return
                    }
        })
    }
    ,

    attr: [
        {
            name: "no_bots",
            value: "no bots allowed",
            args: "!true/false",
            set: (args, portal, voice) => {
                voice.no_bots = Boolean(args[1]);
            }
        },
        {
            name: "regex_portal",
            value: "set the portal of you current voice channel",
            args: "!regex",
            set: (args, portal, voice) => {
                var args_arr = Array.prototype.slice.call(args);
                portal.regex_portal = args_arr.slice(1).join(' ');
            }
        },
        {
            name: "regex_voice",
            value: "set the voice of you current voice channel",
            args: "!regex",
            set: (args, portal, voice) => {
                var args_arr = Array.prototype.slice.call(args);
                portal.regex_voice = args_arr.slice(1).join(' ');
            }
        },
        {
            name: "member_cap",
            value: "maximum number of members allowed",
            args: "!number of maximum members",
            set: (args, portal, voice) => {
                voice.member_cap = Number(args[1]);
            }
        },
        {
            name: "time_to_live",
            value: "time to live",
            args: "!number in seconds",
            set: (args, portal, voice) => {
                voice.time_to_live = Number(args[1]);
            }
        },
        {
            name: "refresh_rate",
            value: "how often titles are being refreshed",
            args: "!number in seconds",
            set: (args, portal, voice) => {
                voice.refresh_rate = Number(args[1]);
            }
        },
        {
            name: "locale",
            value: "language used in statuses",
            args: "en/gr",
            set: (args, portal, voice) => {
                voice.locale = String(args[1]);
            }
        },
        {
            name: "position",
            value: "position of channel",
            args: "number",
            set: (args, portal, voice) => {
                voice.position = Number(args[1]);
            }
        }
    ]
    ,

    update_channel_attributes: function (message, portal_list, args) {
        let attr_index = -1;
        for (i = 0; i < this.attr.length; i++)
            if (args[0] === this.attr[i].name)
                attr_index = i;

        if (attr_index > -1) {
            for (i = 0; i < portal_list.length; i++) {
                for (j = 0; j < portal_list[i].voice_list.length; j++) {
                    if (message.member.voiceChannel.id === portal_list[i].voice_list[j].id) {
                        this.attr[attr_index].set(
                            args,
                            portal_list[i],
                            portal_list[i].voice_list[j]
                        );
                        this.generate_channel_names(message.guild, portal_list);
                        return 1;
                    }
                }
            }
        }
        this.generate_channel_names(message.guild, portal_list);
        return 0;
    }


};