export class VoiceChannelPrtl {
	public id: string;
	public creator_id: string;
	public regex: string;
	public no_bots: boolean;
	public time_to_live: number;
	public refresh_rate: number;
	public locale: string;
	public ann_announce: boolean;
	public ann_user: boolean;

	constructor(
		id: string,
		creator_id: string,
		regex: string,
		no_bots: boolean,
		time_to_live: number,
		refresh_rate: number,
		locale: string,
		ann_announce: boolean,
		ann_user: boolean
	) {
		this.id = id;
		this.creator_id = creator_id;
		this.regex = regex;
		this.no_bots = no_bots;
		this.time_to_live = time_to_live;
		this.refresh_rate = refresh_rate;
		this.locale = locale;
		this.ann_announce = ann_announce;
		this.ann_user = ann_user;
	}
};
