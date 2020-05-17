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

    update_channel_attributes: function (guild, portal_list, attr, value) {
        for (i = 0; i < portal_list.length; i++) {
            for (j = 0; j < portal_list[i].voice_list.length; j++) {
                if (guild.channels.some((channel) => {
                    if (channel.id === portal_list[i].voice_list[j].id) {
                        if (attr === 'no_bots') {
                            portal_list[i].voice_list[j].no_bots = Boolean(value);
                            return 1;
                        } else if (attr === 'mmbr_cap') {
                            portal_list[i].voice_list[j].mmbr_cap = Number(value);
                            channel.user_limit = Number(value);
                            return 1;
                        } else if (attr === 'time_to_live') {
                            portal_list[i].voice_list[j].time_to_live = Number(value);
                            return 1;
                        } else if (attr === 'refresh_rate') {
                            portal_list[i].voice_list[j].refresh_rate = Number(value);
                            return 1;
                        } else if (attr === 'pos') {
                            portal_list[i].voice_list[j].pos = Number(value);
                            channel.Position = Number(value);
                            return 1;
                        } else if (attr === 'lang') {
                            portal_list[i].voice_list[j].lang = String(value);
                            this.generate_channel_names(guild, portal_list);
                            return 1;
                        } else {
                            return 2;
                        }
                    }
                })) return 2;
            }
        }
        return 2;
    }

};