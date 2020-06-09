const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (args) => {
    let current_guild = args.newPresence.guild;
    let current_channel = args.newPresence.member.voice.channel;
    
    if (!guld_mngr.included_in_portal_guilds(args.newPresence.guild.id, args.portal_guilds)) {
        return {
            result: false, value: lclz_mngr.console[args.portal_guilds[current_guild.id].locale].presence_controlled_away(args)
        };
    }

    if (current_channel) { // if member is in a channel
        let current_portal_list = args.portal_guilds[current_guild.id].portal_list;
        for (let key in args.portal_guilds[current_guild.id].portal_list) {
            if (current_voice_channel = current_portal_list[key].voice_list[current_channel.id]) {

                console.log(`${Math.round(((Date.now() - current_voice_channel.last_update) / 1000 / 60))}m` +
                    `${Math.round(((Date.now() - current_voice_channel.last_update) / 1000) % 60)}s / 5m0s`);

                current_channel.members.forEach(member => {
                    member.presence.activities.forEach(activity => {
                        if (activity.name === 'Spotify') {
                            if (args.portal_guilds[current_guild.id].spotify) {
                                if(spotify = args.newPresence.guild.channels.cache.find(channel =>
                                    channel.id === args.portal_guilds[current_guild.id].spotify
                                )) {
                                    spotify
                                    .send(create_rich_embed(
                                        `**${activity.details}**`,
                                        ``,
                                        '#1DB954',
                                        [{
                                            emote: `Album: **${activity.assets.largeText}**`,
                                            role: `Artist: ***${activity.state}***`,
                                            inline: false
                                        }],
                                        activity.assets.largeImageURL(),
                                        member,
                                        false
                                    ));
                                }
                            }
                        }
                    });
                });

                if ((Date.now() - current_voice_channel.last_update) >= 300000) {
                    if (guld_mngr.generate_channel_name(current_channel, current_portal_list, args.portal_guilds[current_guild.id])) {
                        current_voice_channel.last_update = Date.now();
                    }
                }
            }
        }
    }

    return {
        result: true, value: lclz_mngr.console[args.portal_guilds[current_guild.id].locale].presence_controlled(args)
    };
}