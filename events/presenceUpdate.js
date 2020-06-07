const guld_mngr = require('./../functions/guild_manager');

module.exports = async (args) => {
    if (!guld_mngr.included_in_portal_guilds(args.newPresence.guild.id, args.portal_guilds)) {
        return {
            result: true, value: `${args.newPresence.member.displayName}, who is a member of a handled server, ` +
            `has changed presence, but is in another server (${args.newPresence.guild.name})`
        };
    }

    let current_guild = args.newPresence.guild;
    let current_channel = args.newPresence.member.voice.channel;

    if (current_channel) { // if member is in a channel
        let current_portal_list = args.portal_guilds[current_guild.id].portal_list;
        for (let key in args.portal_guilds[current_guild.id].portal_list) {
            if (current_voice_channel = current_portal_list[key].voice_list[current_channel.id]) {

                console.log(`${Math.round(((Date.now() - current_voice_channel.last_update) / 1000 / 60))}m` +
                    `${Math.round(((Date.now() - current_voice_channel.last_update) / 1000) % 60)}s / 5m0s`);

                current_channel.members.forEach(member => {
                    member.presence.activities.forEach(activity => {
                        if (activity.name === 'Spotify') {
                            args.newPresence.guild.channels.cache.find(channel => channel.id === '719108602132168774').send(create_rich_embed(
                                `Spotify`,
                                `Listening to ${activity.details} by ${activity.state} from album ${activity.assets.largeText}`,
                                '#1DB954',
                                [{ emote: '', role: '', inline: false }],
                                null //activity.assets.largeImage
                            ));
                        }
                    });
                });

                if ((Date.now() - current_voice_channel.last_update) >= 300000) {
                    if (guld_mngr.generate_channel_name(current_channel, current_portal_list)) {
                        current_voice_channel.last_update = Date.now();
                    }
                }
            }
        }
    }

    return {
        result: true, value: `${args.newPresence.member.displayName}, has changed presence, `+
            `in controlled server (${args.newPresence.guild.name})`
    };
}