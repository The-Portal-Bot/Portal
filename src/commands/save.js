const help_mngr = require('../libraries/helpOps');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds)
			.then((response) => resolve(response))
			.catch(console);
	});
};
