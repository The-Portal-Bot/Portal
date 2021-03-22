import { GuildMember, TextChannel } from "discord.js";
import { create_rich_embed, logger } from "../libraries/help.library";
import { fetch_guild_announcement, insert_member } from "../libraries/mongo.library";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

module.exports = async (
	args: { member: GuildMember }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!args.member.user.bot) {
			insert_member(args.member.id, args.member.guild.id)
				.then(r => {
					fetch_guild_announcement(args.member.guild.id)
						.then(announcement => {
							if (announcement) {
								const join_message = `member ${args.member.presence.user} ` +
									`[${args.member.guild.id}]\n\thas joined ${args.member.guild}`;

								const announcement_channel = <TextChannel>args.member.guild.channels.cache
									.find(channel => channel.id === announcement);

								if (announcement_channel) {
									announcement_channel.send(
										create_rich_embed(
											'member joined',
											join_message,
											'#00C70D',
											[],
											args.member.user.avatarURL(),
											null,
											true,
											null,
											null
										)
									);
								} else {
									return resolve({
										result: false,
										value: `could not find announcement channel, it has been deleted`
									});
								}
							} else {
								return resolve({
									result: false,
									value: `could not find announcement channel in database`
								});
							}
						})
						.catch(e => {
							logger.log({ level: 'error', type: 'none', message: new Error(`failed to get announcement channel in database / ${e}`).message });
							return resolve({
								result: false,
								value: `failed to get announcement channel in database`
							});
						});

					return resolve({
						result: r,
						value: r
							? `added member ${args.member.id} to ${args.member.guild.id}`
							: `failed to add member ${args.member.id} to ${args.member.guild.id}`
					});
				})
				.catch(e => {
					logger.log({ level: 'error', type: 'none', message: new Error(`failed to add member ${args.member.id} to ${args.member.guild.id} / ${e}`).message });
					return resolve({
						result: false,
						value: `failed to add member ${args.member.id} to ${args.member.guild.id}`
					});
				});
		} else {
			return resolve({
				result: true,
				value: 'new member is bot, bots are not handled'
			});
		}
	});
};