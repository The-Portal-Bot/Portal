module.exports = class {
	constructor(portal_list, url_list, role_list, auth_role, spotify,
		announcement, locale, announce, premium) {
		this.portal_list = portal_list;
		this.url_list = url_list;
		this.role_list = role_list;
		this.auth_role = auth_role;
		this.spotify = spotify;
		this.announcement = announcement;
		this.locale = locale;
		this.announce = announce;
		this.premium = premium;
	}
};