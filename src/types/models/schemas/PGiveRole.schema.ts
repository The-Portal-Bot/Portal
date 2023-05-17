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
        messageId: { type: String, required: true },
        roleEmoteMap: { type: [GiveRoleSchema], required: true },
    },
    {
        collection: 'guild_list',
    }
);

export default PGiveRoleSchema;
