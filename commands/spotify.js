module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    portal_guilds[message.guild.id].spotify = message.channel.id;

    return {
        result: true, value: '**This is now the Spotify channel.**'
    };
}