const regx = require('./regex_interpreter.js');
const attr_objct = require('./../assets/properties/attribute_list');

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

    update_channel_attributes: function (message, portal_list, args) {
        let attr_index = -1;
        for (i = 0; i < attr_objct.length; i++)
            if (args[0] === attr_objct[i].name)
                attr_index = i;

        if (attr_index > -1) {
            for (i = 0; i < portal_list.length; i++) {
                for (j = 0; j < portal_list[i].voice_list.length; j++) {
                    if (message.member.voiceChannel.id === portal_list[i].voice_list[j].id) {
                        attr_objct[attr_index].set(
                            args,
                            portal_list[i],
                            portal_list[i].voice_list[j]
                        );
                        this.generate_channel_objcts(message.guild, portal_list);
                        return 1;
                    }
                }
            }
        }
        this.generate_channel_objcts(message.guild, portal_list);
        return 0;
    }


};