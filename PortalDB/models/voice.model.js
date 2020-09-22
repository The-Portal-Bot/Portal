module.exports = class {
	constructor(creator_id, regex, no_bots, time_to_live,
		refresh_rate, locale, ann_announce, ann_user) {

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

const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema({
	voice: {
		voice_id: String,
		creator_id: String,
		regex: String,
		no_bots: Boolean,
		time_to_live: Number,
		refresh_rate: Number,
		locale: String,

		ann_announce: Boolean,
		ann_user: Boolean,
	},
});

module.exports = mongoose.model('VoiceModel', voiceSchema);