const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (portal_guilds[message.guild.id].announcement === message.channel.id && args.length === 0) {
        return {
            result: true, value: '**This already is, the Announcement channel.**'
        };
    } else if (portal_guilds[message.guild.id].announcement !== message.channel.id) {
        if (announcement = message.guild.channels.cache.find(channel =>
            channel.id == portal_guilds[message.guild.id].announcement)) {
            announcement
                .delete()
                .catch(console.error);
        } else {
            portal_guilds[message.guild.id].announcement = null;
        }
    }

    if (args.length === 0) {
        portal_guilds[message.guild.id].announcement = message.channel.id;

        return {
            result: true, value: '**This is now the Announcement channel.**'
        };
    } else if (args.length > 0) {
        const announcement_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
        const announcement_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
        console.log('1announcement_channel: ', announcement_channel);
        console.log('2announcement_category: ', announcement_category);

        if (announcement_channel !== '') {
            console.log('exei category');
            guld_mngr.create_announcement_channel(
                message.guild, announcement_channel, announcement_category, portal_guilds[message.guild.id]);

            return {
                result: true, value: '*Announcement channel and category have been created*'
            };
        } else if (announcement_channel === '' && announcement_category !== '') {
            console.log('den exei category');
            guld_mngr.create_announcement_channel(
                message.guild, announcement_category, null, portal_guilds[message.guild.id]);

            return {
                result: true, value: '*Announcement channel has been created*'
            };
        } else {
            return {
                result: false, value: '**You can run "./help announcement" for help.**'
            };
        }
    }
}