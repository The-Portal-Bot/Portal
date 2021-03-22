import { Message } from "discord.js";
import { included_in_ignore_list } from "../../libraries/guild.library";
import { message_help } from "../../libraries/help.library";
import { insert_ignore, remove_ignore } from "../../libraries/mongo.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild) {
			return resolve({
				result: false,
				value: 'guild could not be fetched'
			});
		}

		if (args.length === 0) { // channel ignore
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
							value: `failed to set as an ignore channel / ${e}`
						});
					});
			}
		}
		else {
			return resolve({
				result: false,
				value: message_help('commands', 'ignore')
			});
		}
	});
};
