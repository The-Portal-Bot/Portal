import { GuildMember, TextChannel } from "discord.js";
import { create_rich_embed } from "../libraries/helpOps";
import { fetch_guild, remove_member } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { member: GuildMember }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		fetch_guild(args.member.guild.id)
			.then(guild_object => {
				if (guild_object) {
					const leave_message = `member: ${args.member.presence.user} ` +
						`[${args.member.guild.id}]\n\thas left ${args.member.guild}`;

					if (guild_object && guild_object.announcement) {
						const announcement_channel = args.member.guild.channels.cache
							.find(channel => channel.id === guild_object.announcement)

						if (announcement_channel && announcement_channel.isText)
							(<TextChannel>announcement_channel).send(
								create_rich_embed(
									'member left', leave_message, '#FC0303', [],
									args.member.user.avatarURL(), null, true, null, null
								)
							);
					}

					if (!args.member.user.bot && guild_object) {
						remove_member(args.member)
							.then(response => {
								return resolve({
									result: response, value: response
										? 'member removed to guild' : 'member could not be removed'
								});
							})
							.catch(error => {
								return resolve({ result: false, value: 'member could not be removed' });
							});
					} else {
						return resolve({ result: true, value: 'member is a bot, no action taken for fellow workers' });
					}

				} else {
					return resolve({ result: false, value: 'guild is not in portal please contact support' });
				}
			});
	});
};
