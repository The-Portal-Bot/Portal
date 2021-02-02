import { Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const ranks = guild_object.ranks;
		if (ranks && ranks.length > 0) {
			const ranks_msg: Field[] = [];

			ranks.forEach(rank => {
				const role = message.guild?.roles.cache.find(r => r.id === rank.role);
				ranks_msg.push({
					emote: `At level ${rank.level}, you get role`,
					role: `${role ? role : rank.role}`,
					inline: false,
				});
			});

			message.channel.send(
				create_rich_embed(
					'Ranking System',
					null,
					'#FF4500',
					ranks_msg,
					null,
					null,
					false,
					null,
					null
				),
			);

			resolve({ result: true, value: '' });
		}
		else {
			resolve({ result: true, value: 'There is no ranking yet' });
		}

		resolve({ result: true, value: 'There is no ranking yet' });
	});
};