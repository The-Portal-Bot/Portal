import { Client, Message } from "discord.js";
import { createEmded } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPromise } from "../../types/classes/TypesPrtl.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('returns time to reply with \'pong\''),
	async execute(
		message: Message, args: string[], guild_object: GuildPrtl, client: Client
	): Promise<ReturnPromise> {
		return new Promise((resolve) => {
			message.channel
				.send({
					embeds: [
						createEmded(
							null,
							null,
							'#0093ff',
							null,
							null,
							null,
							false,
							null,
							null,
							undefined,
							{
								name: `Request sent`,
								icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/ping.gif'
							}
						)]
				})
				.then((message_sent: Message) => {
					message_sent
						.edit({
							embeds: [
								createEmded(
									null,
									null,
									'#0093ff',
									null,
									null,
									null,
									false,
									null,
									null,
									undefined,
									{
										name: `RTT latency\t${message_sent.createdTimestamp - message.createdTimestamp} ms\n` +
											`Portal latency\t${client.ws.ping} ms`,
										icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/ping.gif'
									}
								)
							]
						})
						.then(() => {
							return resolve({
								result: true,
								value: ''
							})
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `error while editing pong message: ${e}`
							})
						});
				})
				.catch(e => {
					return resolve({
						result: false,
						value: `error while sending pong message: ${e}`
					})
				});
		});
	}
};