import { Client, Message } from "discord.js";
import { message_help } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		message.channel.send('ping sent')
			.then((message_sent: Message) => {
				message_sent.edit(
					`rtt    latency:\t**${message_sent.createdTimestamp - message.createdTimestamp}** *ms*.\n` +
					`portal latency:\t**${client.ws.ping}** *ms*`
				)
					.then((message_edited: Message) => {
						return resolve({
							result: true,
							value: ''
						})
					})
					.catch(e => {
						return resolve({
							result: false,
							value: message_help('commands', 'ping', `error while editing pong message / ${e}`)
						})
					});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: message_help('commands', 'ping', `error while sending pong message / ${e}`)
				})
			});
	});
};