import { Document } from "mongoose";

export class GiveRole {
	public role: string;
	public emote: string;

	constructor(
		role: string,
		emote: string
	) {
		this.role = role;
		this.emote = emote;
	}
}

export class GiveRolePrtl {
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

export interface IGiveRolePrtl extends Document {
	message_id: string;
	role_emote_map: GiveRole[];
}
