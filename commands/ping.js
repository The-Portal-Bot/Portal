/* eslint-disable no-unused-vars */

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		const message_ping = message.channel.send('Ping?');
		message_ping.edit(
			`Pong!\nLatency of rtt is ${message_ping.createdTimestamp - message.createdTimestamp}ms.\n` +
			`Latency to portal is ${client.ws.ping}ms`
		);

		resolve({
			result: true,
			value: '*ping ran successfully.*'
		});
	});
};