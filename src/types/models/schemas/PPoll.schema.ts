import { Schema } from 'mongoose';

const PPollSchema = new Schema(
    {
        messageId: { type: String, required: true },
        memberId: { type: String, required: true },
    },
    {
        collection: 'guild_list',
    }
);

export default PPollSchema;
