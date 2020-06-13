const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (portal_guilds[message.guild.id].url_list.find(url_list => url_list === message.channel.id) && args.length === 0) {
        return {
            result: true, value: '**This already is in the url list, the url channel.**'
        };
    } else if (portal_guilds[message.guild.id].announcement !== message.channel.id &&
        portal_guilds[message.guild.id].spotify !== message.channel.id) {
        if (url = message.guild.channels.cache.find(channel =>
            portal_guilds[message.guild.id].url_list.find(url_list => url_list === channel.id))) {
            if (url.deletable) {
                url
                    .delete()
                    .catch(console.error); // edo petaei error investigate
            }
        } else {
            portal_guilds[message.guild.id].url_list = [];
        }
    }
    console.log('args: ', args);
    if (args.length === 0) {
        portal_guilds[message.guild.id].url_list.push(message.channel.id);

        return {
            result: true, value: '**This is now the url channel.**'
        };
    } else if (args.length > 0) {
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
}