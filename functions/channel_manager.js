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
        for (l = 0; l < attr_objct.attributes.length; l++) {
            if (args[0] === attr_objct.attributes[l].name) {
                console.log('Mphka 2');
                for (i = 0; i < portal_list.length; i++) {
                    console.log('Mphka 3');
                    for (j = 0; j < portal_list[i].voice_list.length; j++) {
                        console.log('Mphka 4');
                        if (message.member.voiceChannel.id === portal_list[i].voice_list[j].id) {
                            console.log('setting attribute: ' + l)
                            attr_objct.attributes[l].set(
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
        }

        this.generate_channel_names(message.guild, portal_list);
        return 0;
    }


};