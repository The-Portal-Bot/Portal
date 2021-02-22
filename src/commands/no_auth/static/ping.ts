import { Client, Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		message.channel.send('initial')
			.then((message_sent: Message) => {
				message_sent.edit(
					`rtt    latency:\t**${message_sent.createdTimestamp - message.createdTimestamp}** *ms*.\n` +
					`portal latency:\t**${client.ws.ping}** *ms*`)
					.then((message_edited: Message) => {
						return resolve({
							result: true,
							value: ''
						})
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'error while editing pong message'
						})
					});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: 'error while sending pong message'
				})
			});
	});
};