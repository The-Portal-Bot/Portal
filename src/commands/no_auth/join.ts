import { Client, Message } from "discord.js";
import { join_user_voice } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		join_user_voice(client, message, guild_object, true)
			.then(() => {
				return resolve({
					result: true,
					value: 'successfully joined voice channel'
				});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: `failed to join voice channel ${e}`
				})
			});
	});
};
