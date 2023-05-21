import { model, Schema } from 'mongoose';
import { IPGuild } from '../classes/PGuild.class';
import PGiveRoleSchema from './schemas/PGiveRole.schema';
import PMemberSchema from './schemas/PMember.schema';
import PPollSchema from './schemas/PPoll.schema';
import PPortalChannelSchema from './schemas/PPortalChannel.schema';

const VideoSearchResult = new Schema(
  {
    type: { type: String, required: true },
    videoId: { type: String, required: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    thumbnail: { type: String, required: true },
    seconds: { type: Number, required: true },
    timestamp: { type: String, required: true },
    duration: {
      type: {
        seconds: { type: String, required: true },
        timestamp: { type: Number, required: true },
      },
      required: true,
    },
    ago: { type: String, required: true },
    views: { type: Number, required: true },
    author: {
      type: {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
      required: true,
    },
    level: { type: Number, required: true },
    role: { type: String, required: true },
  },
  {
    collection: 'guild_list',
  }
);

const Rank = new Schema(
  {
    level: { type: Number, required: true },
    role: { type: String, required: true },
  },
  {
    collection: 'guild_list',
  }
);

const MusicData = new Schema(
  {
    messageId: { type: String, required: true },
    messageLyricsId: { type: String, required: true },
    channelId: { type: String, required: true },
    votes: { type: [String], required: true },
    pinned: { type: Boolean, required: true },
  },
  {
    collection: 'guild_list',
  }
);

const PGuildSchema = new Schema(
  {
    id: { type: String, required: true },
    pPortalChannels: { type: [PPortalChannelSchema], required: true },
    pMembers: { type: [PMemberSchema], required: true },
    ignoreList: { type: [String], required: true },
    urlList: { type: [String], required: true },
    roleList: { type: [PGiveRoleSchema], required: true },
    pollList: { type: [PPollSchema], required: true },
    initialRole: { type: String, required: true },
    ranks: { type: [Rank], required: true },
    musicData: { type: MusicData, required: true },
    musicQueue: { type: [VideoSearchResult], required: true },
    announcement: { type: String, required: true },
    locale: { type: Number, required: true },
    announce: { type: Boolean, required: true },
    muteRole: { type: String, required: true },
    rankSpeed: { type: Number, required: true },
    profanityLevel: { type: Number, required: true },
    kickAfter: { type: Number, required: true },
    banAfter: { type: Number, required: true },
    premium: { type: Boolean, required: true },
    prefix: { type: String, required: true },
  },
  {
    collection: 'guild_list',
  }
);

export default model < IPGuild > ('PGuildSchema', PGuildSchema);
