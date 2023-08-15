import { EmbedBuilder, Guild, Message, User, VoiceChannel } from 'discord.js';
import { PGuild } from './PGuild.class';
import { PMember } from './PMember.class';
import { PChannel } from './PPortalChannel.class';
import { PVoiceChannel } from './PVoiceChannel.class';

export type NoAuthCommands =
  | 'about'
  | 'announce'
  | 'bet'
  | 'corona'
  | 'crypto'
  | 'focus'
  | 'football'
  | 'help'
  | 'join'
  | 'leaderboard'
  | 'leave'
  | 'level'
  | 'ping'
  | 'poll'
  | 'ranks'
  | 'roll'
  | 'run'
  | 'state'
  | 'spam_rules'
  | 'weather'
  | 'whoami';

export type AuthCommands =
  | 'announcement'
  | 'ban'
  | 'delete_messages'
  | 'force'
  | 'ignore'
  | 'invite'
  | 'kick'
  | 'music'
  | 'portal'
  | 'vendor'
  | 'set_ranks'
  | 'set'
  | 'url';

export enum ScopeLimit {
  NONE = 'none',
  MEMBER = 'member',
  GUILD = 'guild',
}

export enum AnnouncementAction {
  fail,
  announce,
  spotify,
  url,
  readOnly,
  join,
  leave,
}

export enum EventAction {
  userConnected,
  userDisconnected,
}

export enum LogActions {
  ready,
  updatingGuild,
  presenceControlledAway,
  presenceControlled,
  couldNotFetchData,
}

export type MongoPromise = {
  matchedCount?: number; // Number of documents matched
  modifiedCount?: number; // Number of documents modified
  acknowledged?: number; // Boolean indicating everything went smoothly.
  upsertedId?: number; // null or an id containing a document that had to be upserted.
  upsertedCount?: number; // Number indicating how many documents had to be upserted. Will either be 0 or 1.
};

export type ReturnPromise = {
  result: boolean;
  value: string | EmbedBuilder[];
};

export class Field {
  emote: string | null | undefined | boolean;
  role: string | number | null | undefined | boolean;
  inline: boolean;

  constructor(
    emote: string | null | undefined | boolean,
    role: string | number | null | undefined | boolean,
    inline: boolean
  ) {
    this.emote = emote;
    this.role = role;
    this.inline = inline;
  }
}

export type Rank = {
  level: number;
  role: string;
};

export type LanguagePortal = {
  gr: (args: User) => unknown;
  de: (args: User) => unknown;
  en: (args: User) => unknown;
};

export type LanguageConsole = {
  gr: (args: unknown) => unknown;
  de: (args: unknown) => unknown;
  en: (args: unknown) => unknown;
};

export type LocalisationPortalOption = {
  name: EventAction | AnnouncementAction;
  lang: LanguagePortal;
};

export type LocalisationConsoleOption = {
  name: LogActions;
  lang: any; // LanguageConsole;
};

export type CommandOptions = {
  name: string;
  description: string;
  scopeLimit: ScopeLimit;
  time: number;
  auth: boolean;
  premium: boolean;
  reply: boolean;
  ephemeral: boolean;
  delete: {
    source: boolean;
    reply: boolean;
  };
};

export type ActiveCooldown = {
  member: string;
  guild: string;
  command: string;
  timestamp: number;
};

export type ActiveCooldowns = {
  guild: ActiveCooldown[];
  member: ActiveCooldown[];
};

export type SpamCache = {
  memberId: string;
  lastMessage: string;
  timestamp: Date | null;
  spamFouls: number;
  duplicateFouls: number;
};

export type TimeElapsed = {
  timeoutMin: number;
  timeoutSec: number;
  remainingHrs: number;
  remainingMin: number;
  remainingSec: number;
};

export type TimeRemaining = {
  timeoutMin: number;
  timeoutSec: number;
  remainingMin: number;
  remainingSec: number;
};

export type Blueprint = {
  name: string;
  hover: string;
  auth: number;
  get: ({
    voiceChannel,
    pVoiceChannel,
    pChannels,
    pGuild,
    guild,
    pMember,
    string,
  }:{
    voiceChannel?: VoiceChannel,
    pVoiceChannel?: PVoiceChannel | null,
    pChannels?: PChannel[],
    pGuild?: PGuild,
    guild?: Guild,
    pMember?: PMember,
    string?: string | string[]
  }) => any;
  set: ({
    voiceChannel,
    pVoiceChannel,
    pChannel,
    pGuild,
    pMember,
    message,
  }:{
    voiceChannel?: VoiceChannel,
    pVoiceChannel?: PVoiceChannel | null,
    pChannel?: PChannel,
    pGuild?: PGuild,
    pMember?: PMember,
    message?: Message
  },
  value: string) => any;
};

export interface HelpDocumentation {
  getGuide: () =>  EmbedBuilder,
  getHelp: () =>  EmbedBuilder[],
  getHelpDetailed: (candidate: string) =>  EmbedBuilder | boolean,
}
