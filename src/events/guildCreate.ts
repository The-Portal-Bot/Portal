import { Client, Guild } from "discord.js";
import { included_in_portal_guilds, insert_guild } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (client: Client, guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string) => {
	// Inserting guild to portal's guild list if it does not exist
	if (!included_in_portal_guilds(guild.id, guild_list)) {
		insert_guild(guild.id, guild_list, client);
	}

	update_portal_managed_guilds(true, portal_managed_guilds_path, guild_list);

	return {
		result: true,
		value: `Portal joined guild ${guild.name} [${guild.id}] ` +
			`which has ${guild.memberCount} members.`,
	};
};