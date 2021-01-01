const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
	guild: {
		guild_id: String,
		portal_list: Array,
		member_list: Array,
		url_list: Array,
		role_list: Array,
		ranks: Array,
		auth_role: Array,
		announcement: String,
		spotify: String,
		music_data: Array,
		music_queue: Array,
		dispatcher: Array,
		locale: Number,
		announce: Array,
		level_speed: Number,
		premium: Boolean,
	},
});

module.exports = mongoose.model('Guild', guildSchema);