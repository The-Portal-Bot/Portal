const regx = require('./regex_interpreter.js');

module.exports = {
    
    generate_channel_name: function (voice_channel, portal_object) {
        for (let portal_id in portal_object) {
            if (portal_object[portal_id].voice_list[voice_channel.id]) {
                let voice_object = portal_object[portal_id].voice_list[voice_channel.id];
                let new_name = regx.regex_interpreter(voice_object.regex, voice_channel, voice_object, portal_object);
                voice_channel.edit({ name: new_name })
                    .then(newChannel => console.log(
                        `Voice's new name from promise is ${newChannel.name}`))
                    .catch(console.log);
                return;
            }
        }
        console.log('did not find channel');
    }

};
