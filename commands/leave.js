module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (voiceConnection = client.voice.connections.find(connection =>
        connection.channel.id)) {
        let random = Math.floor(Math.random() * Math.floor(1));
        voiceConnection
            .play(random ? './assets/mp3s/goodbye.mp3' : './assets/mp3s/thatsall.mp3');
        setTimeout(function () { voiceConnection.disconnect(); }, 3000);
    }

    return {
        result: true, value: '**Bye Bye**'
    };
}