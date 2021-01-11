import { DMChannel, GuildChannel } from "discord.js";
import { channel_deleted_update_state } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

const type_of_channel = ['Unknown', 'Portal', 'Voice', 'Url', 'Spotify', 'Announcement', 'Music'];

module.exports = async (
	args: { channel: GuildChannel, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (typeof args.channel === typeof DMChannel)
			return resolve({ result: false, value: 'channel is not guild channel' });

		const return_value = channel_deleted_update_state(args.channel, args.guild_list);

		if (return_value === 0) {
			return resolve({ result: false, value: `channel is not controlled by Portal` });
		} else {
			update_portal_managed_guilds(args.portal_managed_guilds_path, args.guild_list);
			return resolve({
				result: true,
				value: `${type_of_channel[return_value].toString()} channel, has been removed from database ` +
					`guild: ${args.channel.guild.name} [${args.channel.guild.id}]`,
			});
		}
	});
};