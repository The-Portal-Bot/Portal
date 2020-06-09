const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (args) => {
    // Changing Portal bots status
    args.client.user.setActivity('./help', { url: 'https://github.com/keybraker', type: 'LISTENING' });
    args.client.guilds.cache.forEach(guild => { portal_init(guild); })

    return {
        result: true, value: lclz_mngr.console.gr.ready(args)
    };
}