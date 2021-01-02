export class GuildPortal {
	public portal_list: {};
	public member_list: {};
	public url_list: string[];
	public role_list: string[];
	public ranks: string[];
	public auth_role: string[];
	public spotify: string;
	public music_data: {
		channel_id: number | null,
		message_id: number | null,
		votes: string[]
	};
	public music_queue: string[];
	public dispatcher: any;
	public announcement: string;
	public locale: string;
	public announce: number;
	public level_speed: string;
	public premium: boolean;

	constructor(
		portal_list: {},
		member_list: {},
		url_list: string[],
		role_list: string[],
		ranks: string[],
		auth_role: string[],
		spotify: string,
		music_data: {
			channel_id: number | null,
			message_id: number | null,
			votes: string[]
		},
		music_queue: string[],
		dispatcher: any,
		announcement: string | null,
		locale: string,
		announce: number,
		level_speed: string,
		premium: boolean
	) {
		this.portal_list = portal_list;
		this.member_list = member_list;
		this.url_list = url_list;
		this.role_list = role_list;
		this.ranks = ranks;
		this.auth_role = auth_role;
		this.spotify = spotify;
		this.music_data = music_data;
		this.music_queue = music_queue;
		this.dispatcher = dispatcher;
		this.announcement = announcement;
		this.locale = locale;
		this.announce = announce;
		this.level_speed = level_speed;
		this.premium = premium;
	}
};