import { Channel, PartialDMChannel, TextChannel, VoiceChannel, StreamDispatcher } from "discord.js";
import { deleted_channel_sync } from "../libraries/mongo.library";
import { PortalChannelTypes } from "../types/enums/PortalChannel.enum";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	args: { channel: Channel | PartialDMChannel }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.channel.type !== 'text' && args.channel.type !== 'voice')
			return resolve({
				result: false,
				value: `only voice and text channels are handled by Portal`
			});

		const current_channel = (typeof args.channel === typeof VoiceChannel)
			? <VoiceChannel>args.channel
			: <TextChannel>args.channel;

		deleted_channel_sync(current_channel)
			.then(r => {
				if (r > 0) {
					return resolve({
						result: true,
						value: `${PortalChannelTypes[r].toString()} channel, has been removed from database ` +
							`guild: ${current_channel.guild.name} [${current_channel.guild.id}]`,
					});
				} else {
					return resolve({
						result: false,
						value: `${PortalChannelTypes[r].toString()} channel is not controlled by Portal`
					});
				}
			})
			.catch(e => {
				return resolve({
					result: false,
					value: `error syncing deleted channel`
				});
			});

	});
};