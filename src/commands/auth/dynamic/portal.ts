import { Client, GuildCreateChannelOptions, Message } from "discord.js";
import { create_channel } from "../../../libraries/guildOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { PortalChannelPrtl } from "../../../types/classes/PortalChannelPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { insert_portal } from "../../../libraries/mongoOps";

module.exports = async (
	client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
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
			: 'Channel $#';

		if (portal_channel !== '') {
			create_channel(message.guild, portal_channel, portal_options, portal_category)
				.then(response => {
					if (response.result) {
						if (message.member) {
							insert_portal(guild_object.id, new PortalChannelPrtl(
								response.value, message.member.id, portal_channel, voice_regex,
								[], false, 2, 0, 0, guild_object.locale, true, true, 0, false
							))
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created portal channel successfully'
											: 'failed to create portal channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create portal channel'
									});
								});
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
							insert_portal(guild_object.id, new PortalChannelPrtl(
								response.value, message.member.id, portal_channel, voice_regex,
								[], false, 2, 0, 0, guild_object.locale, true, true, 0, false
							))
								.then(response => {
									return resolve({
										result: response, value: response
											? 'created new portal channel successfully'
											: 'failed to create portal channel'
									});
								})
								.catch(error => {
									return resolve({
										result: false, value: 'failed to create portal channel'
									});
								});
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
