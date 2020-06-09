const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    const url_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
    const url_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

    if (url_channel !== '') {
        guld_mngr.create_url_channel(
            message.guild, url_channel, url_category, portal_guilds[message.guild.id].url_list);

        return {
            result: true, value: '*Url channel and category have been created*'
        };
    } else if (url_channel === '' && url_category !== '') {
        guld_mngr.create_url_channel(
            message.guild, url_category, null, portal_guilds[message.guild.id].url_list);

        return {
            result: true, value: '*Url channel has been created*'
        };
    } else {
        return {
            result: false, value: '**You can run "./help url" for help.**'
        };
    }
}