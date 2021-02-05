import { Message } from "discord.js";
import { included_in_mute_list } from "../../../libraries/guildOps";
import { insert_mute, remove_mute } from "../../../libraries/mongoOps";
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
			if (included_in_mute_list(message.channel.id, guild_object)) {
				remove_mute(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'successfully removed mute channel'
								: 'failed to remove mute channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to remove mute channel'
						});
					});
			}
			else {
				insert_mute(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'set as a mute channel successfully'
								: 'failed to set as a mute channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to set as a mute channel'
						});
					});
			}
		}
		else {
			return resolve({
				result: false,
				value: 'you can run `./help mute` for help'
			});
		}
	});
};
