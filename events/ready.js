const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (args) => {
    console.log(
        lclz_mngr.console.gr.ready(
            args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size
        )
    );
    // Changing Portal bots status
    args.client.user.setActivity('./help', { url: 'https://github.com/keybraker', type: 'LISTENING' });
    args.client.guilds.cache.forEach(guild => { portal_init(guild); })

    return {
        result: true, value: 'Portal was initiated without errors'
    };
}