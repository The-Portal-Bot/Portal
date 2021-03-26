import { Message } from "discord.js";
import { create_rich_embed, message_help } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { MemberPrtl } from "../../types/classes/MemberPrtl.class";
import { Field, ReturnPormise } from "../../types/classes/TypesPrtl.interface";

function compare(
	member_a: MemberPrtl, member_b: MemberPrtl
) {
	return member_b.level === member_a.level
		? member_b.points > member_a.points
			? 1
			: -1
		: member_b.level > member_a.level
			? 1
			: -1;
};

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const member_list = guild_object.member_list;
		if (!member_list) {
			return resolve({
				result: false,
				value: message_help(
					'commands',
					'leaderboard',
					'server has no members please contact portal support'
				)
			});
		}

		const requested_number = +args[0];
		if (args.length > 0 && isNaN(requested_number)) {
			return resolve({
				result: false,
				value: message_help('commands',
					'leaderboard',
					`${args[0]} is not a number`
				)
			});
		}

		let entries = (args.length > 0 && requested_number > 0 && member_list.length >= requested_number)
			? requested_number > 25
				? 24
				: requested_number
			: 9;

		if (entries <= 0) {
			return resolve({
				result: false,
				value: message_help('commands',
					'leaderboard',
					'leaderboard entries must be at least one'
				)
			});
		}

		if (guild_object.member_list) {
			const member_levels: Field[] = [];
			member_list
				.sort(compare)
				// .filter((m, j) => entries > j)
				.forEach((member_object, i) => {
					if (message.guild && entries > i) {
						const this_member = message.guild.members.cache
							.find(member => member.id === member_object.id);

						if (this_member) {
							member_levels.push(
								{
									emote: `${i + 1}. ${this_member.displayName} at level ${member_object.level}`,
									role: `points: ${Math.round(member_object.points)}`,
									inline: false
								}
							);

							entries--;
						}
						else {
							resolve({
								result: false,
								value: message_help('commands',
									'leaderboard',
									'a member has been stored incorrectly please contact Portal maintainter'
								)
							});
						}
					}
				});

			message.channel.send(create_rich_embed(
				'[LEADERBOARD](https://portal-bot.xyz/docs/ranking)',
				null,
				'#00FFFF',
				member_levels,
				null,
				null,
				true,
				null,
				null)
			);

			return resolve({
				result: true,
				value: ''
			});
		}
		else {
			resolve({
				result: false,
				value: message_help('commands', 'leaderboard', 'there are no members for this server, please contact Portal Bot maintainer')
			});
		}
	});
};