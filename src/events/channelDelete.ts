import { DMChannel, GuildChannel } from "discord.js";
import { delete_channel } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

const type_of_channel = ['Unknown', 'Portal', 'Voice', 'Url', 'Spotify', 'Announcement', 'Music'];

module.exports = async (
	args: { channel: GuildChannel }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (typeof args.channel === typeof DMChannel) {
			delete_channel(args.channel)
				.then(response => {
					if (response >= 0) {
						return resolve({
							result: true,
							value: `${type_of_channel[response].toString()} channel, has been removed from database ` +
								`guild: ${args.channel.guild.name} [${args.channel.guild.id}]`,
						});
					} else {
						return resolve({ result: false, value: `channel is not controlled by Portal` });
					}
				});
		}
	});
};