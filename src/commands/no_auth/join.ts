import { Client, Message } from "discord.js";
import { join_user_voice } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
	join_user_voice(client, message, guild_object, true)
		.catch(e => Promise.reject(`failed to join voice channel ${e}`));

	return {
		result: true,
		value: 'successfully joined voice channel'
	};
};
