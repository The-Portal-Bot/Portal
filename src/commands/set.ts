import { Client, Message } from "discord.js";
import { included_in_voice_list } from "../libraries/guildOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { set_attribute } from "../types/interfaces/Attribute";

const locales = ['gr', 'en', 'de'];

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		if (!message.guild) {
			return resolve({ result: true, value: 'guild could not be fetched' });
		}
		if (!message.member) {
			return resolve({ result: true, value: 'member could not be fetched' });
		}

		if (message.member.voice.channel === undefined || message.member.voice.channel === null) {
			return resolve ({
				result: false,
				value: 'you must be in a channel handled by Portal™.',
			});
		}
		else if (!included_in_voice_list(message.member.voice.channel.id, guild_object.portal_list)) {
			return resolve ({
				result: false,
				value: 'the channel you are in is not handled by Portal™.',
			});
		}

		if (args.length > 1) {
			for (const portal_key in guild_object.portal_list) {
				for (const voice_key in guild_object.portal_list[portal_key].voice_list) {
					if (voice_key === message.member.voice.channel.id) {
						const current_voice_channel = guild_object.portal_list[portal_key].voice_list[voice_key];
						const current_portal_channel = guild_object.portal_list[portal_key];

						let value_array = [...args];
						value_array.shift();
						const value = value_array.filter(val => val !== '\n').join(' ');

						const return_value = set_attribute(
							message.member.voice.channel, current_voice_channel, current_portal_channel,
							guild_object, args[0], value, message.member,
						);

						switch (return_value) {
						case 1:
							return resolve ({
								result: true,
								value: `attribute ${args[0]} set to ${value} successfully.`,
							});
						case -1:
							return resolve({
								result: false,
								value: `${args[0]} is not an attribute.`,
							});
						case -2:
							return resolve ({
								result: false,
								value: `${args[0]} can only be set by an administrator.`,
							});
						case -3:
							return resolve({
								result: false,
								value: `${args[0]} can only be set by the portal creator.`,
							});
						case -4:
							return resolve({
								result: false,
								value: `${args[0]} can only be set by the voice creator.`,
							});
						case -5:
							return resolve ({
								result: false,
								value: `locale can only be ${locales.join(', ')}.`,
							});
						case -6:
							return resolve({
								result: false,
								value: `${args[0]} can be a number from 0-n (0 means unlimited).`,
							});
						case -7:
							return resolve({
								result: false,
								value: `${args[0]} can only be true or false.`,
							});
						default:
							return resolve ({
								result: false,
								value: `${args[0]} cannot be set.`,
							});
						}
					}
				}
			}
		}
		return resolve ({
			result: true,
			value: `${args[0]} was not set.`,
		});
	});
};
