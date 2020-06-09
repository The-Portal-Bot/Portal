const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (portal_guilds[message.guild.id].spotify === message.channel.id && args.length === 0) {
        return {
            result: true, value: '**This is already the Spotify channel.**'
        };
    } else if (portal_guilds[message.guild.id].announcement !== message.channel.id) {
        if (spotify = message.guild.channels.cache.find(channel =>
            channel.id == portal_guilds[message.guild.id].spotify)) {
            spotify
                .delete()
                .catch(console.error);
        } else {
            portal_guilds[message.guild.id].spotify = null;
        }
    }

    if (args.length === 0) {
        portal_guilds[message.guild.id].spotify = message.channel.id;

        return {
            result: true, value: '**This is now the Spotify channel.**'
        };
    } else if (args.length > 0) {
        const spotify_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
        const spotify_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
        console.log('1spotify_channel: ', spotify_channel);
        console.log('2spotify_category: ', spotify_category);
        
        if (spotify_channel !== '') {
console.log('exei category');
            guld_mngr.create_spotify_channel(
                message.guild, spotify_channel, spotify_category, portal_guilds[message.guild.id]);

            return {
                result: true, value: '*Spotify channel and category have been created*'
            };
        } else if (spotify_channel === '') {
console.log('den exei category');
            guld_mngr.create_spotify_channel(
                message.guild, spotify_category, null, portal_guilds[message.guild.id]);

            return {
                result: true, value: '*Spotify channel has been created*'
            };
        } else {
            return {
                result: false, value: '**You can run "./help spotify" for help.**'
            };
        }
    }
}