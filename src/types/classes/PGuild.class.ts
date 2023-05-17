import { Document } from "mongoose";
import { VideoSearchResult } from "yt-search";
import { PGiveRole } from "./PGiveRole.class";
import { PPoll } from "./PPoll.class";
import { IPChannel, PChannel } from "./PPortalChannel.class";
import { Rank } from "./PTypes.interface";
import { PMember } from "./PMember.class";

export class MusicData {
	public channel_id: string | undefined;
	public message_id: string | undefined;
	public message_lyrics_id: string | undefined;
	public votes: string[] | undefined;
	public pinned: boolean;

	constructor(
		channel_id: string,
		message_id: string,
		message_lyrics_id: string,
		votes: string[],
		pinned: boolean
	) {
		this.channel_id = channel_id;
		this.message_id = message_id;
		this.message_lyrics_id = message_lyrics_id;
		this.votes = votes;
		this.pinned = pinned;
	}
}

export class PGuild {
	public id: string;
	public portal_list: PChannel[];
	public member_list: PMember[];
	public ignore_list: string[];
	public url_list: string[];
	public role_list: PGiveRole[];
	public poll_list: PPoll[];
	public initial_role: string | null;
	public ranks: Rank[];
	public music_data: MusicData;
	public music_queue: VideoSearchResult[];
	public announcement: string | null;
	public mute_role: string | null;
	public locale: number;
	public announce: boolean;
	public rank_speed: number;
	public profanity_level: number;
	public kick_after: number;
	public ban_after: number;
	public premium: boolean;
	public prefix: string;

	constructor(
		id: string,
		portal_list: PChannel[],
		member_list: PMember[],
		ignore_list: string[],
		url_list: string[],
		role_list: PGiveRole[],
		poll_list: PPoll[],
		initial_role: string | null,
		ranks: Rank[],
		music_data: MusicData,
		music_queue: VideoSearchResult[],
		announcement: string | null,
		locale: number,
		announce: boolean,
		mute_role: string | null,
		rank_speed: number,
		kick_after: number,
		ban_after: number,
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
		this.initial_role = initial_role;
		this.ranks = ranks;
		this.music_data = music_data;
		this.music_queue = music_queue;
		this.announcement = announcement;
		this.locale = locale;
		this.announce = announce;
		this.mute_role = mute_role;
		this.rank_speed = rank_speed;
		this.kick_after = kick_after;
		this.ban_after = ban_after;
		this.profanity_level = profanity_level;
		this.premium = premium;
		this.prefix = prefix;
	}
}

export interface IPGuild extends Document {
	id: string;
	portal_list: [IPChannel];
	member_list: PMember[];
	ignore_list: string[];
	url_list: string[];
	role_list: PGiveRole[];
	poll_list: PPoll[];
	initial_role: string | null;
	ranks: Rank[];
	music_data: MusicData;
	music_queue: VideoSearchResult[];
	announcement: string | null;
	locale: number;
	announce: boolean;
	mute_role: string | null;
	rank_speed: number;
	kick_after: number;
	ban_after: number;
	profanity_level: number;
	premium: boolean;
	prefix: string;
}
