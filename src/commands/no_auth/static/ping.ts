import { Client, Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		message.channel.send('initial')
			.then(message_sent => {
				message_sent.edit(
					`RTT    latency:\t**${message_sent.createdTimestamp - message.createdTimestamp}** *ms*.\n` +
					`Portal latency:\t**${client.ws.ping}** *ms*`)
					// .then(msg => {
					// 	msg.delete({ timeout: 15000 });
					// });
			})
			.catch(console.error);

		resolve({ result: true, value: 'pong' });
	});
};