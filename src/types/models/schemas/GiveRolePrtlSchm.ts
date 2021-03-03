import { Schema } from "mongoose";

const GiveRoleSch = new Schema(
	{
		role_id: { type: String, required: true },
		give: { type: String, required: true },
		strip: { type: String, required: true },
	},
	{
		collection: 'guild_list'
	}
);

const GiveRolePrtlSch = new Schema(
	{
		message_id: { type: String, required: true },
		role_emote_map: { type: [GiveRoleSch], required: true },
	},
	{
		collection: 'guild_list'
	}
);

// export default model('GiveRolePrtlSch', GiveRolePrtlSch);
export default GiveRolePrtlSch;
