import { VoiceChannelPrtl } from "./VoiceChannelPrtl.class";

export class PortalChannelPrtl {
	public id: string;
	public creator_id: string;
	public render: boolean;
	public regex_portal: string;
	public regex_voice: string;
	public voice_list: VoiceChannelPrtl[];
	public no_bots: boolean;
	public locale: string;
	public ann_announce: boolean;
	public ann_user: boolean;
	public user_limit_portal: number;
	public regex_overwrite: boolean;

	constructor(
		id: string,
		creator_id: string,
		render: boolean,
		regex_portal: string,
		regex_voice: string,
		voice_list: VoiceChannelPrtl[],
		no_bots: boolean,
		locale: string,
		ann_announce: boolean,
		ann_user: boolean,
		user_limit_portal: number,
		regex_overwrite: boolean
	) {
		this.id = id;
		this.creator_id = creator_id;
		this.render = render;
		this.regex_portal = regex_portal;
		this.regex_voice = regex_voice;
		this.voice_list = voice_list;
		this.no_bots = no_bots;
		this.locale = locale;
		this.ann_announce = ann_announce;
		this.ann_user = ann_user;
		this.user_limit_portal = user_limit_portal;
		this.regex_overwrite = regex_overwrite;
	}
};
