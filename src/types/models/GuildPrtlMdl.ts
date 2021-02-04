import { model, Schema, Document } from "mongoose";
import GiveRolePrtlSchm from "./schemas/GiveRolePrtlSchm";
import MemberPrtlSchm from "./schemas/MemberPrtlSchm";
import PortalChannelPrtlSchm from "./schemas/PortalChannelPrtlSchm";

const VideoSearchResult = new Schema(
	{
		type: { type: String, required: true },
		videoId: { type: String, required: true },
		url: { type: String, required: true },
		title: { type: String, required: true },
		description: { type: String, required: true },
		image: { type: String, required: true },
		thumbnail: { type: String, required: true },
		seconds: { type: Number, required: true },
		timestamp: { type: String, required: true },
		duration: {
			type: {
				seconds: { type: String, required: true },
				timestamp: { type: Number, required: true }
			}, required: true
		},
		ago: { type: String, required: true },
		views: { type: Number, required: true },
		author: {
			type: {
				name: { type: String, required: true },
				url: { type: String, required: true }
			}, required: true
		},
		level: { type: Number, required: true },
		role: { type: String, required: true }
	},
	{ collection: 'guild_list' }
);

const Rank = new Schema(
	{
		level: { type: Number, required: true },
		role: { type: String, required: true }
	},
	{ collection: 'guild_list' }
);

const MusicData = new Schema(
	{
		message_id: { type: String, required: true },
		channel_id: { type: String, required: true },
		votes: { type: [String], required: true }
	},
	{ collection: 'guild_list' }
);

const GuildPrtlSch = new Schema(
	{
		id: { type: String, required: true },
		portal_list: { type: [PortalChannelPrtlSchm], required: true },
		member_list: { type: [MemberPrtlSchm], required: true },
		url_list: { type: [String], required: true },
		role_list: { type: [GiveRolePrtlSchm], required: true },
		ranks: { type: [Rank], required: true },
		auth_role: { type: [String], required: true },
		spotify: { type: String, required: true },
		music_data: { type: MusicData, required: true },
		music_queue: { type: [VideoSearchResult], required: true },
		dispatcher: { type: Object, required: false },
		announcement: { type: String, required: true },
		locale: { type: String, required: true },
		announce: { type: Boolean, required: true },
		level_speed: { type: String, required: true },
		premium: { type: Boolean, required: true }
	},
	{ collection: 'guild_list' }
);

export default model('GuildPrtlSch', GuildPrtlSch);
