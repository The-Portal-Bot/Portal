import { Document } from 'mongoose';
import { VideoSearchResult } from 'yt-search';
import { PGiveRole } from './PGiveRole.class.js';
import { PMember } from './PMember.class.js';
import { PPoll } from './PPoll.class.js';
import { IPChannel, PChannel } from './PPortalChannel.class.js';
import { Rank } from './PTypes.interface';

export class MusicData {
  public channelId: string | undefined;
  public messageId: string | undefined;
  public messageLyricsId: string | undefined;
  public votes: string[] | undefined;
  public pinned: boolean;

  constructor(channelId: string, messageId: string, messageLyricsId: string, votes: string[], pinned: boolean) {
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
  public pIgnores: string[];
  public pURLs: string[];
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

  constructor(
    id: string,
    pChannels: PChannel[],
    pMembers: PMember[],
    pIgnores: string[],
    pURLs: string[],
    pRoles: PGiveRole[],
    pPolls: PPoll[],
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
  ) {
    this.id = id;
    this.pChannels = pChannels;
    this.pMembers = pMembers;
    this.pIgnores = pIgnores;
    this.pURLs = pURLs;
    this.pRoles = pRoles;
    this.pPolls = pPolls;
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
  }
}

export interface IPGuild extends Document {
  id: string;
  pChannels: [IPChannel];
  pMembers: PMember[];
  pIgnores: string[];
  pURLs: string[];
  pRoles: PGiveRole[];
  pPolls: PPoll[];
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
}
