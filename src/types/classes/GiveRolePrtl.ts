export class GiveRole {
	role_id: string;
	give: string;
	strip: string;

	constructor(
		role_id: string,
		give: string,
		strip: string
	) {
		this.role_id = role_id;
		this.give = give;
		this.strip = strip;
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
};
