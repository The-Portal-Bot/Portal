import { Client, Guild } from "discord.js";
import { included_in_portal_guilds } from "../libraries/guildOps";
import { insert_guild, update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

module.exports = async (
	args: { client: Client, guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		// Inserting guild to portal's guild list if it does not exist
		if (!included_in_portal_guilds(args.guild.id, args.guild_list))
			insert_guild(args.guild.id, args.guild_list, args.client);

		update_portal_managed_guilds(args.portal_managed_guilds_path, args.guild_list);

		return resolve({
			result: true,
			value: `portal joined guild ${args.guild.name} [${args.guild.id}]`
		});
	});
};