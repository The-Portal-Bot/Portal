/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	const portal_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
	const portal_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

	if (portal_channel !== '') {
		guld_mngr.create_portal_channel(
			message.guild, portal_channel, portal_category, portal_guilds[message.guild.id].portal_list, message.member.id);

		return {
			result: true, value: '*Portal channel has been created.\n' +
				'Keep in mind that due to Discord\'s limitations,*\n' +
				'**channel names will be updated on a five minute interval.**'
		};
	} else if (portal_channel === '' && portal_category !== '') {
		guld_mngr.create_portal_channel(
			message.guild, portal_category, null, portal_guilds[message.guild.id].portal_list, message.member.id);

		return {
			result: true, value: '*Portal channel has been created.\n' +
				'Keep in mind that due to Discord\'s limitations,*\n' +
				'**channel names will be updated on a five minute interval.**'
		};
	} else {
		return {
			result: false, value: '**You can run "./help portal" for help.**'
		};
	}
};
