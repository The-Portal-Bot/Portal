/* eslint-disable no-unused-vars */
const lclz_mngr = require('./../functions/localization_manager');
const help_mngr = require('./../functions/help_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (!portal_guilds[message.guild.id].announcement) {
			return resolve ({ result: false, value: 'announcements channel has not been set.' });
		}

		let body = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		let title = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

		if (body === '' && title !== '') {
			body = title;
			title = '';
		} else if (body === '' && title === '') {
			return resolve ({ result: false, value: 'you can run "./help announce" for help.' });
		}

		message.guild.channels.cache.find(channel => channel.id === portal_guilds[message.guild.id].announcement)
			.send(help_mngr.create_rich_embed(
				title, `@here ${body}`, '#022e4e', [], null, message.member, false
			));
		lclz_mngr.client_talk(client, portal_guilds, 'announce');

		return resolve ({ result: true, value: 'announcement was sent successfully.' });
	});
};
