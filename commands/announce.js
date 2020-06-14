const lclz_mngr = require('./../functions/localization_manager');
const help_mngr = require('./../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (!portal_guilds[message.guild.id].announcement) {
        return {
            result: false, value: '**Announcements channel has not been set yet.**'
        };
    }

    message.guild.channels.cache.find(channel => channel.id === portal_guilds[message.guild.id].announcement)
        .send(help_mngr.create_rich_embed(
            `**${args.join(' ').substr(0, args.join(' ').indexOf('|'))}**`,
            `**${args.join(' ').substr(args.join(' ').indexOf('|')+1)}**`,
            '#022e4e',
            [],
            null,
            message.member,
            false
        ));

    let locale = portal_guilds[message.guild.id].locale;
    lclz_mngr.portal[locale].announcement.voice(client);

    return {
        result: true, value: '**Announcement was sent successfully.**'
    };
}