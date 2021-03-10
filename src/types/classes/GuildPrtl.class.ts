import { Document } from "mongoose";
import { VideoSearchResult } from "yt-search";
import { Rank } from "../interfaces/InterfacesPrtl.interface";
import { GiveRolePrtl } from "./GiveRolePrtl.class";
import { MemberPrtl } from "./MemberPrtl.class";
import { PollPrtl } from "./PollPrtl.class";
import { PortalChannelPrtl } from "./PortalChannelPrtl.class";

export class MusicData {
	public channel_id: string | undefined;
	public message_id: string | undefined;
	public votes: string[] | undefined;

	constructor(
		channel_id: string,
		message_id: string,
		votes: string[]
	) {
		this.channel_id = channel_id;
		this.message_id = message_id;
		this.votes = votes;
	}
}

export class GuildPrtl {
	public id: string;
	public portal_list: PortalChannelPrtl[];
	public member_list: MemberPrtl[];
	public ignore_list: string[];
	public url_list: string[];
	public role_list: GiveRolePrtl[];
	public poll_list: PollPrtl[];
	public ranks: Rank[];
	public music_data: MusicData;
	public music_queue: VideoSearchResult[];
	public announcement: string | null;
	public locale: number;
	public announce: boolean;
	public level_speed: number;
	public profanity_level: number;
	public premium: boolean;
	public prefix: string;

	constructor(
		id: string,
		portal_list: PortalChannelPrtl[],
		member_list: MemberPrtl[],
		ignore_list: string[],
		url_list: string[],
		role_list: GiveRolePrtl[],
		poll_list: PollPrtl[],
		ranks: Rank[],
		music_data: MusicData,
		music_queue: VideoSearchResult[],
		announcement: string | null,
		locale: number,
		announce: boolean,
		level_speed: number,
		profanity_level: number,
		premium: boolean,
		prefix: string
	) {
		this.id = id;
		this.portal_list = portal_list;
		this.member_list = member_list;
		this.ignore_list = ignore_list;
		this.url_list = url_list;
		this.role_list = role_list;
		this.poll_list = poll_list;
		this.ranks = ranks;
		this.music_data = music_data;
		this.music_queue = music_queue;
		this.announcement = announcement;
		this.locale = locale;
		this.announce = announce;
		this.level_speed = level_speed;
		this.profanity_level = profanity_level;
		this.premium = premium;
		this.prefix = prefix;
	}
};

export interface IGuildPrtl extends Document {
	id: string,
	portal_list: PortalChannelPrtl[],
	member_list: MemberPrtl[],
	ignore_list: string[],
	url_list: string[],
	role_list: GiveRolePrtl[],
	poll_list: PollPrtl[],
	ranks: Rank[],
	music_data: MusicData,
	music_queue: VideoSearchResult[],
	announcement: string | null,
	locale: number,
	announce: boolean,
	level_speed: string,
	profanity_level: string,
	premium: boolean,
	prefix: string
}
