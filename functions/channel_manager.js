const regx = require('./regex_interpreter.js');
const attr_objct = require('./../assets/properties/attribute_list');

module.exports = {

    generate_channel_names: function (guild, portal_list) {
        guild.channels.cache.some(channel => {
            for (i = 0; i < portal_list.length; i++)
                for (j = 0; j < portal_list[i].voice_list.length; j++)
                    if (channel.id === portal_list[i].voice_list[j].id) {
                        channel.setName(regx.regex_interpreter(
                            portal_list[i].voice_list[j].regex,
                            portal_list[i].voice_list[j].id,
                            guild,
                            portal_list
                        ));
                        return
                    } else if (channel.id === portal_list[i].id) {
                        channel.setName(regx.regex_interpreter(
                            portal_list[i].regex_portal,
                            portal_list[i].id,
                            guild,
                            portal_list
                        ));
                        return
                    }
        })
    }
    ,

    update_channel_attributes: function (message, portal_list, args) {
        for (l = 0; l < attr_objct.attributes.length; l++) {
            if (args[0] === attr_objct.attributes[l].name) {
                for (i = 0; i < portal_list.length; i++) {
                    for (j = 0; j < portal_list[i].voice_list.length; j++) {
                        if (message.member.voiceChannel.id === portal_list[i].voice_list[j].id) {
                            // checks whether you have created the voice channel not the portalchannel
                            if (message.member.id === portal_list[i].voice_list[j].creator_id) {
                                if (attr_objct.attributes[l].set === undefined) {
                                    return -2;
                                } else {
                                    attr_objct.attributes[l].set(
                                        args,
                                        portal_list[i],
                                        portal_list[i].voice_list[j],
                                        message.member.voiceChannel
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


};