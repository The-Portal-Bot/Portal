const guld_mngr = require('./functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    let error_message = null;
    // check if he is an a guild
    if (message.member.voice.channel !== null) {
        // is he in a voice channel that is in the same guild as his text message
        if (message.member.voice.channel.guild.id === message.guild.id) {
            // is he in a controlled voice channel ?
            if (guld_mngr.included_in_voice_list(message.member.voice.channel.id, portal_guilds[message.guild.id].portal_list)) {
                console.log('I WILL CONNECT TO ID: ' + message.member.voice.channel.id + ' or ' + message.member.voice.channelID);

                message.member.voice.channel.join()
                    .then(connection => {
                        console.log('I WILL CONNECT TO CONNECTION: ', connection);
                        say_voice = connection;
                        say_voice.play('./assets/mp3s/cheers.mp3');
                        // client.voice.connections.find(connection => connection.channel.id === message.member.voice.channel.id)
                        // 	.play(say.export('Cheers love! Portal\'s here !'));				
                        console.log('connected to channel');
                    })
                    .catch(e => { console.log(e); });
                // message.member.voice.channel.leave();
            } else {
                return {
                    response: false, value: 'I can only connect to my channels.'
                };
            }
        } else {
            return {
                response: false, value: 'Your current channel is on another guild.'
            };
        }
    } else {
        return {
            response: false, value: 'You are not connected to any channel.'
        };
    }
    return {
        response: true, value: '**Joined voice channel successfully.**'
    };
}