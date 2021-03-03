import { Client, Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const member_object = guild_object.member_list.find(m => m.id === message.member?.id);
		if (!member_object)
			return resolve({ result: true, value: 'portal member could not be fetched' });
		const member_info = member_object;

		message.channel.send(create_rich_embed(
			null,
			null,
			'#00FFFF',
			[
				{ emote: 'Level', role: `${member_info.level}`, inline: true },
				{ emote: 'Points', role: `${Math.round(member_info.points)}`, inline: true },
				{ emote: '', role: '', inline: false },
				{ emote: 'Rank', role: `${member_info.rank}`, inline: true },
				{ emote: 'Tier', role: `${member_info.tier}`, inline: true },
			],
			null,
			message.member,
			true,
			null,
			null)
		);

		return resolve({ result: true, value: '' });
	});
};