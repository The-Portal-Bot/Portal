module.exports = class {
	constructor(portal_list, member_list, url_list, role_list, ranks, auth_role, spotify,
		announcement, locale, announce, level_speed, dispatcher, premium) {
		this.portal_list = portal_list;
		this.member_list = member_list;
		this.url_list = url_list;
		this.role_list = role_list;
		this.ranks = ranks;
		this.auth_role = auth_role;
		this.spotify = spotify;
		this.announcement = announcement;
		this.locale = locale;
		this.announce = announce;
		this.level_speed = level_speed;
		this.dispatcher = dispatcher ;
		this.premium = premium;
	}
};