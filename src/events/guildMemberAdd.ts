import { GuildMember, TextChannel } from "discord.js";
import { create_rich_embed } from "../libraries/helpOps";
import { fetch_guild, insert_member } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { member: GuildMember }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		fetch_guild(args.member.guild.id)
			.then(guild_object => {
				if (guild_object) {
					const join_message = `member ${args.member.presence.user} ` +
						`[${args.member.guild.id}]\n\thas joined ${args.member.guild}`;

					if (guild_object && guild_object.announcement) {
						const announcement_channel = args.member.guild.channels.cache
							.find(channel => channel.id === guild_object.announcement);

						if (announcement_channel && announcement_channel.isText)
							(<TextChannel>announcement_channel).send(
								create_rich_embed(
									'member joined', join_message, '#00C70D', [],
									args.member.user.avatarURL(), null, true, null, null
								)
							);
					}

					if (!args.member.user.bot) {
						insert_member(args.member)
							.then(r => {
								return resolve({
									result: r, value: r ? 'member added to guild' : 'member could not be added'
								});
							})
							.catch(e => {
								return resolve({ result: false, value: 'member could not be added' });
							});
					} else {
						return resolve({ result: true, value: 'no action taken for fellow bot workers' });
					}

				} else {
					return resolve({ result: false, value: 'guild is not in portal please contact support' });
				}
			});
	});
};