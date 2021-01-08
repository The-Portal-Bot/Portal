import { GuildMember, TextChannel } from "discord.js";
import { create_rich_embed, guildPrtl_to_object } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	args: { member: GuildMember, guild_list: GuildPrtl[] }
) => {
	const leave_message = `member: ${args.member.presence.user}\n` +
		`id: ${args.member.guild.id}\n` +
		`left: ${args.member.guild}.`;

	const guild_object = guildPrtl_to_object(args.guild_list, args.member.guild.id);
	if (guild_object && guild_object.announcement) {
		const announcement_channel = args.member.guild.channels.cache
			.find(channel => channel.id === guild_object.announcement)

		if (announcement_channel)
			(<TextChannel>announcement_channel).send(
				create_rich_embed(
					'member left', leave_message, '#FC0303', [],
					args.member.user.avatarURL(), null, true, null, null
				)
			);
	}

	if (!args.member.user.bot) {
		if (guild_object?.member_list.some((m, index) => {
			if (m.id === args.member.id) {
				guild_object.member_list.splice(index, 1);
				return true;
			}
		})) {
			return { result: true, value: 'member removed from guild' };
		} else {
			return { result: false, value: 'member could not be removed' };
		}
	}

	return { result: true, value: 'member is a bot, no action taken for fellow workers' };
};
