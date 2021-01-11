import { Client, Guild, StreamDispatcher } from "discord.js";
import { VideoSearchResult } from "yt-search";
import { included_in_portal_guilds } from "../libraries/guildOps";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { GiveRolePrtl } from "../types/classes/GiveRolePrtl";
import { GuildPrtl, MusicData } from "../types/classes/GuildPrtl";
import { MemberPrtl } from "../types/classes/MemberPrtl";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl";
import { Rank } from "../types/interfaces/InterfacesPrtl";

function create_member_list(guild_id: string, client: Client): MemberPrtl[] {
	const guild = client.guilds.cache.find((cached_guild: Guild) => cached_guild.id === guild_id);
	if (!guild) return [];

	const member_list: MemberPrtl[] = [];

	guild.members.cache.forEach(member => {
		if (client.user && !member.user.bot)
			if (member.id !== client.user.id)
				member_list.push(new MemberPrtl(member.id, 1, 0, 0, 0, null, false, null));
	});

	return member_list;
};

function insert_guild(guild_id: string, guild_list: GuildPrtl[], client: Client): void {
	const portal_list: PortalChannelPrtl[] = [];
	const member_list = create_member_list(guild_id, client);
	const url_list: string[] = [];
	const role_list: GiveRolePrtl[] = [];
	const ranks: Rank[] = [];
	const auth_role: string[] = [];
	const spotify: string | null = null;
	const music_data: MusicData = { channel_id: undefined, message_id: undefined, votes: [] };
	const music_queue: VideoSearchResult[] = [];
	const dispatcher: StreamDispatcher | undefined = undefined;
	const announcement: string | null = null;
	const locale: string = 'en';
	const announce: boolean = true;
	const level_speed: string = 'normal';
	const premium: boolean = false;

	guild_list.push(new GuildPrtl(guild_id, portal_list, member_list, url_list, role_list, ranks, auth_role,
		spotify, music_data, music_queue, dispatcher, announcement, locale, announce, level_speed, premium));
};

module.exports = async (
	args: { client: Client, guild: Guild, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
) => {
	// Inserting guild to portal's guild list if it does not exist
	if (!included_in_portal_guilds(args.guild.id, args.guild_list))
		insert_guild(args.guild.id, args.guild_list, args.client);

	update_portal_managed_guilds( args.portal_managed_guilds_path, args.guild_list);

	return {
		result: true,
		value: `Portal joined guild ${args.guild.name} [${args.guild.id}] ` +
			`which has ${args.guild.memberCount} members`,
	};
};