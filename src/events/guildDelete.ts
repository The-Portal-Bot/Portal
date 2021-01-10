import { Guild } from "discord.js";
import { delete_guild } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";


module.exports = async (
	args: { guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
) => {
	delete_guild(args.guild.id, args.guild_list);
	update_portal_managed_guilds( args.portal_managed_guilds_path, args.guild_list);

	return {
		result: true,
		value: `Portal has been removed from: ${args.guild.name} [id: ${args.guild.id}]`,
	};
};