const mongoose = require('mongoose');

const portalSchema = new mongoose.Schema({
	portal: {
		portal_id: String,
		creator_id: String,
		regex_portal: String,
		regex_voice: String,
		no_bots: Boolean,
		limit_portal: Number,
		time_to_live: Number,
		refresh_rate: Number,
		locale: String,
		voice_list: Array,

		ann_announce: Boolean,
		ann_user: Boolean,
	},
});

module.exports = mongoose.model('PortalModel', portalSchema);