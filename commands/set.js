const guld_mngr = require('./../functions/guild_manager');
const attr_objct = require('./../assets/properties/attribute_list');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    current_portal_list = portal_guilds[message.guild.id].portal_list;
    
    if (message.member.voice.channelID === undefined) {
        return {
            result: false, value: '*You must be in a channel handled by* **Portal™** *to set attributes*'
        };
    } else if (!guld_mngr.included_in_voice_list(message.member.voice.channelID, current_portal_list)) {
        return {
            result: false, value: '*The channel you are in is not handled by* **Portal™**'
        };
    } else if (args.length > 1) { // check for type accuracy and make better
        for (let portal_key in current_portal_list) {
            for (let voice_key in current_portal_list[portal_key].voice_list) {
                if (voice_key === message.member.voice.channelID) {
                    let current_voice_channel = current_portal_list[portal_key].voice_list[voice_key]
                    let current_portal_channel = current_portal_list[portal_key]
                    if (message.member.id === current_voice_channel.creator_id) {
                        let return_value = attr_objct.set(
                            message.member.voice.channel,
                            current_voice_channel,
                            current_portal_channel,
                            portal_guilds[message.guild.id],
                            args[0],
                            args[1]
                        );

                        if (return_value === 1) {
                            return {
                                result: true, value: '**Attribute ' + args[0] + ' updated successfully**'
                            };
                        } else if (return_value === -1) {
                            return {
                                result: false, value: '**Attribute ' + args[0] + ' is read only**'
                            };
                        } else if (return_value === -2) {
                            return {
                                result: false, value: '**' + args[0] + ' is not an attribute**'
                            };
                        }
                    } else {
                        return {
                            result: false, value: '**Only the channel creator can change attributes**'
                        };
                    }
                }
            }
        }
    }

    return {
        result: true, value: '**Attribute was set.**'
    };
}