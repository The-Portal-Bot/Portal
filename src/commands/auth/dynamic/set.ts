import { Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { set_attribute } from "../../../types/interfaces/Attribute.interface";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

const locales = ['gr', 'en', 'de'];

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
			let value_array = [...args];
			value_array.shift();
			const value = value_array.filter(val => val !== '\n').join(' ');

			set_attribute(message.member.voice.channel, guild_object, args[0], value, message.member)
				.then(r => {
					return resolve(r);
				})
				.catch(e => {
					return resolve({
						result: false,
						value: `something went wrong in set function`
					});
				});
		} else {
			return resolve({
				result: false,
				value: `arguments are set by name and value, run \`./help set\` for help`
			});
		}
	});
};
