import { Guild } from "discord.js";
import { delete_guild } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";


module.exports = async (
	args: { guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {

		delete_guild(args.guild.id, args.guild_list);
		update_portal_managed_guilds(args.portal_managed_guilds_path, args.guild_list);

		return resolve({
			result: true,
			value: `portal has been removed from: ${args.guild.name} [id: ${args.guild.id}]`,
		});
	});
};