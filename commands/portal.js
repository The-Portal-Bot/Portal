const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (args.length === 2) {
        guld_mngr.create_portal_channel(message.guild, args[0], args[1],
            portal_guilds[message.guild.id].portal_list, message.member.id);
    } else if (args.length === 1) {
        guld_mngr.create_portal_channel(message.guild, args[0], null,
            portal_guilds[message.guild.id].portal_list, message.member.id);
    } else {
        return {
            response: false, value: '**You can run "./help portal" for help.**'
        };
    }
    
    return {
        response: true, value: '*Keep in mind that after Discord\'s update*, ' +
            '**channel names can be updated twice per ten minutes**'
    };
}