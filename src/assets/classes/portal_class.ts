export class Portal {
	public creator_id: number;
	public regex_portal: string;
	public regex_voice: string;
	public voice_list: string[];
	public no_bots: boolean;
	public limit_portal: number;
	public time_to_live: number;
	public refresh_rate: number;
	public locale: string;
	public ann_announce: boolean;
	public ann_user: boolean;

	constructor(
		creator_id: number,
		regex_portal: string,
		regex_voice: string,
		voice_list: string[],
		no_bots: boolean,
		limit_portal: number,
		time_to_live: number,
		refresh_rate: number,
		locale: string,
		ann_announce: boolean,
		ann_user: boolean
	) {

		this.creator_id = creator_id;
		this.regex_portal = regex_portal;
		this.regex_voice = regex_voice;
		this.voice_list = voice_list;
		this.no_bots = no_bots;
		this.limit_portal = limit_portal;
		this.time_to_live = time_to_live;
		this.refresh_rate = refresh_rate;
		this.locale = locale;
		this.ann_announce = ann_announce;
		this.ann_user = ann_user;
	}
};
