import { Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { MemberPrtl } from "../../../types/classes/MemberPrtl";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

const compare = function (member_a: MemberPrtl, member_b: MemberPrtl) {
	if (member_b.points > member_a.points) return 1;
	if (member_a.points > member_b.points) return -1;
	return 0;
};

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const member_list = guild_object.member_list;
		if (!member_list) {
			return resolve({
				result: false,
				value: 'server has no members please contact portal support'
			});
		}
		if (isNaN(+args[0])) {
			return resolve({
				result: false,
				value: args[0] + ' is not a number'
			});
		}

		let entries = (+args[0] > 0 && member_list.length >= +args[0])
			? +args[0] > 100 ? 99 : +args[0]
			: 9;

		console.log('entries :>> ', entries);
		if (entries <= 0) {
			return resolve({
				result: false,
				value: 'leaderboard entries must be at least one'
			});
		}

		if (!isNaN(entries)) {
			if (guild_object.member_list) {
				const member_levels: Field[] = [];
				member_list.sort(compare)
					.filter((m, j) => entries > j)
					.forEach((member_object, i) => {
						if (message.guild) {
							const this_member = message.guild.members.cache
								.find(member => member.id === member_object.id);

							if (this_member) {
								member_levels.push(
									{
										emote: `${i + 1}. ${this_member.displayName}`,
										role: `points: ${Math.round(member_object.points)}`,
										inline: false
									}
								);
								entries--;
							}
							else {
								resolve({
									result: false,
									value: 'a member has been stored incorrectly please contact Portal maintainter',
								});
							}
						}
					});

				message.channel.send(create_rich_embed(
					'LEADERBOARD',
					null,
					'#00FFFF',
					member_levels,
					null,
					null,
					true,
					null,
					null),
				);

				return resolve({
					result: true,
					value: ''
				});
			}
			else {
				resolve({
					result: false,
					value: 'there are no members for this server, please contact Portal Bot maintainer',
				});
			}
		}
		else {
			resolve({
				result: false,
				value: 'you can run `./help leaderboard` for help',
			});
		}

	});
};