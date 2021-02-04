import { Message } from "discord.js";
import { delete_channel, included_in_voice_list, regex_interpreter } from "../../../libraries/guildOps";
import { ChannelTypePrtl, update_voice } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

// NEEDS FIXING
module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.member) {
			return resolve({
				result: true,
				value: 'member could not be fetched'
			});
		}
		else if (!message.member.voice.channel) {
			return resolve({
				result: false,
				value: 'you must be in a channel handled by Portal',
			});
		}
		else if (!included_in_voice_list(message.member.voice.channel.id, guild_object.portal_list)) {
			return resolve({
				result: false,
				value: 'the channel you are in is not handled by Portal',
			});
		}

		const current_member = message.member;
		const current_voice = message.member.voice.channel;

		let return_value: string = '';
		const executed_force = guild_object.portal_list.some(p => {
			return p.voice_list.some(v => {
				if (v.id === current_voice.id) {
					if (v.creator_id === current_member.id) {
						if (message.guild) {
							const updated_name = regex_interpreter(
								v.regex,
								current_voice,
								v,
								guild_object.portal_list,
								guild_object,
								message.guild
							);

							current_voice.clone({ name: updated_name })
								.then(clone => {
									if (current_member && current_voice) {
										current_voice.members.forEach(member => member.voice.setChannel(clone));
										update_voice(guild_object.id, p.id, current_voice.id, 'id', clone.id)
											.then(r => return_value = r ? 'force updated voice' : 'failed to force update')
											.catch(e => return_value = 'failed to force update channel');
										delete_channel(ChannelTypePrtl.voice, current_voice, message, true);
									}
								})
								.catch((error: any) => {
									return_value = error;
								});

							return true;
						} else {
							return_value = 'could not fetch message\'s guild';
						}
					} else {
						return_value = 'you are not the creator of the channel';
					}
				}
				return false;
			});
		});

		if (executed_force) {
			return resolve({
				result: true,
				value: `successfully force updated channel`,
			});
		} else {
			return resolve({
				result: false,
				value: `failed to force update channel because ${return_value}`,
			});
		}
	});
};
