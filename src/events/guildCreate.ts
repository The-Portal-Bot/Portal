import { Client, Guild } from "discord.js";
import { included_in_portal_guilds, insert_guild } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	args: { client: Client, guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
) => {
	// Inserting guild to portal's guild list if it does not exist
	if (!included_in_portal_guilds(args.guild.id, args.guild_list)) {
		insert_guild(args.guild.id, args.guild_list, args.client);
	}

	update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.guild_list);

	return {
		result: true,
		value: `Portal joined guild ${args.guild.name} [${args.guild.id}] ` +
			`which has ${args.guild.memberCount} members.`,
	};
};