import { Message } from "discord.js";
import { update_member } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length <= 0) {
			return resolve({
				result: false,
				value: 'must give one argument, \nyou can run `./help dj` for help'
			});
		}

		if (!message.guild) {
			return resolve({
				result: false,
				value: 'could not fetch guild from message'
			});
		}

		const member_data = args.join(' ');

		const member = message.guild?.members.cache.find(mb => 
			mb.id === member_data || mb.displayName === member_data);

		if (!member) {
			return resolve({
				result: false,
				value: `${member_data} is neither member id nor member name`
			});
		}
		
		const member_object = guild_object.member_list.find(m => m.id === member.id);

		if (!member_object) {
			return resolve({
				result: false,
				value: `member could not be found in Portal`
			});
		}

		update_member(guild_object.id, member_object.id, 'dj', !member_object.dj)
			.then(r => {
				return resolve({
					result: r,
					value: r
						? !member_object.dj
							? `member ${member ? member : member_object.id} has been made a dj`
							: `member ${member ? member : member_object.id} is no longer a dj`
						: !member_object.dj
							? `member ${member ? member : member_object.id} failed to be made a dj`
							: `member ${member ? member : member_object.id} failed to be removed as dj`
				});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: !member_object.dj
						? `member ${member ? member : member_object.id} failed to be made a dj`
						: `member ${member ? member : member_object.id} failed to be removed as dj`
				});
			});
	});
};
