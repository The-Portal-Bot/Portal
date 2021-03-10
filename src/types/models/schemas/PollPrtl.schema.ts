import { Schema } from "mongoose";

const PollPrtlSch = new Schema(
	{
		message_id: { type: String, required: true },
		member_id: { type: String, required: true },
	},
	{
		collection: 'guild_list'
	}
);

// export default model('PollPrtlSch', PollPrtlSch);
export default PollPrtlSch;
