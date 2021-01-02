import { VoiceConnection } from "discord.js";

export interface ReturnPormise {
	result: boolean;
	value: string;
};

export interface ReturnPormiseVoice {
	result: boolean;
	value: string;
	voice_connection: VoiceConnection | undefined;
};

export interface field {
	emote: string | null | undefined | boolean,
	role: string | null | undefined | boolean,
	inline: boolean
}

export interface Language {
	gr: any;
	en: any;
	de: any;
}

export interface LocalizationOption {
	name: string;
	lang: Language;
}

export interface Cooldown {
	name: string;
	time: number;
	auth: boolean;
	premium: boolean;
	auto_delete: boolean;
}

export interface ActiveCooldown {
	member: string;
	command: string;
	timestamp: number;
}

export interface ActiveCooldowns {
	guild: ActiveCooldown[];
	member: ActiveCooldown[];
}
