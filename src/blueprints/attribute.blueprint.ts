import { BaseGuildTextChannel, GuildMember, OverwriteType, Role } from 'discord.js';

import { getKeyFromEnum, isMod } from '../libraries/help.library.js';
import { updateGuild, updateMember, updatePortal, updateVoice } from '../libraries/mongo.library.js';
import { PGuild } from '../types/classes/PGuild.class.js';
import { PMember } from '../types/classes/PMember.class.js';
import { PChannel } from '../types/classes/PPortalChannel.class.js';
import { Blueprint, ReturnPromise } from '../types/classes/PTypes.interface.js';
import { PVoiceChannel } from '../types/classes/PVoiceChannel.class.js';
import { AuthType } from '../types/enums/Admin.enum.js';
import { Locale, LocaleList } from '../types/enums/Locales.enum.js';
import { ProfanityLevel, ProfanityLevelList } from '../types/enums/ProfanityLevel.enum.js';
import { RankSpeed } from '../types/enums/RankSpeed.enum.js';

function getResponse(response: boolean, category: string[], attribute: string, value: string | number) {
  const responseValue = response
    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``;

  return {
    result: response,
    value: responseValue,
  };
}

async function updatePortalChannelAttribute(
  pGuildId: PGuild['id'],
  pChannelIdl: PChannel['id'],
  category: string[],
  attribute: string,
  value: string | number,
) {
  const sanitisedValue = value === 'true' ? true : value === 'false' ? false : value;
  const response = await updatePortal(pGuildId, pChannelIdl, attribute, sanitisedValue);

  return getResponse(response, category, attribute, value);
}

async function updateVoiceChannelAttribute(
  pGuildId: PGuild['id'],
  pChannelId: PChannel['id'],
  pVoiceChannelId: PVoiceChannel['id'],
  category: string[],
  attribute: string,
  value: string,
) {
  const sanitisedValue = value === 'true' ? true : value === 'false' ? false : value;
  const response = await updateVoice(pGuildId, pChannelId, pVoiceChannelId, attribute, sanitisedValue);

  return getResponse(response, category, attribute, value);
}

async function updateGuildAttribute(
  pGuildId: PGuild['id'],
  category: string[],
  attribute: keyof PGuild,
  value: string | number,
) {
  const response = await updateGuild(pGuildId, attribute, value);

  return getResponse(response, category, attribute, value);
}

async function updateMemberAttribute(
  pGuildId: PGuild['id'],
  pMemberId: PMember['id'],
  category: string[],
  attribute: string,
  value: string | number,
) {
  const response = await updateMember(pGuildId, pMemberId, attribute, value);

  return getResponse(response, category, attribute, value);
}

export const AttributeBlueprints: Blueprint[] = [
  {
    name: 'p.annAnnounce',
    hover: 'if voice channels spawned by portal channel will make announcements',
    get: ({ pVoiceChannel, pChannels }): boolean | string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      for (let i = 0; i < pChannels.length; i++) {
        if (pChannels[i].pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)) {
          return pChannels[i].annAnnounce;
        }
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'annAnnounce';

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.annAnnounce',
    hover: 'if voice channel will make announcements',
    get: ({ pVoiceChannel }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.annAnnounce;
    },
    set: async ({ pVoiceChannel, pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'annAnnounce';

      if (!pGuild || !pChannel || !pVoiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updateVoiceChannelAttribute(pGuild.id, pChannel.id, pVoiceChannel.id, category, attribute, value);
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.noBots',
    hover: 'if bots can join voice channels spawned by portal channel',
    get: ({ pVoiceChannel, pChannels }): boolean | string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      for (const pChannel of pChannels) {
        const voiceChannel = pChannel.pVoiceChannels.find((voice) => voice.id === pVoiceChannel.id);
        if (voiceChannel) {
          return voiceChannel.noBots;
        }
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'noBots';

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.noBots',
    hover: 'if bots can join voice channel',
    get: ({ pVoiceChannel }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel?.noBots ?? false;
    },
    set: async ({ pVoiceChannel, pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'noBots';

      if (!pGuild || !pChannel || !pVoiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updateVoiceChannelAttribute(pGuild.id, pChannel.id, pVoiceChannel.id, category, attribute, value);
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.allowedRoles',
    hover: 'the role allowed to create a voice channel',
    get: ({ voiceChannel, pVoiceChannel, pChannels }): string[] | string => {
      if (!pVoiceChannel || !voiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        const channel = voiceChannel.guild.channels.cache.find((c) => c.id === pChannel.id) as BaseGuildTextChannel;

        if (channel && channel.permissionOverwrites.cache.size > 0) {
          return `${channel.permissionOverwrites.cache
            .filter((p) => p.type === OverwriteType.Role)
            .filter((p) => p.allow.bitfield === BigInt(1048576))
            .map((p) => {
              const role = voiceChannel.guild.roles.cache.find((r) => r.id === p.id);

              if (role) {
                return `${role.name}`;
              } else {
                return 'N/A';
              }
            })
            .join(', ')}`;
        }
      }

      return '@everyone';
    },
    set: async (): Promise<ReturnPromise> => {
      return {
        result: false,
        value: 'not yet implemented',
      };

      // const category = ['p'];
      // const attribute = 'allowedRoles';

      // if (!voiceChannel || !pChannel || !interaction) {
      //   return {
      //     result: false,
      //     value: 'values are missing from request',
      //   };
      // }

      // if (interaction.mentions.everyone || (interaction.mentions && interaction.mentions.roles)) {
      //   const mentionRoles = Array.prototype.slice.call(interaction.mentions.roles, 0);
      //   if (!interaction.mentions.everyone && mentionRoles.length === 0) {
      //     return Promise.resolve({
      //       result: false,
      //       value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      //     });
      //   }

      //   const channel = voiceChannel.guild.channels.cache.find(
      //     (c) => c.id === pChannel.id
      //   ) as BaseGuildTextChannel;

      //   if (!channel) {
      //     return Promise.resolve({
      //       result: false,
      //       value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      //     });
      //   }

      //   const permittedIds = [];
      //   const disallowedIds = [];

      //   if (!interaction.mentions.everyone) {
      //     interaction.mentions.roles.map((role) => permittedIds.push(role.id));
      //     if (interaction.guild) {
      //       permittedIds.push(pChannel.creatorId);
      //       disallowedIds.push(interaction.guild.roles.everyone.id);
      //     }
      //   } else {
      //     if (interaction && interaction.guild) {
      //       permittedIds.push(interaction.guild.roles.everyone.id);
      //     }
      //   }

      //   for (const permittedId of permittedIds) {
      //     await channel.permissionOverwrites.edit(permittedId, { Connect: true }).catch((e) => {
      //       return Promise.resolve({
      //         result: false,
      //         value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
      //       });
      //     });
      //   }

      //   for (const disallowedId of disallowedIds) {
      //     await channel.permissionOverwrites.edit(disallowedId, { Connect: true }).catch((e) => {
      //       return Promise.resolve({
      //         result: false,
      //         value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
      //       });
      //     });
      //   }

      //   const roles = interaction.mentions.everyone
      //     ? '@everyone'
      //     : interaction.mentions.roles.map((r) => `@${r.name}`).join(', ');

      //   return Promise.resolve({
      //     result: true,
      //     value: `attribute ${category.join('.') + '.' + attribute} set successfully to \`${roles}\``,
      //   });
      // }

      // return Promise.resolve({
      //   result: true,
      //   value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      // });
    },
    auth: AuthType.portal,
  },
  {
    name: 'p.v.allowedRoles',
    hover: 'the role given to the spawned voice channels',
    get: ({ voiceChannel, pVoiceChannel, pChannels }): string[] | string => {
      if (!pVoiceChannel || !voiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel && pChannel.allowedRoles) {
        const allowedRoles = voiceChannel.guild.roles.cache.filter((r) => {
          if (pChannel.allowedRoles) {
            return pChannel.allowedRoles.some((id) => id === r.id);
          } else {
            return false;
          }
        });

        if (allowedRoles) {
          return `${allowedRoles.map((r) => r.name).join(', ')}`;
        } else {
          return 'N/A';
        }
      }

      return '@everyone';
    },
    set: async (): Promise<ReturnPromise> => {
      return {
        result: false,
        value: 'not yet implemented',
      };

      // const category = ['p', 'v'];
      // const attribute = 'allowedRoles';

      // if (!pGuild || !pChannel || !interaction) {
      //   return {
      //     result: false,
      //     value: 'values are missing from request',
      //   };
      // }

      // return new Promise((resolve) => {
      //   if (interaction.mentions.everyone || (interaction.mentions && interaction.mentions.roles)) {
      //     const mentionRoles = Array.prototype.slice.call(interaction.mentions.roles, 0);
      //     if (!interaction.mentions.everyone && mentionRoles.length === 0) {
      //       return resolve({
      //         result: false,
      //         value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      //       });
      //     }

      //     const allowedRoles = interaction.mentions.everyone
      //       ? interaction.guild?.roles.everyone.id
      //       : interaction.mentions.roles.map((r) => r.id);

      //     if (allowedRoles) {
      //       updatePortal(pGuild.id, pChannel.id, attribute, allowedRoles)
      //         .then((r) => {
      //           const roles = interaction.mentions.everyone
      //             ? '@everyone'
      //             : interaction.mentions.roles.map((r) => `@${r.name}`).join(', ');

      //           return resolve({
      //             result: r,
      //             value: r
      //               ? `attribute ${
      //                 category.join('.') + '.' + attribute
      //               } set successfully to \`${roles}\``
      //               : `attribute ${
      //                 category.join('.') + '.' + attribute
      //               } failed to be set to \`${roles}\``,
      //           });
      //         })
      //         .catch((e) => {
      //           return resolve({
      //             result: false,
      //             value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
      //           });
      //         });
      //     } else {
      //       return resolve({
      //         result: false,
      //         value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      //       });
      //     }
      //   }
      // });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.allowedRoles',
    hover: 'the role allowed join the voice channel',
    get: ({ voiceChannel, pVoiceChannel }): string[] | string => {
      if (!pVoiceChannel || !voiceChannel) {
        return 'N/A';
      }

      if (!pVoiceChannel || !voiceChannel || voiceChannel.permissionOverwrites.cache.size > 0) {
        return `${voiceChannel.permissionOverwrites.cache
          .filter((p) => p.type === OverwriteType.Role)
          .filter((p) => p.allow.bitfield === BigInt(1048576))
          .map((p) => {
            const role = voiceChannel.guild.roles.cache.find((r) => r.id === p.id);

            if (role) {
              return `${role.name}`;
            } else {
              return 'N/A';
            }
          })
          .join(', ')}`;
      }

      return '@everyone';
    },
    set: async (): Promise<ReturnPromise> => {
      return {
        result: false,
        value: 'not yet implemented',
      };

      // const category = ['v'];
      // const attribute = 'allowedRoles';

      // if (!voiceChannel || !pChannel || !interaction) {
      //   return {
      //     result: false,
      //     value: 'values are missing from request',
      //   };
      // }

      // if (interaction.mentions.everyone || (interaction.mentions && interaction.mentions.roles)) {
      //   const mentionRoles = Array.prototype.slice.call(interaction.mentions.roles, 0);
      //   if (!interaction.mentions.everyone && mentionRoles.length === 0) {
      //     return Promise.resolve({
      //       result: false,
      //       value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      //     });
      //   }

      //   const permittedIds = [];
      //   const disallowedIds = [];

      //   if (!interaction.mentions.everyone) {
      //     interaction.mentions.roles.map((role) => permittedIds.push(role.id));
      //     if (interaction.guild) {
      //       permittedIds.push(pChannel.creatorId);
      //       disallowedIds.push(interaction.guild.roles.everyone.id);
      //     }
      //   } else {
      //     if (interaction && interaction.guild) {
      //       permittedIds.push(interaction.guild.roles.everyone.id);
      //     }
      //   }

      //   for (const permittedId of permittedIds) {
      //     await voiceChannel.permissionOverwrites.edit(permittedId, { Connect: true }).catch((e) => {
      //       return Promise.resolve({
      //         result: false,
      //         value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
      //       });
      //     });
      //   }

      //   for (const disallowedId of disallowedIds) {
      //     await voiceChannel.permissionOverwrites.edit(disallowedId, { Connect: true }).catch((e) => {
      //       return Promise.resolve({
      //         result: false,
      //         value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
      //       });
      //     });
      //   }

      //   const roles = interaction.mentions.everyone
      //     ? '@everyone'
      //     : interaction.mentions.roles.map((role) => `@${role.name}`).join(', ');

      //   return Promise.resolve({
      //     result: true,
      //     value: `attribute ${category.join('.') + '.' + attribute} set successfully to \`${roles}\``,
      //   });
      // }

      // return Promise.resolve({
      //   result: false,
      //   value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      // });
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.render',
    hover: 'if voice channels spawned by portal channel will use the text interpreter',
    get: ({ pVoiceChannel, pChannels }): boolean | string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        return pChannel.render;
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'render';

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.render',
    hover: 'if voice channel will use the text interpreter',
    get: ({ pVoiceChannel }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.render;
    },
    set: async ({ pVoiceChannel, pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'render';

      if (!pGuild || !pChannel || !pVoiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.annUser',
    hover: 'if voice channels spawned by portal channel will make join/leave announcements',
    get: ({ pVoiceChannel, pChannels }): boolean | string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        return pChannel.annUser;
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'annUser';

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.annUser',
    hover: 'if voice channel will make join/leave announcements',
    get: ({ pVoiceChannel }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.annUser;
    },
    set: async ({ pVoiceChannel, pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'annUser';

      if (!pGuild || !pChannel || !pVoiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.voice,
  },
  {
    name: 'v.bitrate',
    hover: 'voice channels bitrate',
    get: ({ voiceChannel }): number => {
      return voiceChannel?.bitrate ?? 96000;
    },
    set: async ({ voiceChannel }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'bitrate';
      const newBitrate = Number(value);

      if (!voiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      return new Promise((resolve) => {
        if (isNaN(newBitrate)) {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **a number**`,
          });
        }

        if (newBitrate < 8000) {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} must be greater or equal to 8000`,
          });
        }

        voiceChannel
          .edit({ bitrate: newBitrate })
          .then((r) => {
            return resolve({
              result: r.bitrate === newBitrate,
              value:
                r.bitrate === newBitrate
                  ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to\`${value}\` to ${value} (is ${r.bitrate})`,
            });
          })
          .catch((e) => {
            return resolve({
              result: false,
              value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
            });
          });
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'g.kickAfter',
    hover: 'Portals kickAfter',
    get: ({ pGuild }): number => {
      return pGuild?.kickAfter ?? 1;
    },
    set: async ({ pGuild, interaction }, value): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'kickAfter';

      if (!pGuild || !interaction) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (!isMod(interaction.member as GuildMember | null)) {
        return {
          result: false,
          value: `you must be a Portal moderator to set attribute ${category.join('.') + '.' + attribute}`,
        };
      }

      if (isNaN(Number(value))) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} has to be a number`,
        };
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, Number(value));
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.banAfter',
    hover: 'Portals banAfter',
    get: ({ pGuild }): number => {
      return pGuild?.banAfter ?? 1;
    },
    set: async ({ pGuild, interaction }, value): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'banAfter';

      if (!pGuild || !interaction) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (!isMod(interaction.member as GuildMember | null)) {
        return {
          result: false,
          value: `you must be a Portal moderator to set attribute ${category.join('.') + '.' + attribute}`,
        };
      }

      if (isNaN(Number(value))) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} has to be a number`,
        };
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, Number(value));
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.muteRole',
    hover: 'role given to muted members',
    get: ({ guild, pGuild }): string => {
      if (!guild) {
        return 'N/A';
      }

      const muteRole = guild.roles.cache.find((r) => r.id === pGuild?.muteRole);

      if (muteRole) {
        return muteRole.name;
      }

      return 'N/A';
    },
    set: async ({ pGuild, interaction }, value): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'muteRole';

      if (!pGuild || !interaction) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (!(value instanceof Role)) {
        return Promise.resolve({
          result: false,
          value: 'value must be Role',
        });
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, value.id);
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.rankSpeed',
    hover: 'leveling speed of members',
    get: ({ pGuild }): string => {
      return RankSpeed[pGuild?.rankSpeed ?? 1];
    },
    set: async ({ pGuild }, value): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'rankSpeed';

      if (!pGuild) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value instanceof Role) {
        return Promise.resolve({
          result: false,
          value: 'value cannot be Role',
        });
      }

      const speed = getKeyFromEnum(value, RankSpeed);

      if (!speed) {
        return Promise.resolve({
          result: false,
          value: 'value can not be assigned to rank a valid ranking speed',
        });
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, speed);
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.profanityLevel',
    hover: 'how harsh Portal will be flagging members for use of profanities',
    get: ({ pGuild }): string => {
      return ProfanityLevel[pGuild?.profanityLevel ?? 1];
    },
    set: async ({ pGuild }, value): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'profanityLevel';

      if (!pGuild) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value instanceof Role) {
        return Promise.resolve({
          result: false,
          value: 'value cannot be Role',
        });
      }

      const level = getKeyFromEnum(value, ProfanityLevel);

      if (level === undefined) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **${ProfanityLevelList.join(', ')}**`,
        };
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, level);
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.initialRole',
    hover: 'role given to new members',
    get: ({ pGuild, guild }): string => {
      if (!pGuild?.initialRole || pGuild.initialRole === 'null') {
        return 'initial role has not been set yet 1';
      }

      const role = guild?.roles.cache.find((r) => r.id === pGuild.initialRole);

      if (role) {
        return `@${role.name}`;
      } else {
        return 'initial role has not been set yet 2';
      }
    },
    set: async ({ pGuild, interaction }, value): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'initialRole';

      if (!pGuild || !interaction) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (!interaction.guild) {
        return {
          result: false,
          value: `attribute ${
            category.join('.') + '.' + attribute
          } failed to be set as user guild could not be fetched`,
        };
      }

      if (!(value instanceof Role)) {
        return Promise.resolve({
          result: false,
          value: 'value must be Role',
        });
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, value.id);
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.locale',
    hover: 'Portals locale',
    get: ({ pGuild }): string => {
      return Locale[pGuild?.locale ?? 1];
    },
    set: async ({ pGuild }, value): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'locale';

      if (value instanceof Role) {
        return Promise.resolve({
          result: false,
          value: 'value cannot be Role',
        });
      }

      if (!pGuild) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      const locale = getKeyFromEnum(value, Locale);

      if (locale === undefined) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(', ')}**`,
        };
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, locale);
    },
    auth: AuthType.admin,
  },
  {
    name: 'p.locale',
    hover: 'portal channels locale',
    get: ({ pVoiceChannel, pChannels }): string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        return Locale[pChannel.locale];
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'locale';

      if (value instanceof Role) {
        return Promise.resolve({
          result: false,
          value: 'value cannot be Role',
        });
      }

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      const locale = getKeyFromEnum(value, Locale);

      if (locale === undefined) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(', ')}**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, locale);
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.locale',
    hover: 'voice channels locale',
    get: ({ pVoiceChannel }): string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return Locale[pVoiceChannel?.locale ?? 1];
    },
    set: async ({ pVoiceChannel, pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'locale';

      if (value instanceof Role) {
        return Promise.resolve({
          result: false,
          value: 'value cannot be Role',
        });
      }

      if (!pGuild || !pChannel || !pVoiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      const locale = getKeyFromEnum(value, Locale);

      if (locale === undefined) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(', ')}**`,
        };
      }

      return await updateGuildAttribute(pGuild.id, category, attribute, locale);
    },
    auth: AuthType.voice,
  },
  {
    name: 'v.position',
    hover: 'voice channels position in Discord',
    get: ({ voiceChannel }): number | string => {
      if (!voiceChannel) {
        return 'N/A';
      }

      return voiceChannel.position;
    },
    set: async ({ voiceChannel }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'position';

      if (!voiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (isNaN(Number(value))) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **a number**`,
        };
      }

      const updatedVoiceChannel = await voiceChannel.edit({ position: Number(value) });

      return {
        result: updatedVoiceChannel.position === Number(value),
        value:
          updatedVoiceChannel.position === Number(value)
            ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
            : `attribute ${
              category.join('.') + '.' + attribute
            } failed to be set to\`${value}\` to ${value} (is ${updatedVoiceChannel.position})`,
      };
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.regexOverwrite',
    hover: 'whether voice channels spawned from portal channel will let users use their own regex',
    get: ({ pVoiceChannel, pChannels }): boolean | string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        return pChannel.regexOverwrite;
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'regexOverwrite';

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.regex',
    hover: 'portal channels regex',
    get: ({ pVoiceChannel, pChannels }): string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        return pChannel.regexPortal;
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'regexPortal';

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.portal,
  },
  {
    name: 'p.v.regex',
    hover: 'voice channels spawned by portal channel regex',
    get: ({ pVoiceChannel, pChannels }): string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        return pChannel.regexVoice;
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p', 'v'];
      const attribute = 'regexVoice';

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value !== 'true' && value !== 'false') {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, value);
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.regex',
    hover: 'voice channels regex',
    get: ({ pVoiceChannel }): string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.regex;
    },
    set: async ({ pVoiceChannel, pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'regex';

      if (!pGuild || !pChannel || !pVoiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (value instanceof Role) {
        return Promise.resolve({
          result: false,
          value: 'value cannot be Role',
        });
      }

      return await updateVoiceChannelAttribute(pGuild.id, pChannel.id, pVoiceChannel.id, category, attribute, value);
    },
    auth: AuthType.voice,
  },
  {
    name: 'm.regex',
    hover: 'members regex',
    get: ({ pMember }): string => {
      return pMember && pMember.regex ? pMember.regex : 'not-set';
    },
    set: async ({ pGuild, pMember }, value): Promise<ReturnPromise> => {
      const category = ['m'];
      const attribute = 'regex';

      if (!pGuild) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (!pMember) {
        return {
          result: false,
          value: 'could not find member',
        };
      }

      if (value instanceof Role) {
        return Promise.resolve({
          result: false,
          value: 'value cannot be Role',
        });
      }

      return await updateMemberAttribute(pGuild.id, pMember.id, category, attribute, value);
    },
    auth: AuthType.none,
  },
  {
    name: 'p.userLimit',
    hover: 'voice channels spawned by portal channel user limit',
    get: ({ pVoiceChannel, pChannels }): number | string => {
      if (!pVoiceChannel || !pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) => portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id));

      if (pChannel) {
        return pChannel.userLimitPortal;
      }

      return 'N/A';
    },
    set: async ({ pChannel, pGuild }, value): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'userLimitPortal';
      const newUserLimit = Number(value);

      if (!pGuild || !pChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (isNaN(newUserLimit)) {
        return {
          result: false,
          value: `attribute ${
            category.join('.') + '.' + attribute
          } can only be **a number from 0-99 (0 means unlimited)**`,
        };
      }

      if (newUserLimit < 0) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} can be a number from 0-n (0 means unlimited)`,
        };
      }

      return await updatePortalChannelAttribute(pGuild.id, pChannel.id, category, attribute, newUserLimit);
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.userLimit',
    hover: 'voice channels user limit',
    get: ({ voiceChannel }): number | string => {
      if (!voiceChannel) {
        return 'N/A';
      }

      return voiceChannel.userLimit;
    },
    set: async ({ voiceChannel }, value): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'userLimit';
      const newUserLimit = Number(value);

      if (!voiceChannel) {
        return {
          result: false,
          value: 'values are missing from request',
        };
      }

      if (newUserLimit < 0) {
        return {
          result: false,
          value: `attribute ${
            category.join('.') + '.' + attribute
          } can only be **a number from 0-n (0 means unlimited)**`,
        };
      }

      const updatedVoiceChannel = await voiceChannel.setUserLimit(newUserLimit);

      if (!updatedVoiceChannel) {
        return {
          result: false,
          value: `attribute ${category.join('.') + '.' + attribute} failed to be set`,
        };
      }

      return {
        result: updatedVoiceChannel.userLimit === newUserLimit,
        value:
          updatedVoiceChannel.userLimit === newUserLimit
            ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
            : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``,
      };
    },
    auth: AuthType.voice,
  },
];
