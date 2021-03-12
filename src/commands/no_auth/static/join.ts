import { Client, Message } from "discord.js";
import { join_user_voice, message_help } from "../../../libraries/help.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		join_user_voice(client, message, guild_object, true)
			.then(r => {
				return resolve(
					r
				);
			})
			.catch(e => {
				return resolve({
					result: false,
					value: message_help('commands', 'join', e)
				})
			});
	});
};
