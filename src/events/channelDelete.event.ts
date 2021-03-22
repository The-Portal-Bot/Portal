import { Channel, PartialDMChannel, TextChannel, VoiceChannel } from "discord.js";
import { PortalChannelTypes } from "../data/enums/PortalChannel.enum";
import { logger } from "../libraries/help.library";
import { deleted_channel_sync } from "../libraries/mongo.library";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

module.exports = async (
	args: { channel: Channel | PartialDMChannel }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.channel.type !== 'text' && args.channel.type !== 'voice') {
			return resolve({
				result: false,
				value: `only voice and text channels are handled`
			});
		}

		const current_channel = (typeof args.channel === typeof VoiceChannel)
			? <VoiceChannel>args.channel
			: <TextChannel>args.channel;

		deleted_channel_sync(current_channel)
			.then(r => {
				if (r > 0) {
					return resolve({
						result: true,
						value: `${PortalChannelTypes[r].toString()} channel removed from ` +
							`${current_channel.guild.name}|${current_channel.guild.id}`
					});
				} else {
					return resolve({
						result: false,
						value: `${PortalChannelTypes[r].toString()} channel is not controlled`
					});
				}
			})
			.catch(e => {
				logger.log({ level: 'error', type: 'none', message: new Error(`error syncing deleted channel / ${e}`).message });
				return resolve({
					result: false,
					value: `error syncing deleted channel from ` +
						`${current_channel.guild.name}|${current_channel.guild.id}`
				});
			});
	});
};