/* eslint-disable no-unused-vars */

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const message_ping = message.channel.send('...')
			.then(message_sent => {
				message_sent.edit(
					`Pong!\nLatency of rtt is ${message_sent.createdTimestamp - message.createdTimestamp}ms.\n` +
					`Latency to portal is ${client.ws.ping}ms`,
				);
			})
			.catch(console.error);

		resolve({
			result: true,
			value: '*ping ran successfully.*',
		});
	});
};