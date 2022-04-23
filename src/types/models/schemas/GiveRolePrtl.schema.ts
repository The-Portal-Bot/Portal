import { Schema } from 'mongoose';

const GiveRoleSchm = new Schema(
	{
		emote: { type: String, required: true },
		role: { type: [String], required: true },
	},
	{
		collection: 'guild_list',
	},
);

const GiveRolePrtlSchm = new Schema(
	{
		message_id: { type: String, required: true },
		role_emote_map: { type: [GiveRoleSchm], required: true },
	},
	{
		collection: 'guild_list',
	},
);

// export default model('GiveRolePrtlSchm', GiveRolePrtlSchm);
export default GiveRolePrtlSchm;
