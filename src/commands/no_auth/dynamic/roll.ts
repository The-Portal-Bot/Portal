import { Message } from "discord.js";
import Roll from 'roll';
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length === 1) {
			try {
				const roll_lib = new Roll();
				const roll = roll_lib.roll(args[0])

				message.channel.send(
					create_rich_embed(
						null,
						null,
						'#FF0000',
						null,
						null,
						null,
						false,
						null,
						null,
						undefined,
						{
							name: `${message.member?.displayName} rolled ${roll.result} (${roll.rolled} from ${args[0]})`,
							icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/dice.gif'
						}						
					));

				return resolve({
					result: true,
					value: ''
				});
			} catch (err) {
				return resolve({
					result: false,
					value: 'you can run `./help roll` for help'
				});
			}
		} else {
			return resolve({
				result: false,
				value: 'you can run `./help roll` for help'
			});
		}
	});
};
