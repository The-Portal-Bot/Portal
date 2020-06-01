const regx = require('./regex_interpreter.js');
const attr_objct = require('./../assets/properties/attribute_list');

module.exports = {
    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    generate_channel_names: function (guild, portal_list) {

        portal_list.some(portal => {
            portal.voice_list.some(voice => {
                if (voice_channel = guild.channels.cache.find(channel => channel.id === voice.id))
                    voice_channel.edit({
                        name: String(regx.regex_interpreter(voice.regex, voice.id, guild, portal_list))
                    }, reason => {
                        console.log('reason: ' + reason); // Error!
                    })
                        .then(newChannel => console.log(`Voice's new name is ${newChannel.name}`))
                        .catch(console.log);
            });

            if (portal_channel = guild.channels.cache.find(channel => channel.id === portal.id))
                portal_channel.edit({
                    name: String(regx.regex_interpreter(portal.regex_portal, portal.id, guild, portal_list))
                })
                    .then(newChannel => console.log(`Portal's new name is ${newChannel.name}`))
                    .catch(console.log);
        });

        // guild.channels.cache.some(channel => {
        //     for (i = 0; i < portal_list.length; i++)
        //         for (j = 0; j < portal_list[i].voice_list.length; j++)
        //             if (portal_list[i].voice_list[j].id === channel.id) {
        //                 let new_name = regx.regex_interpreter(
        //                     portal_list[i].voice_list[j].regex,
        //                     portal_list[i].voice_list[j].id,
        //                     guild,
        //                     portal_list);
        //                 console.log('channel: ', channel);
        //                 console.log('new_name: ', new_name);
        //                 // Set a new channel name
        //                 channel.edit({ name: new_name })
        //                     .then(console.log)
        //                     .catch(console.error);
        //                 // channel.setName(new_name)
        //                 //     .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
        //                 //     .catch(console.error);
        //                 return
        //             } else if (channel.id === portal_list[i].id) {
        //                 channel.setName(regx.regex_interpreter(
        //                     portal_list[i].regex_portal,
        //                     portal_list[i].id,
        //                     guild,
        //                     portal_list
        //                 ));
        //                 return
        //             }
        // })
    }
    ,

    update_channel_attributes: function (message, portal_list, args) {
        for (l = 0; l < attr_objct.attributes.length; l++) {
            if (args[0] === attr_objct.attributes[l].name) {
                for (i = 0; i < portal_list.length; i++) {
                    for (j = 0; j < portal_list[i].voice_list.length; j++) {
                        if (message.member.voice.channelID === portal_list[i].voice_list[j].id) {
                            // checks whether you have created the voice channel not the portalchannel
                            if (message.member.id === portal_list[i].voice_list[j].creator_id) {
                                if (attr_objct.attributes[l].set === undefined) {
                                    return -2;
                                } else {
                                    attr_objct.attributes[l].set(
                                        args,
                                        portal_list[i],
                                        portal_list[i].voice_list[j],
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