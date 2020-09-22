const mongoose = require('mongoose');

const music_dataSchema = new mongoose.Schema({
	music_data: {
		music_data_id: String,
		channel_id: String,
		message_id: String,
		votes: Array,
	},
});

module.exports = mongoose.model('MusicModel', music_dataSchema);