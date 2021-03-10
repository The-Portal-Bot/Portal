import { Schema } from "mongoose";

const VoiceChannelPrtlSch = new Schema(
	{
		id: { type: String, required: true },
		creator_id: { type: String, required: true },
		render: { type: Boolean, required: true },
		regex: { type: String, required: true },
		no_bots: { type: Boolean, required: true },
		time_to_live: { type: Number, required: true },
		refresh_rate: { type: Number, required: true },
		locale: { type: String, required: true },
		ann_announce: { type: Boolean, required: true },
		ann_user: { type: Boolean, required: true }
	},
	{
		collection: 'guild_list'
	}
);

// export default model('VoiceChannelPrtlSch', VoiceChannelPrtlSch);
export default VoiceChannelPrtlSch;
