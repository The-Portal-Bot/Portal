module.exports = class {
	constructor(portal_list, member_list, url_list, role_list, ranks, auth_role, spotify,
		music_data, music_queue, dispatcher, announcement, locale, announce, level_speed, premium) {
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