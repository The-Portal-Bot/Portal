import { Schema } from "npm:mongoose";

const PVoiceChannelSchema = new Schema(
  {
    id: { type: String, required: true },
    creatorId: { type: String, required: true },
    render: { type: Boolean, required: true },
    regex: { type: String, required: true },
    noBots: { type: Boolean, required: true },
    locale: { type: Number, required: true },
    annAnnounce: { type: Boolean, required: true },
    annUser: { type: Boolean, required: true },
  },
  {
    collection: "guild_list",
  },
);

export default PVoiceChannelSchema;
