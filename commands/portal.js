const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    const portal_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
    const portal_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
    
    if (portal_channel !== '') {
        guld_mngr.create_portal_channel(
            message.guild, portal_channel, portal_category, portal_guilds[message.guild.id].portal_list, message.member.id);

        return {
            result: true, value: '*Portal channel and category have been created*' +
                '*Keep in mind that after Discord\'s update*, ' +
                '**channel names can be updated twice per ten minutes**'
        };
    } else if (portal_channel === '') {
        guld_mngr.create_portal_channel(
            message.guild, portal_category, null, portal_guilds[message.guild.id].portal_list, message.member.id);

        return {
            result: true, value: '*Portal channel has been created*' +
                '*Keep in mind that after Discord\'s update*, ' +
                '**channel names can be updated twice per ten minutes**'
        };
    } else {
        return {
            result: false, value: '**You can run "./help portal" for help.**'
        };
    }
}