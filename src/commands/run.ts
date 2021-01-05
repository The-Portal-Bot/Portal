import { Client, Message } from "discord.js";
import { included_in_voice_list, regex_interpreter } from "../libraries/guildOps";
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
		if (!message.guild) {
			return resolve({ result: true, value: 'guild could not be fetched' });
		}
		if (!message.member) {
			return resolve({ result: true, value: 'member could not be fetched' });
		}

		const current_voice = message.member.voice;
		const current_voice_channel = current_voice.channel;

		if (current_voice === null) {
			return resolve({
				result: false,
				value: '*you must be in a channel handled by* **Portal™** *to run commands.*',
			});
		}
		else if (current_voice_channel === null) {
			return resolve({
				result: false,
				value: '*you must be in a channel handled by* **Portal™** *to run commands.*',
			});
		}
		else if (!included_in_voice_list(current_voice_channel.id, guild_object.portal_list)) {
			return resolve({
				result: false,
				value: '*the channel you are in is not handled by* **Portal™**',
			});
		}

		const voice_found = guild_object.portal_list.some(p => {
			p.voice_list.some(v => {
				if (v.id === current_voice_channel.id) {
					message.channel.send('executing: ' + args.join(' '))
						.then(sent_message => {
							if (message.guild)
								sent_message.edit(
									regex_interpreter(
										args.join(' '),
										current_voice_channel,
										v,
										guild_object.portal_list,
										guild_object,
										message.guild
									)
								);
							else
								sent_message.edit('could not fetch guild of message');
						});
				}
			})
		});

		return resolve({
			result: true,
			value: '*command ran successfully.*',
		});
	});
};
