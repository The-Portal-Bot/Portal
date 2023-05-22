import { Guild, EmbedBuilder, VoiceChannel } from 'discord.js';
import moment from 'moment';
import { AuthType } from '../enums/Admin.enum';
import { createEmbed } from '../../libraries/help.library';
import { getStatusList } from '../../libraries/status.library';
import { PGuild } from '../classes/PGuild.class';
import { PChannel } from '../classes/PPortalChannel.class';
import { Field, InterfaceBlueprint } from '../classes/PTypes.interface';
import { PVoiceChannel } from '../classes/PVoiceChannel.class';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';
export const VARIABLE_PREFIX = '$';

const variables: InterfaceBlueprint[] = [
  {
    name: '##',
    hover: 'number of voice channel with #',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null,
      pChannels: PChannel[] | undefined | null // , pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
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
      return '#-';
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: '#',
    hover: 'number of voice channel',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null,
      pChannels: PChannel[] | undefined | null // , pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
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
      return '-';
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'creatorPortal',
    hover: 'creator of portal channel',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null,
      pChannels: PChannel[] | undefined | null // , pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel !== undefined) {
        return '' + pChannel.creatorId;
      }

      return '?';
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'creatorVoice',
    hover: 'creator of voice channel',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.creatorId;
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'date',
    hover: 'current date',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().subtract(10, 'days').calendar();
      }

      return moment().subtract(10, 'days').calendar();
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'dayNumber',
    hover: 'current day in number format',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().date();
      }

      return moment().date();
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'dayName',
    hover: 'current day in text format',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().format('dddd');
      }
      return moment().format('dddd');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'monthNumber',
    hover: 'current month in number format',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().format('M');
      }
      return moment().format('M');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'monthName',
    hover: 'current month in text format',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().startOf('month').format('MMMM');
      }
      return moment().startOf('month').format('MMMM');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'year',
    hover: 'current year',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().format('yyyy');
      }
      return moment().format('yyyy');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'time',
    hover: 'current time',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().format('hh:mm:ss');
      }
      return moment().format('hh:mm:ss');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'hour',
    hover: 'current hour',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().format('hh');
      }
      return moment().format('hh');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'minute',
    hover: 'current minute',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().format('mm');
      }
      return moment().format('mm');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'second',
    hover: 'current second',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!pVoiceChannel) {
        return moment().format('ss');
      }
      return moment().format('ss');
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'memberActiveCount',
    hover: 'number of members with status',
    get: (
      voiceChannel: VoiceChannel | undefined | null // , pVoiceChannel: PVoiceChannel | undefined | null,
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!voiceChannel) return 'N/A';
      let cnt = 0;
      voiceChannel.members.forEach((member) => {
        if (member.presence?.activities !== null && !member.user.bot) {
          cnt++;
        }
      });

      return cnt;
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'memberCount',
    hover: 'number of members in channel',
    get: (
      voiceChannel: VoiceChannel | undefined | null // , pVoiceChannel: PVoiceChannel | undefined | null,
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!voiceChannel) return 'N/A';
      let cnt = 0;
      voiceChannel.members.forEach((member) => {
        if (!member.user.bot) {
          cnt++;
        }
      });

      return cnt;
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'memberHistory',
    hover: 'all members to ever pass through channel',
    get: () =>
    // voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
    // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    {
      return 'noYetImplemented';
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'pMembers',
    hover: 'current members names',
    get: (
      voiceChannel: VoiceChannel | undefined | null // , pVoiceChannel: PVoiceChannel | undefined | null,
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!voiceChannel) return 'N/A';
      const pMembers: string[] = [];
      voiceChannel.members.forEach((member) => {
        pMembers.push(member.displayName);
      });

      return pMembers;
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'memberWithStatus',
    hover: 'names of members with statuses',
    get: (
      voiceChannel: VoiceChannel | undefined | null // , pVoiceChannel: PVoiceChannel | undefined | null,
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!voiceChannel) return 'N/A';
      const pMembers: string[] = [];
      voiceChannel.members.forEach((member) => {
        if (member.presence?.activities !== null) {
          pMembers.push(member.displayName);
        }
      });

      return pMembers;
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'statusCount',
    hover: 'number of unique statuses',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!voiceChannel) {
        return 'N/A';
      }
      if (!pVoiceChannel) {
        return 'N/A';
      }

      // can be faster
      const statusList: string[] = getStatusList(voiceChannel, pVoiceChannel);

      return statusList.length;
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'statusHistory',
    hover: 'all statuses from start',
    get: () =>
    // voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
    // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    {
      return 'noYetImplemented';
    },
    set: null,
    auth: AuthType.none,
  },
  {
    name: 'statusList',
    hover: 'all statuses names',
    get: (
      voiceChannel: VoiceChannel | undefined | null,
      pVoiceChannel: PVoiceChannel | undefined | null
      // pChannels: PChannel[] | undefined | null, pGuild, guild: Guild
    ) => {
      if (!voiceChannel) {
        return 'N/A';
      }
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return getStatusList(voiceChannel, pVoiceChannel);
    },
    set: null,
    auth: AuthType.none,
  },
];

export function isVariable(candidate: string): string {
  for (let i = 0; i < variables.length; i++) {
    const subString = String(candidate).substring(1, String(variables[i].name).length + 1);

    if (subString === variables[i].name) {
      return variables[i].name;
    }
  }

  return '';
}

export function getVariableGuide(): EmbedBuilder {
  const structArray: Field[] = [
    {
      emote: 'Used in Regex Interpreter',
      role: '*used by channel name (regex, regexVoice, regexPortal) and run command*',
      inline: true,
    },
    {
      emote: 'variables are immutable and live data',
      role: '*data corresponds to server, portal or voice channel live data*',
      inline: true,
    },
    {
      emote: '1.\tIn any text channel execute command `./run`',
      role: './run just like channel name generation uses the text interpreter',
      inline: false,
    },
    {
      emote: '2.\t`./run The year is $year`',
      role: './run executes the given text and replies with the processed output',
      inline: false,
    },
    {
      emote: '3.\tAwait a reply from portal which will be `The year is 2021',
      role: '*note that at the time of writhing it is 2021*',
      inline: false,
    },
  ];

  return createEmbed(
    'Variable Guide',
    '[Variables](' +
            PORTAL_URL +
            INTERPRETER_URL +
            '/variables/description) ' +
            'are immutable and live data that return information about your current voice channel.\n' +
            'how to use variables with text interpreter',
    '#1BE7FF',
    structArray,
    null,
    null,
    null,
    null,
    null
  );
}

function getLink(variable: string): string {
  const url = PORTAL_URL + INTERPRETER_URL + '/variables';
  const general = ['creatorPortal', 'creatorVoice', '##', '#'];
  const member = ['pMembers', 'memberCount', 'memberActiveCount', 'memberWithStatus', 'memberHistory'];
  const status = ['statusList', 'statusCount', 'statusHistory'];
  const time = [
    'date',
    'dayNumber',
    'dayName',
    'monthNumber',
    'monthName',
    'year',
    'time',
    'hour',
    'minute',
    'second',
  ];

  if (general.includes(variable)) {
    if (variable === '##') {
      return `${url}/detailed/general/slash`;
    } else if (variable === '#') {
      return `${url}/detailed/general/doubleSlash`;
    } else {
      return `${url}/detailed/general/${variable}`;
    }
  } else if (member.includes(variable)) {
    return `${url}/detailed/member/${variable}`;
  } else if (status.includes(variable)) {
    return `${url}/detailed/status/${variable}`;
  } else if (time.includes(variable)) {
    return `${url}/detailed/time/${variable}`;
  } else {
    return `${url}/description`;
  }
}

export function getVariableHelp(): EmbedBuilder[] {
  const variableArray: Field[][] = [];

  for (let l = 0; l <= variables.length / 24; l++) {
    variableArray[l] = [];
    for (let i = 24 * l; i < variables.length && i < 24 * (l + 1); i++) {
      variableArray[l].push({
        emote: `${i + 1}. ${variables[i].name}`,
        role: `[hover or click](${getLink(variables[i].name)} "${getLink(variables[i].hover)}")`,
        inline: true,
      });
    }
  }

  return variableArray.map((command, index) => {
    if (index === 0) {
      return createEmbed(
        'Variables',
        '[Variables](' +
                    PORTAL_URL +
                    INTERPRETER_URL +
                    '/variables/description) ' +
                    'are immutable and live data that return information about your current voice channel.\n' +
                    'Prefix: ' +
                    VARIABLE_PREFIX,
        '#1BE7FF',
        variableArray[0],
        null,
        null,
        null,
        null,
        null
      );
    } else {
      return createEmbed(null, null, '#1BE7FF', variableArray[index], null, null, null, null, null);
    }
  });
}

export function getVariableHelpSuper(candidate: string): EmbedBuilder | boolean {
  for (let i = 0; i < variables.length; i++) {
    if (variables[i].name === candidate) {
      return createEmbed(
        variables[i].name,
        null,
        '#1BE7FF',
        [
          { emote: `Type`, role: `Variables`, inline: true },
          { emote: `Prefix`, role: `${VARIABLE_PREFIX}`, inline: true },
          {
            emote: `Description`,
            role: `[hover or click](${getLink(candidate)} "${variables[i].hover}")`,
            inline: true,
          },
        ],
        null,
        null,
        null,
        null,
        null
      );
    }
  }

  return false;
}

export function getVariable(
  voiceChannel: VoiceChannel | undefined | null,
  pVoiceChannel: PVoiceChannel | undefined | null,
  pChannels: PChannel[] | undefined | null,
  pGuild: PGuild,
  guild: Guild,
  variable: string
) {
  let variableIndex = -1;
  for (let l = 0; l < variables.length; l++) {
    if (variable === variables[l].name) {
      variableIndex = l;
      break;
    }
  }

  if (variableIndex === -1) {
    return -1;
  }

  return variables[variableIndex].get(voiceChannel, pVoiceChannel, pChannels, pGuild, guild);
}
