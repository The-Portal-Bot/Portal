const guld_mngr = require('./../functions/guild_manager');
const help_mngr = require('./../functions/help_manager');

module.exports = async (args) => {
    guld_mngr.delete_guild(args.guild.id, args.portal_guilds);
    help_mngr.update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.portal_guilds);
    
    return {
        result: true, value: `Portal has been removed from: ${args.guild.name} (id: ${guild.id})`
    };
}