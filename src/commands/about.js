const help_mngr = require('../libraries/helpOps');

module.exports = async(client, message, args, portal_guilds, portal_managed_guilds_path) => {
    return new Promise((resolve) => {
        message.channel.send(help_mngr.create_rich_embed(
            'About', 'a portal to a managed discord server', '#1DB954', [{
                    emote: 'Creator',
                    role: '***Keybraker***',
                    inline: true
                },
                {
                    emote: 'Created',
                    role: '***2020***',
                    inline: true
                },
                {
                    emote: 'Version',
                    role: '***1.0.2***',
                    inline: true
                },
                {
                    emote: 'For help just type',
                    role: './help',
                    inline: false
                },
            ], false, client.user.member, true, 'https://portal-bot.xyz/'));

        return resolve({ result: true, value: 'about message.' });
    });
};