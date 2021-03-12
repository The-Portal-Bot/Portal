import { Message } from "discord.js";
import Roll from 'roll';
import { create_rich_embed, max256, message_help } from "../../../libraries/help.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length > 0) {
			let roll_command: string = args.join(' ').substr(0, args.join(' ').indexOf('|'));
			let roll_options: string | null = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

			if (roll_command === '' && roll_options !== '') {
				roll_command = roll_options;
				roll_options = null;
			}

			roll_command = roll_command.replace(/\s/g, '');

			try {
				const roll_lib = new Roll();
				const roll = roll_lib.roll(roll_command)
				const show = (roll_options && roll_options.trim() === 'show')
					? ` (${roll.rolled} from ${roll_command})`
					: ``;
				const roll_msg = `${message.member?.displayName} rolled ${roll.result}${show}`;

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
							name: max256(roll_msg),
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
					value: message_help('commands', 'roll')
				});
			}
		} else {
			return resolve({
				result: false,
				value: message_help('commands', 'roll')
			});
		}
	});
};
