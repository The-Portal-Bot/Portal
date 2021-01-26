import { Client, Message } from "discord.js";
import Roll from 'roll';
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length === 1) {
			const roll_lib = new Roll();
			const roll = roll_lib.roll(args[0]);
			message.channel.send(
				`rolled ${roll.result} (${roll.rolled} from ${args[0]})`
			);

			return resolve({ result: true, value: '' });
		} else {
			return resolve({ result: false, value: 'you can run `./help roll` for help' });
		}
	});
};
