const guld_mngr = require('../libraries/guildOps');
const help_mngr = require('../libraries/helpOps');

module.exports = async (args) => {
	guld_mngr.delete_guild(args.guild.id, args.guild_list);
	help_mngr.update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.guild_list);

	return {
		result: true,
		value: `Portal has been removed from: ${args.guild.name} (id: ${args.guild.id})`,
	};
};