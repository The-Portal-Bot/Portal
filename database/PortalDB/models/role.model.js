const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
	portal: {
		role_id: String,
		emote: String,
		role: String,
	},
});

module.exports = mongoose.model('RoleModel', roleSchema);