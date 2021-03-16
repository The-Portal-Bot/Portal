import { GuildMember, TextChannel } from "discord.js";
import { create_rich_embed } from "../libraries/help.library";
import { fetch_guild_announcement, remove_member } from "../libraries/mongo.library";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

module.exports = async (
	args: { member: GuildMember }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		fetch_guild_announcement(args.member.guild.id)
			.then(announcement => {
				if (announcement) {
					const leave_message = `member: ${args.member.presence.user} ` +
						`[${args.member.guild.id}]\n\thas left ${args.member.guild}`;

					if (announcement) {
						const announcement_channel = args.member.guild.channels.cache
							.find(channel => channel.id === announcement)

						if (announcement_channel && announcement_channel.isText)
							(<TextChannel>announcement_channel).send(
								create_rich_embed(
									'member left', leave_message, '#FC0303', [],
									args.member.user.avatarURL(), null, true, null, null
								)
							);
					}

					if (!args.member.user.bot) {
						remove_member(args.member)
							.then(r => {
								return resolve({
									result: r,
									value: r ? 'member has been removed' : 'member could not be removed'
								});
							})
							.catch(e => {
								return resolve({
									result: false,
									value: 'member could not be removed'
								});
							});
					} else {
						return resolve({
							result: true,
							value: 'no action taken for fellow bot workers'
						});
					}

				} else {
					return resolve({
						result: false,
						value: 'guild is not in portal please contact support'
					});
				}
			});
	});
};
