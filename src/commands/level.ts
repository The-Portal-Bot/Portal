import { Client, Message } from "discord.js";
import { create_rich_embed } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		const member_object = guild_object.member_list.find(m => m.id === message.member?.id);
		if (!member_object) {
			return resolve({ result: true, value: 'portal member could not be fetched' });
		}
		const member_info = member_object;

		message.channel.send(create_rich_embed(
			null,
			null,
			'#00FFFF',
			[
				{ emote: 'Level', role: `***${member_info.level}***`, inline: true },
				{ emote: 'Rank', role: `***${member_info.rank}***`, inline: true },
				{ emote: 'Tier', role: `***${member_info.tier}***`, inline: true },
				{ emote: 'Points', role: `***${member_info.points}***`, inline: true },
			],
			null,
			message.member,
			null,
			null,
			null)
		);

		return resolve({ result: true, value: null });
	});
};