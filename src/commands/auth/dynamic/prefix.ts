import { Message } from "discord.js";
import { message_help } from "../../../libraries/help.library";
import { update_guild } from "../../../libraries/mongo.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length === 0) {
			return resolve({
				result: true,
				value: `portal's prefix is \`${guild_object.prefix}\``
			});
		}

		if (args.length > 1) {
			return resolve({
				result: false,
				value: message_help('commands', 'prefix', `prefix can only be one word`)
			});
		}

		if (!message.guild) {
			return resolve({
				result: false,
				value: 'could not fetch guild from message'
			});
		}

		update_guild(guild_object.id, 'prefix', args[0])
			.then(r => {
				return resolve({
					result: r,
					value: r
						? `portal's prefix has been updated to ${args[0]}`
						: `portal's prefix could not be update is still ${guild_object.prefix}`
				});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: `portal's prefix could not be update is still ${guild_object.prefix} (${e})`
				});
			});
	});
};
