export class VoiceChannelPrtl {
	public id: string;
	public creator_id: string;
	public render: boolean;
	public regex: string;
	public no_bots: boolean;
	public locale: string;
	public ann_announce: boolean;
	public ann_user: boolean;

	constructor(
		id: string,
		creator_id: string,
		render: boolean,
		regex: string,
		no_bots: boolean,
		locale: string,
		ann_announce: boolean,
		ann_user: boolean
	) {
		this.id = id;
		this.creator_id = creator_id;
		this.render = render;
		this.regex = regex;
		this.no_bots = no_bots;
		this.locale = locale;
		this.ann_announce = ann_announce;
		this.ann_user = ann_user;
	}
};
