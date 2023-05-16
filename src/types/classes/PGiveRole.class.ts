import { Document } from "mongoose";

export class GiveRole {
	public emote: string;
	public role: [string];

	constructor(
		emote: string,
		role: [string]
	) {
		this.emote = emote;
		this.role = role;
	}
}

export class PGiveRole {
	public message_id: string;
	public role_emote_map: GiveRole[];

	constructor(
		message_id: string,
		role_emote_map: GiveRole[]
	) {
		this.message_id = message_id;
		this.role_emote_map = role_emote_map;
	}
}

export interface IPGiveRole extends Document {
	message_id: string;
	role_emote_map: GiveRole[];
}
