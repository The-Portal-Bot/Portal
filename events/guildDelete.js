const guld_mngr = require('./../functions/guild_manager');

module.exports = async (args) => {
    guld_mngr.delete_guild(args.guild.id, args.portal_guilds);
    update_portal_managed_guilds(true);

    return {
        result: true, value: `Portal has been removed from: ${args.guild.name} (id: ${guild.id})`
    };
}