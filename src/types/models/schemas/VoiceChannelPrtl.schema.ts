import { Schema } from "mongoose";

const VoiceChannelPrtlSchm = new Schema(
	{
		id: { type: String, required: true },
		creator_id: { type: String, required: true },
		render: { type: Boolean, required: true },
		regex: { type: String, required: true },
		no_bots: { type: Boolean, required: true },
		allowed_roles: { type: String },
		locale: { type: Number, required: true },
		ann_announce: { type: Boolean, required: true },
		ann_user: { type: Boolean, required: true }
	},
	{
		collection: 'guild_list'
	}
);

// export default model('VoiceChannelPrtlSchm', VoiceChannelPrtlSchm);
export default VoiceChannelPrtlSchm;
