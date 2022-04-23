import { Schema } from 'mongoose';

const PollPrtlSchm = new Schema(
	{
		message_id: { type: String, required: true },
		member_id: { type: String, required: true },
	},
	{
		collection: 'guild_list',
	},
);

// export default model('PollPrtlSchm', PollPrtlSchm);
export default PollPrtlSchm;
