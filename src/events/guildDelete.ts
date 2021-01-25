import { Guild } from "discord.js";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { remove_guild } from "../libraries/mongoOps";


module.exports = async (
	args: { guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		remove_guild(args.guild.id);
		update_portal_managed_guilds(args.portal_managed_guilds_path, args.guild_list);

		return resolve({
			result: true,
			value: `portal has been removed from: ${args.guild.name} [id: ${args.guild.id}]`,
		});
	});
};