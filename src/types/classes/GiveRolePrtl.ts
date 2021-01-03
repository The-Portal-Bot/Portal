export interface GiveRole {
	role_id: string,
	give: string,
	strip: string
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
