module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (!portal_guilds[message.guild.id].announcement) {
        return {
            result: false, value: '**Announcements channel has not been set yet.**'
        };
    }

    message.guild.channels.cache.find(channel =>
        channel.id === portal_guilds[message.guild.id].announcement
    )
        .send(create_rich_embed(
            `**${args.join(' ').substr(0, args.join(' ').indexOf('|'))}**`,
            `**${args.join(' ').substr(args.join(' ').indexOf('|')+1)}**`,
            '#022e4e',
            [],
            null,
            message.member,
            false
        ));

    if (voiceConnection = client.voice.connections.find(connection =>
        connection.channel.id)) {
        voiceConnection
            .play('./assets/mp3s/new_announcement.mp3');
    }

    return {
        result: true, value: '**Announcement was sent successfully.**'
    };
}