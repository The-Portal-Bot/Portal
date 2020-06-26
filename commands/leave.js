/* eslint-disable no-undef */
/* eslint-disable no-cond-assign */
/* eslint-disable no-unused-vars */
const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (voiceConnection = client.voice.connections.find(connection => connection.channel.id)) {
			lclz_mngr.client_talk(client, portal_guilds, 'leave');
			setTimeout(function () { voiceConnection.disconnect(); }, 3000);
		}

		return resolve ({ result: true, value: lclz_mngr.client_write(message, portal_guilds, 'leave') });
	});
};
