import { Guild } from "discord.js";
import { delete_guild } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";


module.exports = async (guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string) => {
	delete_guild(guild.id, guild_list);
	update_portal_managed_guilds(true, portal_managed_guilds_path, guild_list);

	return {
		result: true,
		value: `Portal has been removed from: ${guild.name} (id: ${guild.id})`,
	};
};