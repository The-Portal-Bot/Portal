import { User } from 'discord.js';

export enum announcementAction {
    fail,
    announce,
    spotify,
    url,
    readOnly,
    join,
    leave,
}

export enum eventAction {
    userConnected,
    userDisconnected,
}

export enum logActions {
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
    value: string;
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
    name: eventAction | announcementAction;
    lang: LanguagePortal;
};

export type LocalisationConsoleOption = {
    name: logActions;
    lang: any; // LanguageConsole;
};

export type CommandOptions = {
    name: string;
    range: string;
    time: number;
    auth: boolean;
    premium: boolean;
    reply: boolean;
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

export type InterfaceBlueprint = {
    name: string;
    hover: string;
    get: any;
    set: any;
    auth: number;
};
