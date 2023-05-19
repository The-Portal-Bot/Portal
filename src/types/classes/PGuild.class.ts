import { Document } from "mongoose";
import { VideoSearchResult } from "yt-search";
import { PGiveRole } from "./PGiveRole.class";
import { PPoll } from "./PPoll.class";
import { IPChannel, PChannel } from "./PPortalChannel.class";
import { Rank } from "./PTypes.interface";
import { PMember } from "./PMember.class";

export class MusicData {
	public channelId: string | undefined;
	public messageId: string | undefined;
	public messageLyricsId: string | undefined;
	public votes: string[] | undefined;
	public pinned: boolean;

	constructor(
		channelId: string,
		messageId: string,
		messageLyricsId: string,
		votes: string[],
		pinned: boolean
	) {
		this.channelId = channelId;
		this.messageId = messageId;
		this.messageLyricsId = messageLyricsId;
		this.votes = votes;
		this.pinned = pinned;
	}
}

export class PGuild {
	public id: string;
	public pChannels: PChannel[];
	public pMembers: PMember[];
	public ignoreList: string[];
	public urlList: string[];
	public pRoles: PGiveRole[];
	public pPolls: PPoll[];
	public initialRole: string | null;
	public ranks: Rank[];
	public musicData: MusicData;
	public musicQueue: VideoSearchResult[];
	public announcement: string | null;
	public muteRole: string | null;
	public locale: number;
	public announce: boolean;
	public rankSpeed: number;
	public profanityLevel: number;
	public kickAfter: number;
	public banAfter: number;
	public premium: boolean;
	public prefix: string;

	constructor(
		id: string,
		portalList: PChannel[],
		memberList: PMember[],
		ignoreList: string[],
		urlList: string[],
		roleList: PGiveRole[],
		pollList: PPoll[],
		initialRole: string | null,
		ranks: Rank[],
		musicData: MusicData,
		musicQueue: VideoSearchResult[],
		announcement: string | null,
		locale: number,
		announce: boolean,
		muteRole: string | null,
		rankSpeed: number,
		kickAfter: number,
		banAfter: number,
		profanityLevel: number,
		premium: boolean,
		prefix: string
	) {
		this.id = id;
		this.pChannels = portalList;
		this.pMembers = memberList;
		this.ignoreList = ignoreList;
		this.urlList = urlList;
		this.pRoles = roleList;
		this.pPolls = pollList;
		this.initialRole = initialRole;
		this.ranks = ranks;
		this.musicData = musicData;
		this.musicQueue = musicQueue;
		this.announcement = announcement;
		this.locale = locale;
		this.announce = announce;
		this.muteRole = muteRole;
		this.rankSpeed = rankSpeed;
		this.kickAfter = kickAfter;
		this.banAfter = banAfter;
		this.profanityLevel = profanityLevel;
		this.premium = premium;
		this.prefix = prefix;
	}
}

export interface IPGuild extends Document {
	id: string;
	portalList: [IPChannel];
	memberList: PMember[];
	ignoreList: string[];
	urlList: string[];
	roleList: PGiveRole[];
	pollList: PPoll[];
	initialRole: string | null;
	ranks: Rank[];
	musicData: MusicData;
	musicQueue: VideoSearchResult[];
	announcement: string | null;
	locale: number;
	announce: boolean;
	muteRole: string | null;
	rankSpeed: number;
	kickAfter: number;
	banAfter: number;
	profanityLevel: number;
	premium: boolean;
	prefix: string;
}
