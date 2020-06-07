const Discord = require("discord.js");

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    update_portal_managed_guilds(true);
    
    return {
        result: true, value: '**Update portal guild json.**'
    };
}