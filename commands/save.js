const help_mngr = require('./../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds);
    
    return {
        result: true, value: '**Update portal guild json.**'
    };
}