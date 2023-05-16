import { Schema } from 'mongoose';

const GiveRoleSchema = new Schema(
    {
        emote: { type: String, required: true },
        role: { type: [String], required: true },
    },
    {
        collection: 'guild_list',
    }
);

const PGiveRoleSchema = new Schema(
    {
        message_id: { type: String, required: true },
        role_emote_map: { type: [GiveRoleSchema], required: true },
    },
    {
        collection: 'guild_list',
    }
);

export default PGiveRoleSchema;
