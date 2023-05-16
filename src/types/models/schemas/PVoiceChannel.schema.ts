import { Schema } from 'mongoose';

const PVoiceChannelSchema = new Schema(
    {
        id: { type: String, required: true },
        creator_id: { type: String, required: true },
        render: { type: Boolean, required: true },
        regex: { type: String, required: true },
        no_bots: { type: Boolean, required: true },
        locale: { type: Number, required: true },
        ann_announce: { type: Boolean, required: true },
        ann_user: { type: Boolean, required: true },
    },
    {
        collection: 'guild_list',
    }
);

export default PVoiceChannelSchema;
