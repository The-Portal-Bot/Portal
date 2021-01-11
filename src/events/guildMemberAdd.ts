import { GuildMember, TextChannel } from "discord.js";
import { create_rich_embed, guildPrtl_to_object } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { MemberPrtl } from "../types/classes/MemberPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { member: GuildMember, guild_list: GuildPrtl[] }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {

		const join_message = `member ${args.member.presence.user} ` +
			`[${args.member.guild.id}]\n\thas joined ${args.member.guild}`;

		const guild_object = guildPrtl_to_object(args.guild_list, args.member.guild.id);
		if (guild_object && guild_object.announcement) {
			const announcement_channel = args.member.guild.channels.cache
				.find(channel => channel.id === guild_object.announcement)

			if (announcement_channel && announcement_channel.isText)
				(<TextChannel>announcement_channel).send(
					create_rich_embed(
						'member joined', join_message, '#00C70D', [],
						args.member.user.avatarURL(), null, true, null, null
					)
				);
		}

		if (!args.member.user.bot) {
			if (guild_object?.member_list.some((m, index) => {
				if (m.id === args.member.id) {
					guild_object.member_list.push(new MemberPrtl(args.member.id, 1, 0, 0, 0, null, false, false, null));
					return true;
				}
			})) {
				return resolve({ result: true, value: 'member removed from guild' });
			} else {
				return resolve({ result: false, value: 'member could not be removed' });
			}
		}

		return resolve({ result: true, value: 'member is a bot, no action taken for fellow workers' });
	});
};