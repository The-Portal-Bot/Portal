import { VideoSearchResult } from "yt-search";
import { GiveRolePrtl } from "./GiveRolePrtl";
import { MemberPrtl } from "./MemberPrtl";
import { PortalChannelPrtl } from "./PortalChannelPrtl";

export class MusicData {
	public channel_id: string | undefined;
	public message_id: string | undefined;
	public votes: string[] | undefined;

	constructor(channel_id: string,
		message_id: string,
		votes: string[]) {
		this.channel_id = channel_id;
		this.message_id = message_id;
		this.votes = votes;
	}
}

export class GuildPrtl {
	public id: string;
	public portal_list: PortalChannelPrtl[];
	public member_list: MemberPrtl[];
	public url_list: string[];
	public role_list: GiveRolePrtl[];
	public ranks: string[];
	public auth_role: string[];
	public spotify: string;
	public music_data: MusicData;
	public music_queue: VideoSearchResult[];
	public dispatcher: any;
	public announcement: string | null;
	public locale: string;
	public announce: number;
	public level_speed: string;
	public premium: boolean;

	constructor(
		id: string,
		portal_list: PortalChannelPrtl[],
		member_list: MemberPrtl[],
		url_list: string[],
		role_list: GiveRolePrtl[],
		ranks: string[],
		auth_role: string[],
		spotify: string,
		music_data: MusicData,
		music_queue: string[],
		dispatcher: any,
		announcement: string | null,
		locale: string,
		announce: number,
		level_speed: string,
		premium: boolean
	) {
		this.id = id;
		this.portal_list = portal_list;
		this.member_list = member_list;
		this.url_list = url_list;
		this.role_list = role_list;
		this.ranks = ranks;
		this.auth_role = auth_role;
		this.spotify = spotify;
		this.music_data = music_data;
		this.music_queue = music_queue;
		this.dispatcher = dispatcher;
		this.announcement = announcement;
		this.locale = locale;
		this.announce = announce;
		this.level_speed = level_speed;
		this.premium = premium;
	}
};