const lclz_mngr = require('../libraries/localizationOps');
const help_mngr = require('../libraries/helpOps');

module.exports = async (args) => {
	// Changing Portal bots status
	args.client.user.setActivity('./help', { url: 'https://github.com/keybraker', type: 'LISTENING' });
	console.log('Portal guilds: ');
	args.client.guilds.cache.forEach(guild => {
		console.log(`${guild} (${guild.id})`);
		help_mngr.empty_channel_remover(guild, args.guild_list, args.portal_managed_guilds_path);
		help_mngr
	});

	return { result: true, value: lclz_mngr.console.ready.en(args) };
};
