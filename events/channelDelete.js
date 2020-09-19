const guld_mngr = require('./../functions/guild_manager');
const help_mngr = require('./../functions/help_manager');

const type_of_channel = { 0: 'Unknown', 1: 'Portal', 2: 'Voice', 3: 'Url', 4: 'Spotify', 5: 'Announcement', 6: 'Music' };

module.exports = async (args) => {
	const return_value = guld_mngr.channel_deleted_update_state(args.channel, args.guild_list);
	help_mngr.update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.guild_list);

	if (return_value === 0) {
		return {
			result: false,
			value: 'Could not find channel that has been removed in json guild file ' +
				`(guild: ${args.channel.guild.name} - id: ${args.channel.guild.id})`,
		};
	}

	return {
		result: true,
		value: `Channel of type ${type_of_channel[return_value].toString()} ` +
			`has been removed from, guild: ${args.channel.guild.name} - id: ${args.channel.guild.id}`,
	};
};