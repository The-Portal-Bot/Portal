import {
  ChannelType,
  type Client,
  type Guild,
  type TextChannel,
  type VoiceChannel,
} from "npm:discord.js";
import type { FilterQuery } from "npm:mongoose";
import type { VideoSearchResult } from "yt-search";

import type { PGiveRole } from "../types/classes/PGiveRole.class.ts";
import { MusicData, type PGuild } from "../types/classes/PGuild.class.ts";
import { PMember } from "../types/classes/PMember.class.ts";
import type { PPoll } from "../types/classes/PPoll.class.ts";
import type {
  IPChannel,
  PChannel,
} from "../types/classes/PPortalChannel.class.ts";
import type { Rank } from "../types/classes/PTypes.interface.ts";
import type { PVoiceChannel } from "../types/classes/PVoiceChannel.class.ts";
import { PortalChannelType } from "../types/enums/PortalChannel.enum.ts";
import { ProfanityLevel } from "../types/enums/ProfanityLevel.enum.ts";
import { RankSpeed } from "../types/enums/RankSpeed.enum.ts";
import PGuildModel from "../types/models/PGuild.model.ts";

export async function fetchGuildList(
  filter: FilterQuery<PGuild>,
): Promise<PGuild[]> {
  return (await PGuildModel.find(filter).exec()) as unknown as PGuild[];
}

export async function fetchGuild(
  guildId: PGuild["id"],
): Promise<PGuild | undefined> {
  return (await PGuildModel.findOne({ id: guildId })
    .exec()) as unknown as PGuild;
}

export async function fetchGuildChannelDelete(
  guildId: PGuild["id"],
): Promise<PGuild | undefined> {
  return (await PGuildModel.findOne(
    {
      id: guildId,
    },
    {
      id: 1,
      pChannels: 1,
      announcement: 1,
      musicData: 1,
      pURLs: 1,
      pIgnores: 1,
    },
  ).exec()) as unknown as PGuild;
}

export async function fetchAnnouncementChannelByGuildId(
  guildId: PGuild["id"],
): Promise<Pick<PGuild, "announcement" | "initialRole"> | undefined> {
  const pGuild = (await PGuildModel.findOne(
    {
      id: guildId,
    },
    {
      announcement: 1,
      initialRole: 1,
    },
  ).exec()) as unknown as PGuild;

  return {
    announcement: pGuild.announcement,
    initialRole: pGuild.initialRole,
  };
}

export async function fetchGuildReactionData(
  guildId: PGuild["id"],
  memberId: string,
): Promise<PGuild | undefined> {
  return (await PGuildModel.findOne(
    {
      id: guildId,
    },
    {
      id: 1,
      pMembers: {
        $elemMatch: {
          id: memberId,
        },
      },
      pRoles: 1,
      pPolls: 1,
      musicData: 1,
      musicQueue: 1,
    },
  ).exec()) as unknown as PGuild;
}

export async function fetchGuildMembers(
  guildId: PGuild["id"],
): Promise<PMember[]> {
  const pGuild = (await PGuildModel.findOne(
    {
      id: guildId,
    },
    {
      pMembers: 1,
    },
  ).exec()) as unknown as PGuild | undefined;

  return pGuild?.pMembers ?? [];
}

export async function fetchGuildMusicQueue(
  guildId: PGuild["id"],
): Promise<{ queue: VideoSearchResult[]; data: MusicData } | undefined> {
  const pGuild = (await PGuildModel.findOne(
    {
      id: guildId,
    },
    {
      musicData: 1,
      musicQueue: 1,
    },
  ).exec()) as unknown as PGuild;

  return {
    data: pGuild.musicData,
    queue: pGuild.musicQueue,
  };
}

export async function fetchGuildPreData(
  guildId: PGuild["id"],
  memberId: string,
): Promise<PGuild | undefined> {
  return (await PGuildModel.findOne(
    {
      id: guildId,
    },
    {
      id: 1,
      prefix: 1,
      pChannels: 1,
      pMembers: {
        $elemMatch: {
          id: memberId,
        },
      },
      pIgnores: 1,
      pURLs: 1,
      muteRole: 1,
      musicData: 1,
      musicQueue: 1,
      initialRole: 1,
      rankSpeed: 1,
      profanityLevel: 1,
      kickAfter: 1,
      banAfter: 1,
    },
  ).exec()) as unknown as PGuild;
}

export async function fetchGuildRest(
  guildId: PGuild["id"],
): Promise<PGuild | undefined> {
  return (await PGuildModel.findOne(
    {
      id: guildId,
    },
    {
      id: 0,
      prefix: 0,
      pChannels: 0,
      pIgnores: 0,
      pURLs: 0,
      musicData: 0,
      rankSpeed: 0,
      profanityLevel: 0,
    },
  ).exec()) as unknown as PGuild;
}

export async function guildExists(guildId: PGuild["id"]): Promise<boolean> {
  return (await PGuildModel.countDocuments({ id: guildId }).exec()) > 0;
}

export async function memberExists(
  guildId: PGuild["id"],
  memberId: string,
): Promise<boolean> {
  return (
    (await PGuildModel.countDocuments({
      id: guildId,
      pMembers: {
        $elemMatch: {
          id: memberId,
        },
      },
    })) > 0
  );
}

export async function updateGuild(
  guildId: PGuild["id"],
  key: keyof PGuild,
  value: unknown,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $set: {
        [key]: value,
      },
    },
    {
      new: true,
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

// CRUD guilds
async function createMembers(
  guildId: PGuild["id"],
  client: Client,
): Promise<PMember[]> {
  const guild = client.guilds.cache.find((guild) =>
    guild.id === guildId
  ) as Guild;

  if (!guild) {
    return [];
  }

  const members = await guild.members.fetch();

  if (!members) {
    return [];
  }

  return members
    .map((member) => member)
    .filter((member) => !member.user.bot)
    .filter((member) => member.id !== client?.user?.id)
    .map((member) =>
      new PMember(
        member.id,
        1,
        0,
        1,
        0,
        0,
        new Date("1 January, 1970, 00:00:00 UTC"),
        "null",
      )
    );
}

export async function insertGuild(
  guildId: PGuild["id"],
  client: Client,
): Promise<boolean> {
  const id: string = guildId;
  const pChannels: PChannel[] = [];
  const pMembers: PMember[] = await createMembers(guildId, client);
  const pURLs: string[] = [];
  const pRoles: PGiveRole[] = [];
  const pPolls: string[] = [];
  const ranks: Rank[] = [];
  const initialRole: string | null = "null";
  const musicData: MusicData = {
    channelId: "null",
    messageId: "null",
    messageLyricsId: "null",
    votes: [],
    pinned: false,
  };
  const musicQueue: VideoSearchResult[] = [];
  const announcement: string | null = "null";
  const muteRole: string | null = "null";
  const locale = 1;
  const announce = true;
  const rankSpeed: number = RankSpeed.default;
  const profanityLevel: number = ProfanityLevel.default;
  const kickAfter = 0;
  const banAfter = 0;
  const premium = true; // as it is not a paid service anymore

  return !!(await PGuildModel.create({
    id,
    pChannels,
    pMembers,
    pURLs,
    pRoles,
    pPolls,
    initialRole,
    ranks,
    musicData,
    musicQueue,
    announcement,
    muteRole,
    locale,
    announce,
    rankSpeed,
    profanityLevel,
    kickAfter,
    banAfter,
    premium,
  }));
}

export async function removeGuild(guildId: PGuild["id"]): Promise<boolean> {
  return !!(await PGuildModel.deleteOne({ id: guildId }));
}

export async function updateMember(
  guildId: PGuild["id"],
  memberId: string,
  key: string,
  value: unknown,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $set: {
        ["pMembers.$[m]." + key]: value,
      },
    },
    {
      new: true,
      arrayFilters: [
        {
          "m.id": memberId,
        },
      ],
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function updateEntireMember(
  guildId: PGuild["id"],
  memberId: string,
  member: PMember,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $set: {
        ["pMembers.$[m]"]: member,
      },
    },
    {
      new: true,
      arrayFilters: [
        {
          "m.id": memberId,
        },
      ],
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertMember(
  guildId: PGuild["id"],
  memberId: string,
): Promise<boolean> {
  const newPMember = new PMember(memberId, 1, 0, 1, 0, 0, null, "null");

  const updateWriteOpResult = await PGuildModel.updateOne(
    { id: guildId },
    {
      $push: {
        pMembers: newPMember,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function removeMember(
  memberId: string,
  guildId: PGuild["id"],
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $pull: {
        pMembers: {
          id: memberId,
        },
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function updatePortal(
  guildId: PGuild["id"],
  portalId: string,
  key: string,
  value: unknown,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $set: {
        ["pChannels.$[p]." + key]: value,
      },
    },
    {
      new: true,
      arrayFilters: [{ "p.id": portalId }],
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertPortal(
  guildId: PGuild["id"],
  newPortal: IPChannel,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        pChannels: newPortal,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function removePortal(
  guildId: PGuild["id"],
  portalId: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $pull: {
        pChannels: {
          id: portalId,
        },
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function updateVoice(
  guildId: PGuild["id"],
  portalId: string,
  voiceId: string,
  key: string,
  value: unknown,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $set: {
        ["pChannels.$[p].pVoiceChannels.$[v]." + key]: value,
      },
    },
    {
      new: true,
      arrayFilters: [{ "p.id": portalId }, { "v.id": voiceId }],
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertVoice(
  guildId: PGuild["id"],
  portalId: string,
  newVoice: PVoiceChannel,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        "pChannels.$[p].pVoiceChannels": newVoice,
      },
    },
    {
      new: true,
      arrayFilters: [{ "p.id": portalId }],
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function removeVoice(
  guildId: PGuild["id"],
  portalId: string,
  voiceId: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $pull: {
        "pChannels.$[p].pVoiceChannels": {
          id: voiceId,
        },
      },
    },
    {
      new: true,
      arrayFilters: [
        {
          "p.id": portalId,
        },
      ],
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertURL(
  guildId: PGuild["id"],
  newUrl: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        pURLs: newUrl,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function removeURL(
  guildId: PGuild["id"],
  removeUrl: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $pull: {
        pURLs: removeUrl,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertIgnore(
  guildId: PGuild["id"],
  newIgnore: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        pIgnores: newIgnore,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function removeIgnore(
  guildId: PGuild["id"],
  removeIgnore: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $pull: {
        pIgnores: removeIgnore,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function setRanks(
  guildId: PGuild["id"],
  newRanks: Rank[],
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      ranks: newRanks,
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertPoll(
  guildId: PGuild["id"],
  poll: PPoll,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        pPolls: poll,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function removePoll(
  guildId: PGuild["id"],
  messageId: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $pull: {
        pPolls: {
          messageId: messageId,
        },
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertVendor(
  guildId: PGuild["id"],
  newVendor: PGiveRole,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        pRoles: newVendor,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function removeVendor(
  guildId: PGuild["id"],
  messageId: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $pull: {
        pRoles: {
          messageId: messageId,
        },
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertMusicVideo(
  guildId: PGuild["id"],
  video: VideoSearchResult,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        musicQueue: video,
      },
    },
  );

  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function clearMusicVote(guildId: PGuild["id"]): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $set: {
        "musicData.votes": [],
      },
    },
  );
  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function insertMusicVote(
  guildId: PGuild["id"],
  userId: string,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $push: {
        "musicData.votes": userId,
      },
    },
  );
  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function setMusicData(
  guildId: PGuild["id"],
  newMusicData: MusicData,
): Promise<boolean> {
  const updateWriteOpResult = await PGuildModel.updateOne(
    {
      id: guildId,
    },
    {
      $set: {
        musicData: newMusicData,
      },
    },
  );
  return updateWriteOpResult && updateWriteOpResult.modifiedCount === 1;
}

export async function handleChannelDeletion(
  channelToRemove: VoiceChannel | TextChannel,
): Promise<PortalChannelType> {
  const pGuild = await fetchGuildChannelDelete(channelToRemove.guild.id);

  if (!pGuild) {
    return PortalChannelType.unknown;
  }

  // check if it is a portal or portal-voice channel
  if (channelToRemove.type === ChannelType.GuildVoice) {
    const voiceChannelToRemove = channelToRemove;

    for (const pChannel of pGuild.pChannels) {
      if (pChannel.id === voiceChannelToRemove.id) {
        return (await removePortal(voiceChannelToRemove.guild.id, pChannel.id))
          ? PortalChannelType.portal
          : PortalChannelType.unknown;
      }

      for (const pVoiceChannel of pChannel.pVoiceChannels) {
        if (pVoiceChannel.id === voiceChannelToRemove.id) {
          return (await removeVoice(
              voiceChannelToRemove.guild.id,
              pChannel.id,
              pVoiceChannel.id,
            ))
            ? PortalChannelType.voice
            : PortalChannelType.unknown;
        }
      }
    }
  } else if (
    [
      ChannelType.GuildText,
      ChannelType.GuildText,
      ChannelType.GuildAnnouncement,
    ].includes(channelToRemove.type)
  ) {
    const textChannelToRemove = channelToRemove;

    if (pGuild.announcement === textChannelToRemove.id) {
      return (await updateGuild(
          textChannelToRemove.guild.id,
          "announcement",
          "null",
        ))
        ? PortalChannelType.announcement
        : PortalChannelType.unknown;
    } else if (pGuild.musicData.channelId === textChannelToRemove.id) {
      const musicData = new MusicData("null", "null", "null", [], false);
      return (await setMusicData(pGuild.id, musicData))
        ? PortalChannelType.music
        : PortalChannelType.unknown;
    } else {
      for (let i = 0; i < pGuild.pURLs.length; i++) {
        if (pGuild.pURLs[i] === textChannelToRemove.id) {
          return (await removeURL(
              textChannelToRemove.guild.id,
              textChannelToRemove.id,
            ))
            ? PortalChannelType.url
            : PortalChannelType.unknown;
        }
      }

      for (let i = 0; i < pGuild.pIgnores.length; i++) {
        if (pGuild.pIgnores[i] === textChannelToRemove.id) {
          return (await removeIgnore(
              textChannelToRemove.guild.id,
              textChannelToRemove.id,
            ))
            ? PortalChannelType.url
            : PortalChannelType.unknown;
        }
      }
    }
  }

  return PortalChannelType.unknown;
}
