import { Message } from "discord.js";
import { PortalChannelTypes } from "../../../data/enums/PortalChannel.enum";
import { delete_channel, included_in_voice_list, regex_interpreter } from "../../../libraries/guild.library";
import { message_help } from "../../../libraries/help.library";
import { update_voice } from "../../../libraries/mongo.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

// NEEDS FIXING
module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.member) {
			return resolve({
				result: false,
				value: message_help('commands', 'force', 'member could not be fetched')
			});
		}

		if (!message.member.voice.channel) {
			return resolve({
				result: false,
				value: message_help('commands', 'force', 'you must be in a channel handled by Portal')
			});
		}

		if (!included_in_voice_list(message.member.voice.channel.id, guild_object.portal_list)) {
			return resolve({
				result: false,
				value: message_help('commands', 'force', 'the channel you are in is not handled by Portal')
			});
		}

		const current_member = message.member;
		const current_voice = message.member.voice.channel;

		guild_object.portal_list.some(p => {
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
								message.guild,
								message.author.id
							);

							current_voice.clone({ name: updated_name })
								.then(clone => {
									if (current_voice) {
										current_voice.members.forEach(member => member.voice.setChannel(clone));
										update_voice(guild_object.id, p.id, current_voice.id, 'id', clone.id)
											.then(r => {
												delete_channel(PortalChannelTypes.voice, current_voice, message, true);

												return resolve({
													result: r,
													value: r
														? 'force updated voice'
														: message_help('commands', 'force', 'failed to force update')
												});
											})
											.catch(e => {
												return resolve({
													result: false,
													value: message_help('commands', 'force', `failed to force update channel ${e}`)
												});
											});
									}
								})
								.catch(e => {
									return resolve({
										result: false,
										value: message_help('commands', 'force', `error while cloning channel ${e}`)
									});
								});
						} else {
							return resolve({
								result: false,
								value: message_help('commands', 'force', 'could not fetch message\'s guild')
							});
						}
					} else {
						return resolve({
							result: false,
							value: message_help('commands', 'force', 'you are not the creator of the channel')
						});
					}
				}
			});
		});
	});
};
