import { Channel, DMChannel, GuildChannel, PartialDMChannel } from "discord.js";
import { channel_deleted_update_state } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

const type_of_channel = ['Unknown', 'Portal', 'Voice', 'Url', 'Spotify', 'Announcement', 'Music'];

module.exports = async (channel: GuildChannel, guild_list: GuildPrtl[], portal_managed_guilds_path: string) => {
	if (typeof channel === typeof DMChannel)
		return { result: false, value: 'channel is not guild channel' };

	const return_value = channel_deleted_update_state(channel, guild_list);

	if (return_value === 0) {
		return {
			result: false,
			value: 'removed channel is not controlled by Portal' +
				`(guild: ${channel.guild.name} - id: ${channel.guild.id})`,
		};
	}
	else {
		update_portal_managed_guilds(true, portal_managed_guilds_path, guild_list);
		return {
			result: true,
			value: `${type_of_channel[return_value].toString()} channel, has been removed from ` +
				`guild: ${channel.guild.name} - id: ${channel.guild.id}`,
		};
	}
};