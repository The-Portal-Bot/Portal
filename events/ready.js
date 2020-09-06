const lclz_mngr = require('./../functions/localization_manager');
const help_mngr = require('./../functions/help_manager');

module.exports = async (args) => {
	// Changing Portal bots status
	args.client.user
		.setActivity('./help', { url: 'https://github.com/keybraker', type: 'LISTENING' });
	args.client.guilds.cache
		.forEach(guild => help_mngr.empty_channel_remover(guild, args.guild_list, args.portal_managed_guilds_path));

	return { result: true, value: lclz_mngr.console.ready.en(args) };
};
