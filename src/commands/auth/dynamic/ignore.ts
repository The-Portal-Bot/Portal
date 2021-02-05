import { Message } from "discord.js";
import { included_in_ignore_list } from "../../../libraries/guildOps";
import { insert_ignore, remove_ignore, update_member } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({
				result: false,
				value: 'guild could not be fetched'
			});

		if (args.length === 0) {
			if (included_in_ignore_list(message.channel.id, guild_object)) {
				remove_ignore(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'successfully removed ignore channel'
								: 'failed to remove ignore channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to remove ignore channel'
						});
					});
			}
			else {
				insert_ignore(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'set as an ignore channel successfully'
								: 'failed to set as an ignore channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to set as an ignore channel: ' + e
						});
					});
			}
		}
		else if (args.length >= 1) {
			const role_name = args.join(' ');

			if (message.member?.id === role_name) {
				return resolve({
					result: true,
					value: `you can't ignore yourself`
				});
			}
			else {
				// check if it is a user id
				guild_object.member_list.some(m => {
					if (m.id === role_name) {
						if (m.ignored === false) {
							update_member(guild_object.id, m.id, 'ignored', true);
							const member = message.guild?.members.cache.find(mb => mb.id === m.id);

							return resolve({
								result: true,
								value: `member ${member ? member : m.id} has been added to ignore list`
							});
						}
						else {
							update_member(guild_object.id, m.id, 'ignored', false);
							const member = message.guild?.members.cache.find(mb => mb.id === m.id);

							return resolve({
								result: true,
								value: `member ${member ? member : m.id} has been removed from ignore list`
							});
						}
					}
					return false;
				});
			}
		}
		else {
			return resolve({
				result: false,
				value: 'you can run `./help ignore` for help'
			});
		}
	});
};
