import { GuildCreateChannelOptions, Message } from "discord.js";
import { create_channel } from "../../../libraries/guild.library";
import { message_help } from "../../../libraries/help.library";
import { insert_portal } from "../../../libraries/mongo.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { PortalChannelPrtl } from "../../../types/classes/PortalChannelPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length === 0) {
			return resolve({
				result: false,
				value: message_help('commands', 'portal')
			});
		}

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

		const current_guild = message.guild;
		const current_member = message.member;

		let portal_channel: string = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		let portal_category: string | null = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

		if (portal_channel === '' && portal_category !== '') {
			portal_channel = portal_category;
			portal_category = null;
		}

		const portal_options: GuildCreateChannelOptions = {
			topic: `by Portal, channels on demand`,
			type: 'voice',
			bitrate: 64000,
			userLimit: 1
		};
		const voice_regex = guild_object.premium
			? 'G$#-P$member_count | $status_list'
			: 'Channel $#';

		create_channel(current_guild, portal_channel, portal_options, portal_category)
			.then(r_channel => {
				if (r_channel.result) {
					insert_portal(guild_object.id, new PortalChannelPrtl(
						r_channel.value, current_member.id, true, portal_channel, voice_regex,
						[], false, guild_object.locale, true, true, 0, false
					))
						.then(r_portal => {
							if (r_portal) {
								return resolve({
									result: true,
									value: 'portal channel has been created.\n' +
										'Keep in mind that due to Discord\'s limitations,\n' +
										'channel names will be updated on a five minute interval'
								});
							} else {
								return resolve({
									result: false,
									value: 'portal channel failed to be created'
								});
							}
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `portal channel failed to be created (${e})`
							});
						});
				} else {
					return resolve({
						result: r_channel.result,
						value: message_help('commands', 'portal', r_channel.value)
					});
				}
			})
			.catch(e => {
				return resolve({
					result: false,
					value: `an error occurred while creating channel (${e})`
				});
			});
	});
};
