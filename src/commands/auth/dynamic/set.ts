import { Message } from "discord.js";
import { included_in_voice_list } from "../../../libraries/guildOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { set_attribute } from "../../../types/interfaces/Attribute";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

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

		if (message.member.voice.channel === undefined || message.member.voice.channel === null) {
			return resolve({
				result: false,
				value: 'you must be in a channel handled by Portal'
			});
		}

		if (!included_in_voice_list(message.member.voice.channel.id, guild_object.portal_list)) {
			return resolve({
				result: false,
				value: 'the channel you are in is not handled by Portal'
			});
		}

		if (args.length >= 2) {
			guild_object.portal_list.some(p => {
				p.voice_list.some(v => {
					if (v.id === message.member?.voice.channel?.id) {
						let value_array = [...args];
						value_array.shift();
						const value = value_array.filter(val => val !== '\n').join(' ');

						set_attribute(
							message.member.voice.channel, v, p,
							guild_object, args[0], value, message.member
						)
							.then(r => {
								return resolve(r);
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `something went wrong in set function`
								});
							});
					}
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
