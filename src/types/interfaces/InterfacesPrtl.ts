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

export interface Field {
	emote: string | null | undefined | boolean,
	role: string | number | null | undefined | boolean,
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

export class InterfaceBlueprint {
	public name: string = '';
	public description: string = '';
	public super_description: string = '';
	public example: string = '';
	public args: string = '';
	public get!: any;
	public set!: any;
	public auth!: string;

	constructor(
		name: string,
		description: string,
		super_description: string,
		example: string,
		args: string,
		auth: string,
		get: any,
		set: any
	) {
		this.name = name;
		this.description = description;
		this.super_description = super_description;
		this.example = example;
		this.args = args;
		this.auth = auth;
		this.get = get;
		this.set = set;
	}
}
