const regx = require('./regex_interpreter.js');
const attr_objct = require('./../assets/properties/attribute_list');
const  _ = require('lodash/core');

module.exports = {
    makeid: function(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    // generate_channel_names: function (guild, portal_list) {
    generate_channel_names: function (guild, portal_list, voice_to_update) {
        for (let key in portal_list) {
            if (portal_list[key].voice_list[voice_to_update.id]) {
                console.log('portal_list[key].voice_list[voice_to_update.id]: ', portal_list[key].voice_list[voice_to_update.id]);
                let new_name = String(regx.regex_interpreter(
                    portal_list[key].voice_list[voice_to_update.id].regex,
                    voice_to_update.id,
                    guild, portal_list));
                console.log('New name for voice channel with name: "' + voice_to_update.name + '", is: ' + new_name);
                voice_to_update.edit({ name: new_name })
                    .then(newChannel => console.log(`Voice's new name is ${newChannel.name}`))
                    .catch(console.log);
                console.log('Name should be updated.');
                return true;
            } else if (portal_list[voice_to_update.id]) {
                let new_name = String(regx.regex_interpreter(
                    portal_list[voice_to_update.id].regex_portal,
                    portal_list[voice_to_update.id].id,
                    guild, portal_list));
                console.log('New name for portal channel with name: "' + voice_to_update.name + '", is: ' + new_name);
                voice_to_update.edit({ name: new_name })
                    .then(newChannel => console.log(`Portal's new name is ${newChannel.name}`))
                    .catch(console.log);
                console.log('Name should be updated.');
                return true;
            }
        }
        return false;
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