const regx = require('./regex_interpreter.js');
const attr_objct = require('./../assets/properties/attribute_list');
const  _ = require('lodash/core');

module.exports = {
    generate_channel_name: function (guild, portal_list, voice_to_update) {
        for (let key in portal_list) {
            if (portal_list[key].voice_list[voice_to_update.id]) {
                let new_name = String(regx.regex_interpreter(
                    portal_list[key].voice_list[voice_to_update.id].regex,
                    voice_to_update.id, guild, portal_list));
                voice_to_update.edit({ name: new_name })
                    .then(newChannel => console.log(`Voice's new name from promise is ${newChannel.name}`))
                    .catch(console.log);
            } else if (portal_list[voice_to_update.id]) {
                let new_name = String(regx.regex_interpreter(
                    portal_list[voice_to_update.id].regex_portal,
                    portal_list[voice_to_update.id].id, guild, portal_list));
                voice_to_update.edit({ name: new_name })
                    .then(newChannel => console.log(`Portal's new name from promise is ${newChannel.name}`))
                    .catch(console.log);
            }
        }
    }
    ,

    update_channel_attributes: function (message, portal_list, args) {
        for (l = 0; l < attr_objct.attributes.length; l++) {
            if (args[0] === attr_objct.attributes[l].name) {
                for (let key in portal_list) {
                    for (let key2 in portal_list[key].voice_list) {
                            if (key2 === message.member.voice.channelID) {
                            // checks whether you have created the voice channel not the portalchannel
                            if (message.member.id === portal_list[key].voice_list[key2].creator_id) {
                                if (attr_objct.attributes[l].set === undefined) {
                                    return -2;
                                } else {
                                    attr_objct.attributes[l].set(
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


};