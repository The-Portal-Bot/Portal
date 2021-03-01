import { Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const ignore_list = guild_object.member_list
			.map(m => {
				if (m.ignored) {
					return m.id;
				}
			})
			.filter(m => !!m);

		if (ignore_list && ignore_list.length > 0) {
			const ignored_msg: Field[] = [];

			ignore_list.forEach(ignored => {
				const member = message.guild?.members.cache.find(mb => mb.id === ignored);

				ignored_msg.push({
					emote: `${member?.displayName} | ${ignored}`,
					role: '',
					inline: false,
				});
			});

			message.channel.send(
				create_rich_embed(
					'Ignored Members',
					null,
					'#FF4500',
					ignored_msg,
					null,
					null,
					false,
					null,
					null
				),
			);

			resolve({
				result: true,
				value: ''
			});
		}
		else {
			resolve({
				result: true,
				value: 'there are no ignored members'
			});
		}

		resolve({
			result: true,
			value: 'there are no ignored members'
		});
	});
};