
import { Schema } from "mongoose";
import VoiceChannelPrtlSch from './VoiceChannelPrtlSchm';

const PortalChannelPrtlSch = new Schema(
	{
		id: { type: String, required: true },
		creator_id: { type: String, required: true },
		render: { type: Boolean, required: true },
		regex_portal: { type: String, required: true },
		regex_voice: { type: String, required: true },
		voice_list: { type: [VoiceChannelPrtlSch], required: true },
		no_bots: { type: Boolean, required: true },
		// limit_portal: { type: Number, required: true },
		// time_to_live: { type: Number, required: true },
		// refresh_rate: { type: Number, required: true },
		locale: { type: String, required: true },
		ann_announce: { type: Boolean, required: true },
		ann_user: { type: Boolean, required: true },
		user_limit_portal: { type: Number, required: true },
		regex_overwrite: { type: Boolean, required: true }
	},
	{
		collection: 'guild_list'
	}
);

// export default model('PortalChannelPrtlSch', PortalChannelPrtlSch);
export default PortalChannelPrtlSch;
