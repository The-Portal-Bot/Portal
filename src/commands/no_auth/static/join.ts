import { Client, Message } from "discord.js";
import { join_user_voice } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		join_user_voice(client, message, guild_object, true)
			.then(response => { return resolve(response); })
			.catch(error => { return resolve({ result: false, value: error }) });
	});
};
