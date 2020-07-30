module.exports = class {
	constructor(creator_id, regex_portal, regex_voice, voice_list,
		no_bots, limit_portal, time_to_live, refresh_rate, locale,
		ann_announce, ann_user) {

		this.creator_id = creator_id;
		this.regex_portal = regex_portal;
		this.regex_voice = regex_voice;
		this.no_bots = no_bots;
		this.limit_portal = limit_portal;
		this.time_to_live = time_to_live;
		this.refresh_rate = refresh_rate;
		this.locale = locale;
		this.voice_list = voice_list;

		this.ann_announce = ann_announce;
		this.ann_user = ann_user;
	}
};
