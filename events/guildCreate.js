const guld_mngr = require('./../functions/guild_manager');
const help_mngr = require('./../functions/help_manager');

module.exports = async (args) => {
	// Inserting guild to portal's guild list if it does not exist
	if (!guld_mngr.included_in_guild_list(args.guild.id, args.portal_guilds))
		guld_mngr.insert_guild(args.guild.id, args.portal_guilds, args.portal_managed_guilds_path);
	help_mngr.update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.portal_guilds);

	return {
		result: true, value: `Portal joined guild ${args.guild.name} [${args.guild.id}] which has ${args.guild.memberCount} members.`
	};
};