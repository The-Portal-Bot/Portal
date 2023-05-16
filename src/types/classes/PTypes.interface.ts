export interface MongoPromise {
	matchedCount?: number; // Number of documents matched
	modifiedCount?: number; // Number of documents modified
	acknowledged?: number; // Boolean indicating everything went smoothly.
	upsertedId?: number; // null or an id containing a document that had to be upserted.
	upsertedCount?: number; // Number indicating how many documents had to be upserted. Will either be 0 or 1.
}

export interface ReturnPromise {
	result: boolean;
	value: string;
}

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

export interface Rank {
	level: number,
	role: string
}

export interface Language {
	gr: any;
	en: any;
	de: any;
}

export interface LocalisationOption {
	name: string;
	lang: Language;
}

export interface CommandOptions {
	name: string;
	range: string;
	time: number;
	auth: boolean;
	premium: boolean;
	reply: boolean;
	delete: {
		source: boolean,
		reply: boolean
	}
}

export interface ActiveCooldown {
	member: string;
	guild: string;
	command: string;
	timestamp: number;
}

export interface ActiveCooldowns {
	guild: ActiveCooldown[];
	member: ActiveCooldown[];
}

export interface SpamCache {
	member_id: string;
	last_message: string;
	timestamp: Date | null;
	spam_fouls: number;
	duplicate_fouls: number;
}

export interface TimeElapsed {
	timeout_min: number;
	timeout_sec: number;
	remaining_hrs: number;
	remaining_min: number;
	remaining_sec: number;
}

export interface TimeRemaining {
	timeout_min: number;
	timeout_sec: number;
	remaining_min: number;
	remaining_sec: number;
}

export interface InterfaceBlueprint {
	name: string;
	hover: string;
	get: any;
	set: any;
	auth: number;
}
