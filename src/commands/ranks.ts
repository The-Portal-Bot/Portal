import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { create_rich_embed } from "../libraries/helpOps";
import { Field } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		const ranks = guild_object.ranks;
		if (ranks && ranks.length > 0) {
			const ranks_msg: Field[] = [];
			ranks.forEach(rank => {
				ranks_msg.push({
					emote: `At level ${rank.level}, you get role`,
					role: `${rank.role}`,
					inline: false,
				});
			});

			message.channel.send(
				create_rich_embed(
					null,
					null,
					'#FF4500',
					ranks_msg,
					null,
					message.member,
					false,
					null,
					null
				),
			).then(msg => {
				msg.delete({ timeout: 10000 });
			});

			resolve({ result: true, value: '' });
		}
		else {
			resolve({ result: true, value: 'There is no ranking yet.' });
		}

		resolve({ result: true, value: 'There is no ranking yet.' });
	});
};