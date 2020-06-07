const guld_mngr = require('./functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (args.length === 2) {
        guld_mngr.create_url_channel(message.guild, args[0], args[1], portal_guilds[message.guild.id].url_list);
        message.react('✔️');
    } else if (args.length === 1) {
        guld_mngr.create_url_channel(message.guild, args[0], null, portal_guilds[message.guild.id].url_list);
        message.react('✔️');
    } else {
        return {
            result: false, value: '**You can run "./help url" for help.**'
        };
    }
    return {
        result: true, value: '**Url channel has been created.**'
    };
}