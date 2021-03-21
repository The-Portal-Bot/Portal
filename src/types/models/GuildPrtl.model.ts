import { Document, model, Schema } from 'mongoose';
import { IGuildPrtl } from '../classes/GuildPrtl.class';
import GiveRolePrtlSchm from './schemas/GiveRolePrtl.schema';
import MemberPrtlSchm from './schemas/MemberPrtl.schema';
import PollPrtlSchm from './schemas/PollPrtl.schema';
import PortalChannelPrtlSchm from './schemas/PortalChannelPrtl.schema';

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
			},
			required: true
		},
		ago: { type: String, required: true },
		views: { type: Number, required: true },
		author: {
			type: {
				name: { type: String, required: true },
				url: { type: String, required: true }
			},
			required: true
		},
		level: { type: Number, required: true },
		role: { type: String, required: true }
	},
	{
		collection: 'guild_list'
	}
);

const Rank = new Schema(
	{
		level: { type: Number, required: true },
		role: { type: String, required: true }
	},
	{
		collection: 'guild_list'
	}
);

const MusicData = new Schema(
	{
		message_id: { type: String, required: true },
		message_lyrics_id: { type: String, required: true },
		channel_id: { type: String, required: true },
		votes: { type: [String], required: true },
		pinned: { type: Boolean, required: true }
	},
	{
		collection: 'guild_list'
	}
);

const GuildPrtlSchm = new Schema(
	{
		id: { type: String, required: true },
		portal_list: { type: [PortalChannelPrtlSchm], required: true },
		member_list: { type: [MemberPrtlSchm], required: true },
		ignore_list: { type: [String], required: true },
		url_list: { type: [String], required: true },
		role_list: { type: [GiveRolePrtlSchm], required: true },
		poll_list: { type: [PollPrtlSchm], required: true },
		ranks: { type: [Rank], required: true },
		music_data: { type: MusicData, required: true },
		music_queue: { type: [VideoSearchResult], required: true },
		announcement: { type: String, required: true },
		locale: { type: Number, required: true },
		announce: { type: Boolean, required: true },
		rank_speed: { type: Number, required: true },
		profanity_level: { type: Number, required: true },
		premium: { type: Boolean, required: true },
		prefix: { type: String, required: true }
	},
	{
		collection: 'guild_list'
	}
);

export default model<IGuildPrtl>('GuildPrtlSchm', GuildPrtlSchm);
