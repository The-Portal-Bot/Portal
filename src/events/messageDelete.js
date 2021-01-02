const help_mngr = require('../libraries/helpOps');

module.exports = async (args) => {
	const current_channel = args.guild_list[args.message.guild.id];
	const role_list = args.guild_list[args.message.guild.id].role_list;
	const music_data = args.guild_list[args.message.guild.id].music_data;
	const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
			'.github.io/master/assets/img/logo.png';

	if (role_list[args.message.id]) {
		delete role_list[args.message.id];
		help_mngr.update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.guild_list);

		return {
			result: true,
			value: 'role message was deleted and successfully removed from json',
		};
	}

	if (music_data.message_id === args.message.id) {
		help_mngr.create_music_message(
			args.message.guild.channels.cache.find(channel =>
				channel.id === current_channel.music_data.channel_id),
			portal_icon_url,
			args.guild_list[args.message.guild.id],
		);

		return {
			result: true,
			value: 'music message has been created again',
		};
	}
};