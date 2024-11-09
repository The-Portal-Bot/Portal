import type {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  Presence,
  Role,
  User,
  VoiceChannel,
} from "npm:discord.js";

import type { PGuild } from "./PGuild.class.ts";
import type { PMember } from "./PMember.class.ts";
import type { PChannel } from "./PPortalChannel.class.ts";
import type { PVoiceChannel } from "./PVoiceChannel.class.ts";

export type NoAuthCommands =
  | "about"
  | "announce"
  | "bet"
  | "corona"
  | "crypto"
  | "focus"
  | "help"
  | "join"
  | "leaderboard"
  | "leave"
  | "level"
  | "ping"
  | "poll"
  | "ranks"
  | "roll"
  | "run"
  | "state"
  | "spam_rules"
  | "weather"
  | "whoami";

export type AuthCommands =
  | "announcement"
  | "ban"
  | "delete_messages"
  | "force"
  | "ignore"
  | "invite"
  | "kick"
  | "music"
  | "portal"
  | "vendor"
  | "set_ranks"
  | "set"
  | "url";

export enum ScopeLimit {
  NONE = "none",
  MEMBER = "member",
  GUILD = "guild",
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
    inline: boolean,
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

export type ClientArguments = {
  memberLength: number;
  channelLength: number;
  guildLength: number;
};

export type StatusArguments = {
  displayName: string;
  name: string;
};

export type DataArguments = {
  data: string;
  source: string;
};

export type PresenceArguments = {
  newPresence: Presence;
};

export type LanguageConsoleArguments =
  & ClientArguments
  & StatusArguments
  & DataArguments
  & PresenceArguments;

export type LanguageConsole = {
  gr: (args: LanguageConsoleArguments) => string;
  de: (args: LanguageConsoleArguments) => string;
  en: (args: LanguageConsoleArguments) => string;
};

export type LocalisationPortalOption = {
  name: EventAction | AnnouncementAction;
  lang: LanguagePortal;
};

export type LocalisationConsoleOption = {
  name: LogActions;
  lang: LanguageConsole;
};

export type CommandOptions = {
  name: string;
  description: string;
  auth: boolean;
  scopeLimit: ScopeLimit;
  time: number;
  premium: boolean;
  ephemeral: boolean;
};

export type ActiveCooldown = {
  member: string;
  guild: string;
  command: string;
  timestamp: number;
};

export type ActiveCooldowns = {
  [ScopeLimit.MEMBER]: ActiveCooldown[];
  [ScopeLimit.GUILD]: ActiveCooldown[];
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
  }: {
    voiceChannel?: VoiceChannel;
    pVoiceChannel?: PVoiceChannel | null;
    pChannels?: PChannel[];
    pGuild?: PGuild;
    guild?: Guild;
    pMember?: PMember;
    string?: string | string[];
  }) => boolean | string | string[] | number | undefined;
  set: (
    {
      voiceChannel,
      pVoiceChannel,
      pChannel,
      pGuild,
      pMember,
      interaction,
    }: {
      voiceChannel?: VoiceChannel;
      pVoiceChannel?: PVoiceChannel | null;
      pChannel?: PChannel;
      pGuild?: PGuild;
      pMember?: PMember;
      interaction?: ChatInputCommandInteraction;
    },
    value: string | Role,
  ) =>
    | Promise<ReturnPromise>
    | boolean
    | string
    | string[]
    | number
    | undefined;
};

export interface HelpDocumentation {
  getGuide: () => EmbedBuilder;
  getHelp: () => EmbedBuilder[];
  getHelpDetailed: (candidate: string) => EmbedBuilder | boolean;
}
