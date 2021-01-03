export interface GiveRole {
	give: string,
	strip: string,
	role: string
}

export class GiveRolePrtl {
	public id: string;
	public role_emote_map: GiveRole[];

	constructor(
		id: string,
		role_emote_map: GiveRole[]
	) {
		this.id = id;
		this.role_emote_map = role_emote_map;
	}
};
