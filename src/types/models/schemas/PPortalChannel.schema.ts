import { Schema } from 'mongoose';
import PVoiceChannelSchema from './PVoiceChannel.schema';

const PPortalChannelSchema = new Schema(
  {
    id: { type: String, required: true },
    creatorId: { type: String, required: true },
    render: { type: Boolean, required: true },
    regexPortal: { type: String, required: true },
    regexVoice: { type: String, required: true },
    pVoiceChannels: { type: [PVoiceChannelSchema], required: true },
    noBots: { type: Boolean, required: true },
    allowedRoles: { type: [String] },
    locale: { type: Number, required: true },
    annAnnounce: { type: Boolean, required: true },
    annUser: { type: Boolean, required: true },
    userLimitPortal: { type: Number, required: true },
    regexOverwrite: { type: Boolean, required: true },
  },
  {
    collection: 'guild_list',
  }
);

export default PPortalChannelSchema;
