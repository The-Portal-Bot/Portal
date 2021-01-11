import { Client, GuildCreateChannelOptions, Message } from "discord.js";
import { create_channel } from "../libraries/guildOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) return resolve({ result: true, value: 'portal guild could not be fetched' });
		if (!message.guild) return resolve({ result: true, value: 'guild could not be fetched' });
		if (!message.member) return resolve({ result: true, value: 'member could not be fetched' });

		const portal_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		const portal_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);
		const portal_options: GuildCreateChannelOptions = {
			topic: `by Portal, channels on demand`,
			type: 'voice',
			bitrate: 64000,
			userLimit: 1
		};
		const voice_regex = guild_object.premium
			? 'G$#-P$member_count | $status_list'
			: 'Channel $#'

		if (portal_channel !== '') {
			create_channel(message.guild, portal_channel, portal_options, portal_category)
				.then(response => {
					if (response.result) {
						if (message.member) {
							guild_object.portal_list.push(new PortalChannelPrtl(
								response.value, message.member.id, portal_channel, voice_regex,
								[], false, 2, 0, 0, guild_object.locale, true, true, 0, false
							));
						} else {
							return resolve({
								result: false,
								value: 'could not fetch member from message'
							});
						}

						return resolve({
							result: true,
							value: 'portal channel has been created.\n' +
								'Keep in mind that due to Discord\'s limitations,\n' +
								'channel names will be updated on a five minute interval',
						});
					} else {
						return resolve(response);
					}
				})
				.catch(error => { return resolve(error); });
		}
		else if (portal_channel === '' && portal_category !== '') {
			create_channel(message.guild, portal_category, portal_options, null)
				.then(response => {
					if (response.result) {
						if (message.member) {
							guild_object.portal_list.push(new PortalChannelPrtl(
								response.value, message.member.id, portal_channel, voice_regex,
								[], false, 2, 0, 0, guild_object.locale, true, true, 0, false
							));
						} else {
							return resolve({
								result: false,
								value: 'could not fetch member from message'
							});
						}

						return resolve({
							result: true,
							value: 'portal channel has been created.\n' +
								'Keep in mind that due to Discord\'s limitations,\n' +
								'channel names will be updated on a five minute interval',
						});
					} else {
						return resolve(response);
					}
				})
				.catch(error => { return resolve(error); });
		}
		else {
			return resolve({ result: false, value: 'you can run `./help portal` for help' });
		}
	});
};
