import { Client, Message } from "discord.js";
import Roll from 'roll';
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}

		if (args.length === 1) {
			const roll_lib = new Roll();
			const roll = roll_lib.roll(args[0]);
			message.channel.send(
				`rolled ${roll.result} (${roll.rolled} from ${args[0]})`
			);

			return resolve({
				result: true,
				value: undefined
			});
		} else {
			return resolve({
				result: false,
				value: '*you can run "./help roll" for help.*'
			});
		}
	});
};
