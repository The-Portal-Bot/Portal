import { Schema } from 'mongoose';

const PPollSchema = new Schema(
    {
        message_id: { type: String, required: true },
        member_id: { type: String, required: true },
    },
    {
        collection: 'guild_list',
    }
);

export default PPollSchema;
