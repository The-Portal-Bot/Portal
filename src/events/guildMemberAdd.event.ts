import { GuildMember, TextChannel } from "discord.js";
import { create_rich_embed } from "../libraries/help.library";
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

								if (announcement) {
									const announcement_channel = args.member.guild.channels.cache
										.find(channel => channel.id === announcement);

									if (announcement_channel && announcement_channel.isText)
										(<TextChannel>announcement_channel).send(
											create_rich_embed(
												'member joined', join_message, '#00C70D', [],
												args.member.user.avatarURL(), null, true, null, null
											)
										);
								}
							} else {
								return resolve({
									result: false,
									value: 'guild is not in portal please contact support'
								});
							}
						});

					return resolve({
						result: r,
						value: r ? 'member added to guild' : 'member could not be added'
					});
				})
				.catch(e => {
					return resolve({
						result: false,
						value: 'member could not be added'
					});
				});
		} else {
			return resolve({
				result: true,
				value: 'no action taken for fellow bot workers'
			});
		}
	});
};