/* eslint-disable no-unused-vars */

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const message_ping = message.channel.send('*initial*')
			.then(message_sent => {
				message_sent
					.edit(
						`RTT    latency:\t**${message_sent.createdTimestamp - message.createdTimestamp}** *ms*.\n` +
						`Portal latency:\t**${client.ws.ping}** *ms*`)
					.then(msg => {
						msg.delete({ timeout: 15000 });
					});
			})
			.catch(console.error);

		resolve({ result: true, value: '*pong*' });
	});
};