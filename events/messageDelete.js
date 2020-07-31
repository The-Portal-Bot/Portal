// const guld_mngr = require('../functions/guild_manager');
const help_mngr = require('../functions/help_manager');

module.exports = async (args) => {

	// 'client': client, 'guild_list': guild_list,
	// 'portal_managed_guilds_path': portal_managed_guilds_path,
	// 'message': message

	const role_list = args.guild_list[args.message.guild.id].role_list;
	
	if (role_list[args.message.id]) {
		delete role_list[args.message.id];
		help_mngr.update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.guild_list);

		return {
			result: true,
			value: `role message ${args.message} was deleted and successfully removed from json`
		};
	}
};