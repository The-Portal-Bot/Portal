const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    current_voice = message.member.voice.channel;

    if (voiceConnection = client.voice.connections.find(connection => connection.channel.id)) {
        lclz_mngr.portal[portal_guilds[current_voice.guild.id].locale].goodbye.voice(client);
        setTimeout(function () { voiceConnection.disconnect(); }, 3000);
    }

    return {
        result: true, value: '**Bye Bye**'
    };
}