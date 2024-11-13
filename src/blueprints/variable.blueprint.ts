import dayjs from "npm:dayjs";
import calendar from "dayjs/plugin/calendar.js";

import { getStatusList } from "../libraries/status.library.ts";
import type { Blueprint } from "../types/classes/PTypes.interface.ts";
import { AuthType } from "../types/enums/Admin.enum.ts";

export const VariableBlueprints: Blueprint[] = [
  {
    name: "##",
    hover: "number of voice channel with #",
    get: ({ pVoiceChannel, pChannels }) => {
      if (!pVoiceChannel) {
        return "N/A";
      }
      if (!pChannels) {
        return "N/A";
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel !== undefined) {
        let i = 0;
        pChannel.pVoiceChannels.some((voice) => {
          i++;
          return voice.id === pVoiceChannel.id;
        });
        return `#${i}`;
      }
      return "#-";
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "#",
    hover: "number of voice channel",
    get: ({ pVoiceChannel, pChannels }) => {
      if (!pVoiceChannel) {
        return "N/A";
      }
      if (!pChannels) {
        return "N/A";
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel !== undefined) {
        let i = 0;
        pChannel.pVoiceChannels.some((voice) => {
          i++;
          return voice.id === pVoiceChannel.id;
        });
        return `${i}`;
      }
      return "-";
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "creatorPortal",
    hover: "creator of portal channel",
    get: ({ pVoiceChannel, pChannels }) => {
      if (!pVoiceChannel) {
        return "N/A";
      }
      if (!pChannels) {
        return "N/A";
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel !== undefined) {
        return "" + pChannel.creatorId;
      }

      return "?";
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "creatorVoice",
    hover: "creator of voice channel",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return "N/A";
      }

      return pVoiceChannel.creatorId;
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "date",
    hover: "current date",
    get: ({ pVoiceChannel }) => {
      dayjs.extend(calendar);

      if (!pVoiceChannel) {
        return dayjs().subtract(10, "days").calendar();
      }

      return dayjs().subtract(10, "days").calendar();
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "dayNumber",
    hover: "current day in number format",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().date();
      }

      return dayjs().date();
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "dayName",
    hover: "current day in text format",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().format("dddd");
      }
      return dayjs().format("dddd");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "monthNumber",
    hover: "current month in number format",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().format("M");
      }
      return dayjs().format("M");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "monthName",
    hover: "current month in text format",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().startOf("month").format("MMMM");
      }
      return dayjs().startOf("month").format("MMMM");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "year",
    hover: "current year",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().format("yyyy");
      }
      return dayjs().format("yyyy");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "time",
    hover: "current time",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().format("hh:mm:ss");
      }
      return dayjs().format("hh:mm:ss");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "hour",
    hover: "current hour",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().format("hh");
      }
      return dayjs().format("hh");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "minute",
    hover: "current minute",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().format("mm");
      }
      return dayjs().format("mm");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "second",
    hover: "current second",
    get: ({ pVoiceChannel }) => {
      if (!pVoiceChannel) {
        return dayjs().format("ss");
      }
      return dayjs().format("ss");
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "memberActiveCount",
    hover: "number of members with status",
    get: ({ voiceChannel }) => {
      if (!voiceChannel) return "N/A";
      let cnt = 0;
      voiceChannel.members.forEach((member) => {
        if (member.presence?.activities !== null && !member.user.bot) {
          cnt++;
        }
      });

      return cnt;
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "memberCount",
    hover: "number of members in channel",
    get: ({ voiceChannel }) => {
      if (!voiceChannel) return "N/A";
      let cnt = 0;
      voiceChannel.members.forEach((member) => {
        if (!member.user.bot) {
          cnt++;
        }
      });

      return cnt;
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "memberHistory",
    hover: "all members to ever pass through channel",
    get: () => // voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
    // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    {
      return "noYetImplemented";
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "pMembers",
    hover: "current members names",
    get: ({ voiceChannel }) => {
      if (!voiceChannel) return "N/A";
      const pMembers: string[] = [];
      voiceChannel.members.forEach((member) => {
        pMembers.push(member.displayName);
      });

      return pMembers;
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "memberWithStatus",
    hover: "names of members with statuses",
    get: ({ voiceChannel }) => {
      if (!voiceChannel) return "N/A";
      const pMembers: string[] = [];
      voiceChannel.members.forEach((member) => {
        if (member.presence?.activities !== null) {
          pMembers.push(member.displayName);
        }
      });

      return pMembers;
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "statusCount",
    hover: "number of unique statuses",
    get: ({ voiceChannel, pVoiceChannel }) => {
      if (!voiceChannel) {
        return "N/A";
      }
      if (!pVoiceChannel) {
        return "N/A";
      }

      // can be faster
      const statusList: string[] = getStatusList(voiceChannel, pVoiceChannel);

      return statusList.length;
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "statusHistory",
    hover: "all statuses from start",
    get: () => // voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
    // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    {
      return "noYetImplemented";
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
  {
    name: "statusList",
    hover: "all statuses names",
    get: ({ voiceChannel, pVoiceChannel }) => {
      if (!voiceChannel) {
        return "N/A";
      }
      if (!pVoiceChannel) {
        return "N/A";
      }

      return getStatusList(voiceChannel, pVoiceChannel);
    },
    set: () => undefined,
    auth: AuthType.NONE,
  },
];
