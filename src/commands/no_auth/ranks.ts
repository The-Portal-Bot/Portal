import { Message } from "discord.js";
import { createEmded } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { Field, ReturnPromise } from "../../types/classes/TypesPrtl.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ranks')
		.setDescription('returns server ranks'),
	async execute(
		message: Message, args: string[], guild_object: GuildPrtl
	): Promise<ReturnPromise> {
		return new Promise((resolve) => {
			if (guild_object.ranks && guild_object.ranks.length > 0) {
				const ranks_msg: Field[] = [];

				guild_object.ranks.forEach(rank => {
					const role = message.guild?.roles.cache.find(r => r.id === rank.role);
					ranks_msg.push({
						emote: `At level ${rank.level}, you get role`,
						role: `${role ? role : rank.role}`,
						inline: false,
					});
				});

				message.channel
					.send({
						embeds: [
							createEmded(
								'Ranking System',
								null,
								'#FF4500',
								ranks_msg,
								null,
								null,
								true,
								null,
								null
							)
						]
					})
					.catch(e => {
						return resolve({
							result: true,
							value: `failed to send message: ${e}`
						});
					});

				resolve({
					result: true,
					value: ''
				});
			}
			else {
				resolve({
					result: true,
					value: 'there is no ranking yet'
				});
			}

			resolve({
				result: true,
				value: 'could not fetch ranks'
			});
		});
	}
};