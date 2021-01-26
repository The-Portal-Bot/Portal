import { Client, Message } from "discord.js";
import { included_in_voice_list, regex_interpreter } from "../../../libraries/guildOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { PortalChannelPrtl } from "../../../types/classes/PortalChannelPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

const renameKey = (portal_object: PortalChannelPrtl, oldKey: string, newKey: string) => {
	if (oldKey !== newKey) {
		if (Object.prototype.hasOwnProperty.call(portal_object.voice_list, oldKey)) {
			let voice_object_newKey = portal_object.voice_list.find(v => v.id === newKey);
			const voice_object_oldKey = portal_object.voice_list.find(v => v.id === oldKey);
			voice_object_newKey = voice_object_oldKey;

			if (voice_object_oldKey) {
				voice_object_oldKey.id = 'delete';
				portal_object.voice_list.find((v, index) => {
					if (v.id === 'delete') {
						portal_object.voice_list.splice(index, 1);
					}
				});
			}

			return portal_object;
		}
	}
	return portal_object;
};

const copyKey = (portal_object: PortalChannelPrtl, oldKey: string, cpyKey: string) => {
	if (oldKey !== cpyKey) {
		if (Object.prototype.hasOwnProperty.call(portal_object.voice_list, oldKey)) {
			let voice_object_cpyKey = portal_object.voice_list.find(v => v.id === cpyKey);
			const voice_object_oldKey = portal_object.voice_list.find(v => v.id === oldKey);
			voice_object_cpyKey = voice_object_oldKey;

			return portal_object;
		}
	}
	return portal_object;
};

// NEEDS FIXING
module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.member) {
			return resolve({ result: true, value: 'member could not be fetched' });
		}

		if (!message.member.voice.channel) {
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

		let return_value: string = '';
		const executed_force = guild_object.portal_list.some(p => {
			return p.voice_list.some(v => {
				if (v.id === message?.member?.voice?.channel?.id) {
					if (v.creator_id === message.member.id) {
						if (message.guild) {
							const updated_name = regex_interpreter(
								v.regex,
								message.member.voice.channel,
								v,
								guild_object.portal_list,
								guild_object,
								message.guild
							);

							message.member.voice.channel.clone({ name: updated_name })
								.then(clone => {
									if (message.member && message.member.voice.channel) {
										p = copyKey(p, message.member.voice.channel.id, 'intermidiary');

										message.member?.voice.channel?.members.forEach(member => {
											member.voice.setChannel(clone);
										});

										setTimeout(() => {
											p = renameKey(p, 'intermidiary', clone.id);
										}, 3000);
									}
								})
								.catch((error: any) => {
									return_value = error;
									return false;
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
