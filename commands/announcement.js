module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    portal_guilds[message.guild.id].announcement = message.channel.id;

    return {
        result: true, value: '**This is now the Announcements channel.**'
    };
}