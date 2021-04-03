import { Message } from "discord.js";
import { message_help } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";
import { set_attribute } from "../../types/interfaces/Attribute.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild) {
			return resolve({
				result: true,
				value: 'guild could not be fetched'
			});
		}

		if (!message.member) {
			return resolve({
				result: true,
				value: 'member could not be fetched'
			});
		}

		if (args.length >= 2) {
			const value_array = [...args];
			value_array.shift();

			const value = value_array
				.filter(val => val !== '\n')
				.join(' ');

			set_attribute(message.member.voice.channel, guild_object, args[0], value, message.member, message)
				.then(r => {
					return resolve(r);
				})
				.catch(e => {
					return resolve({
						result: false,
						value: `something went wrong in set function / ${e}`
					});
				});
		} else {
			return resolve({
				result: false,
				value: message_help('commands', 'set', 'arguments are set by name and value')
			});
		}
	});
};
