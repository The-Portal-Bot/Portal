import { Schema } from "mongoose";

const MemberPrtlSch = new Schema(
	{
		id: { type: String, required: true },
		level: { type: Number, required: true },
		rank: { type: Number, required: true },
		tier: { type: Number, required: true },
		points: { type: Number, required: true },
		penalties: { type: Number, required: true },
		timestamp: { type: Date, required: true },
		regex: { type: String, required: true },
	},
	{
		collection: 'guild_list'
	}
);

// export default model('MemberPrtlSch', MemberPrtlSch);
export default MemberPrtlSch;
