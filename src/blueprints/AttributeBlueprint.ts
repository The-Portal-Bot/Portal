import {
  BaseGuildTextChannel,
  OverwriteType
} from 'discord.js';
import { getKeyFromEnum, isMod } from '../libraries/help.library';
import { updateGuild, updateMember, updatePortal, updateVoice } from '../libraries/mongo.library';
import { Blueprint, ReturnPromise } from '../types/classes/PTypes.interface';
import { AuthType } from '../types/enums/Admin.enum';
import { Locale, LocaleList } from '../types/enums/Locales.enum';
import { ProfanityLevel, ProfanityLevelList } from '../types/enums/ProfanityLevel.enum';
import { RankSpeed, RankSpeedList } from '../types/enums/RankSpeed.enum';

export const AttributeBlueprints: Blueprint[] = [
  {
    name: 'p.annAnnounce',
    hover: 'if voice channels spawned by portal channel will make announcements',
    get: ({
      pVoiceChannel,
      pChannels,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.annAnnounce;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'annAnnounce';

      if (!pGuild) {
        throw new Error('pGuild is undefined');
      }

      if (!pChannel) {
        throw new Error('pChannel is undefined');
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updatePortal(pGuild.id, pChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updatePortal(pGuild.id, pChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.annAnnounce',
    hover: 'if voice channel will make announcements',
    get: ({
      pVoiceChannel,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.annAnnounce;
    },
    set: ({
      pVoiceChannel,
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'annAnnounce';

      if (!pGuild) {
        throw new Error('pGuild is undefined');
      }

      if (!pChannel) {
        throw new Error('pChannel is undefined');
      }

      if (!pVoiceChannel) {
        throw new Error('pVoiceChannel is undefined');
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.noBots',
    hover: 'if bots can join voice channels spawned by portal channel',
    get: ({
      pVoiceChannel,
      pChannels,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.noBots;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'noBots';

      if (!pGuild) {
        throw new Error('pGuild is undefined');
      }

      if (!pChannel) {
        throw new Error('pChannel is undefined');
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updatePortal(pGuild.id, pChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updatePortal(pGuild.id, pChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.noBots',
    hover: 'if bots can join voice channel',
    get: ({
      pVoiceChannel,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel?.noBots ??  false;
    },
    set: ({
      pVoiceChannel,
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'noBots';

      if (!pGuild) {
        throw new Error('pGuild is undefined');
      }

      if (!pChannel) {
        throw new Error('pChannel is undefined');
      }

      if (!pVoiceChannel) {
        throw new Error('pVoiceChannel is undefined');
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.allowedRoles',
    hover: 'the role allowed to create a voice channel',
    get: ({
      voiceChannel,
      pVoiceChannel,
      pChannels,
    }): string[] | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!voiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        const channel = voiceChannel.guild.channels.cache.find(
          (c) => c.id === pChannel.id
        ) as BaseGuildTextChannel;

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
    set: async ({
      voiceChannel,
      pChannel,
      message,
    }): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'allowedRoles';

      if (!voiceChannel) {
        return Promise.resolve({
          result: false,
          value: 'voice channel is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      if (!message) {
        return Promise.resolve({
          result: false,
          value: 'pVoiceChannel is undefined',
        });
      }

      if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
        const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
        if (!message.mentions.everyone && mentionRoles.length === 0) {
          return Promise.resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
          });
        }

        const channel = voiceChannel.guild.channels.cache.find(
          (c) => c.id === pChannel.id
        ) as BaseGuildTextChannel;

        if (!channel) {
          return Promise.resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
          });
        }

        const permittedIds = [];
        const disallowedIds = [];

        if (!message.mentions.everyone) {
          message.mentions.roles.map((role) => permittedIds.push(role.id));
          if (message.guild) {
            permittedIds.push(pChannel.creatorId);
            disallowedIds.push(message.guild.roles.everyone.id);
          }
        } else {
          if (message && message.guild) {
            permittedIds.push(message.guild.roles.everyone.id);
          }
        }

        for (const permittedId of permittedIds) {
          await channel.permissionOverwrites.edit(permittedId, { Connect: true }).catch((e) => {
            return Promise.resolve({
              result: false,
              value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
            });
          });
        }

        for (const disallowedId of disallowedIds) {
          await channel.permissionOverwrites.edit(disallowedId, { Connect: true }).catch((e) => {
            return Promise.resolve({
              result: false,
              value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
            });
          });
        }

        const roles = message.mentions.everyone
          ? '@everyone'
          : message.mentions.roles.map((r) => `@${r.name}`).join(', ');

        return Promise.resolve({
          result: true,
          value: `attribute ${category.join('.') + '.' + attribute} set successfully to \`${roles}\``,
        });
      }

      return Promise.resolve({
        result: true,
        value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'p.v.allowedRoles',
    hover: 'the role given to the spawned voice channels',
    get: ({
      voiceChannel,
      pVoiceChannel,
      pChannels,
    }): string[] | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!voiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

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
    set: ({
      pChannel,
      pGuild,
      message
    }): Promise<ReturnPromise> => {
      const category = ['p', 'v'];
      const attribute = 'allowedRoles';

      if (!message) {
        return Promise.resolve({
          result: false,
          value: 'message is undefined',
        });
      }

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'portal Guild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'voice channel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
          const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
          if (!message.mentions.everyone && mentionRoles.length === 0) {
            return resolve({
              result: false,
              value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
            });
          }

          const allowedRoles = message.mentions.everyone
            ? message.guild?.roles.everyone.id
            : message.mentions.roles.map((r) => r.id);

          if (allowedRoles) {
            updatePortal(pGuild.id, pChannel.id, attribute, allowedRoles)
              .then((r) => {
                const roles = message.mentions.everyone
                  ? '@everyone'
                  : message.mentions.roles.map((r) => `@${r.name}`).join(', ');

                return resolve({
                  result: r,
                  value: r
                    ? `attribute ${
                      category.join('.') + '.' + attribute
                    } set successfully to \`${roles}\``
                    : `attribute ${
                      category.join('.') + '.' + attribute
                    } failed to be set to \`${roles}\``,
                });
              })
              .catch((e) => {
                return resolve({
                  result: false,
                  value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
                });
              });
          } else {
            return resolve({
              result: false,
              value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
            });
          }
        }
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.allowedRoles',
    hover: 'the role allowed join the voice channel',
    get: ({
      voiceChannel,
      pVoiceChannel,
    }): string[] | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!voiceChannel) {
        return 'N/A';
      }

      if (voiceChannel.permissionOverwrites.cache.size > 0) {
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
    set: async ({
      voiceChannel,
      pChannel,
      message,
    }): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'allowedRoles';

      if (!message) {
        return Promise.resolve({
          result: false,
          value: 'message is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'portal channel is undefined',
        });
      }

      if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
        const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
        if (!message.mentions.everyone && mentionRoles.length === 0) {
          return Promise.resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
          });
        }

        if (!voiceChannel) {
          return Promise.resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
          });
        }

        const permittedIds = [];
        const disallowedIds = [];

        if (!message.mentions.everyone) {
          message.mentions.roles.map((role) => permittedIds.push(role.id));
          if (message.guild) {
            permittedIds.push(pChannel.creatorId);
            disallowedIds.push(message.guild.roles.everyone.id);
          }
        } else {
          if (message && message.guild) {
            permittedIds.push(message.guild.roles.everyone.id);
          }
        }

        for (const permittedId of permittedIds) {
          await voiceChannel.permissionOverwrites.edit(permittedId, { Connect: true }).catch((e) => {
            return Promise.resolve({
              result: false,
              value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
            });
          });
        }

        for (const disallowedId of disallowedIds) {
          await voiceChannel.permissionOverwrites.edit(disallowedId, { Connect: true }).catch((e) => {
            return Promise.resolve({
              result: false,
              value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
            });
          });
        }

        const roles = message.mentions.everyone
          ? '@everyone'
          : message.mentions.roles.map((r) => `@${r.name}`).join(', ');

        return Promise.resolve({
          result: true,
          value: `attribute ${category.join('.') + '.' + attribute} set successfully to \`${roles}\``,
        });
      }

      return Promise.resolve({
        result: false,
        value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`,
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.render',
    hover: 'if voice channels spawned by portal channel will use the text interpreter',
    get: ({
      pVoiceChannel,
      pChannels,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.render;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'render';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updatePortal(pGuild.id, pChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updatePortal(pGuild.id, pChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.render',
    hover: 'if voice channel will use the text interpreter',
    get: ({
      pVoiceChannel
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.render;
    },
    set: ({
      pVoiceChannel,
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'render';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      if (!pVoiceChannel) {
        return Promise.resolve({
          result: false,
          value: 'pVoiceChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.annUser',
    hover: 'if voice channels spawned by portal channel will make join/leave announcements',
    get: ({
      pVoiceChannel,
      pChannels,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.annUser;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'annUser';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updatePortal(pGuild.id, pChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updatePortal(pGuild.id, pChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.annUser',
    hover: 'if voice channel will make join/leave announcements',
    get: ({
      pVoiceChannel,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.annUser;
    },
    set: ({
      pVoiceChannel,
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'annUser';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      if (!pVoiceChannel) {
        return Promise.resolve({
          result: false,
          value: 'pVoiceChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'v.bitrate',
    hover: 'voice channels bitrate',
    get: ({ voiceChannel }): number => {
      return voiceChannel?.bitrate ?? 96000;
    },
    set: ({
      voiceChannel,
    },
    value: string
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'bitrate';
      const newBitrate = Number(value);

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

        if (!voiceChannel) {
          return Promise.resolve({
            result: false,
            value: 'voiceChannel is undefined',
          });
        }

        voiceChannel
          .edit({ bitrate: newBitrate })
          .then((r) => {
            return resolve({
              result: r.bitrate === newBitrate,
              value:
                                r.bitrate === newBitrate
                                  ? `attribute ${
                                    category.join('.') + '.' + attribute
                                  } set successfully to \`${value}\``
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
    get: ({
      pGuild,
    }): number => {
      return pGuild?.kickAfter ?? 1;
    },
    set: ({
      pGuild,
      message,
    },
    value: string
    ): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'kickAfter';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!message) {
        return Promise.resolve({
          result: false,
          value: 'message is undefined',
        });
      }

      return new Promise((resolve) => {
        if (!isMod(message.member)) {
          return resolve({
            result: false,
            value: `you must be a Portal moderator to set attribute ${
              category.join('.') + '.' + attribute
            }`,
          });
        }

        if (isNaN(Number(value))) {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} has to be a number`,
          });
        }

        updateGuild(pGuild.id, attribute, Number(value))
          .then((r) => {
            return resolve({
              result: r,
              value: r
                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``,
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
    auth: AuthType.admin,
  },
  {
    name: 'g.banAfter',
    hover: 'Portals banAfter',
    get: ({
      pGuild,
    }): number => {
      return pGuild?.banAfter ?? 1;
    },
    set: ({
      pGuild,
      message,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'banAfter';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!message) {
        return Promise.resolve({
          result: false,
          value: 'message is undefined',
        });
      }

      return new Promise((resolve) => {
        if (!isMod(message.member)) {
          return resolve({
            result: false,
            value: `you must be a Portal moderator to set attribute ${
              category.join('.') + '.' + attribute
            }`,
          });
        }

        if (isNaN(Number(value))) {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} has to be a number`,
          });
        }

        updateGuild(pGuild.id, attribute, Number(value))
          .then((r) => {
            return resolve({
              result: r,
              value: r
                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``,
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
    auth: AuthType.admin,
  },
  {
    name: 'g.prefix',
    hover: 'Portals prefix',
    get: ({
      pGuild,
    }): string => {
      return pGuild?.prefix ?? './';
    },
    set: ({
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'prefix';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      return new Promise((resolve) => {
        updateGuild(pGuild.id, attribute, String(value))
          .then((r) => {
            return resolve({
              result: r,
              value: r
                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``,
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
    auth: AuthType.admin,
  },
  {
    name: 'g.muteRole',
    hover: 'role given to muted members',
    get: ({
      guild,
      pGuild,
    }): string => {
      if (!guild) {
        return 'N/A';
      }

      const muteRole = guild.roles.cache.find((r) => r.id === pGuild?.muteRole);

      if (muteRole) {
        return muteRole.name;
      }

      return 'N/A';
    },
    set: ({
      pGuild,
      message,
    }): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'muteRole';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!message) {
        return Promise.resolve({
          result: false,
          value: 'message is undefined',
        });
      }

      return new Promise((resolve) => {
        const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
        if (!message.mentions.everyone && mentionRoles.length === 0) {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be a role`,
          });
        }

        const muteRole = message.mentions.roles.first();

        if (muteRole) {
          updateGuild(pGuild.id, attribute, muteRole.id)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${
                    muteRole.name
                  }\``
                  : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${
                    muteRole.name
                  }\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be a role`,
          });
        }
      });
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.rankSpeed',
    hover: 'leveling speed of members',
    get: ({
      pGuild,
    }): string => {
      return RankSpeed[pGuild?.rankSpeed ?? 1];
    },
    set: ({
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'rankSpeed';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      return new Promise((resolve) => {
        const speed = getKeyFromEnum(value, RankSpeed);

        if (speed !== undefined) {
          updateGuild(pGuild.id, attribute, speed)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **${RankSpeedList.join(
              ', '
            )}**`,
          });
        }
      });
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.profanityLevel',
    hover: 'how harsh Portal will be flagging members for use of profanities',
    get: ({
      pGuild,
    }): string => {
      return ProfanityLevel[pGuild?.profanityLevel ?? 1];
    },
    set: ({
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'profanityLevel';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      return new Promise((resolve) => {
        const level = getKeyFromEnum(value, ProfanityLevel);

        if (level !== undefined) {
          updateGuild(pGuild.id, attribute, level)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${
              category.join('.') + '.' + attribute
            } can only be **${ProfanityLevelList.join(', ')}**`,
          });
        }
      });
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.initialRole',
    hover: 'role given to new members',
    get: ({
      pGuild,
      guild
    }): string => {
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
    set: ({
      pGuild,
      message,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'initialRole';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!message) {
        return Promise.resolve({
          result: false,
          value: 'message is undefined',
        });
      }

      return new Promise((resolve) => {
        if (!message.guild) {
          return resolve({
            result: false,
            value: `attribute ${
              category.join('.') + '.' + attribute
            } failed to be set as user guild could not be fetched`,
          });
        }

        const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
        if (!message.mentions || !message.mentions.roles || mentionRoles.length === 0) {
          if (value === 'null') {
            updateGuild(pGuild.id, attribute, 'null')
              .then((r) => {
                return resolve({
                  result: r,
                  value: r
                    ? `attribute ${
                      category.join('.') + '.' + attribute
                    } set successfully to \`${value}\``
                    : `attribute ${
                      category.join('.') + '.' + attribute
                    } failed to be set to \`${value}\``,
                });
              })
              .catch((e) => {
                return resolve({
                  result: false,
                  value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
                });
              });
          } else {
            return resolve({
              result: false,
              value: `attribute ${
                category.join('.') + '.' + attribute
              } failed to be set as no role was given`,
            });
          }
        } else {
          const newRole = message.mentions.roles.first() || message.guild.roles.cache.get(value);

          if (newRole) {
            updateGuild(pGuild.id, attribute, newRole.id)
              .then((r) => {
                return resolve({
                  result: r,
                  value: r
                    ? `attribute ${
                      category.join('.') + '.' + attribute
                    } set successfully to \`${value}\``
                    : `attribute ${
                      category.join('.') + '.' + attribute
                    } failed to be set to \`${value}\``,
                });
              })
              .catch((e) => {
                return resolve({
                  result: false,
                  value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
                });
              });
          } else {
            return resolve({
              result: false,
              value: `attribute ${
                category.join('.') + '.' + attribute
              } failed to be set as role could not be found`,
            });
          }
        }
      });
    },
    auth: AuthType.admin,
  },
  {
    name: 'g.locale',
    hover: 'Portals locale',
    get: ({
      pGuild,
    }): string => {
      return Locale[pGuild?.locale ?? 1];
    },
    set: ({
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['g'];
      const attribute = 'locale';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      return new Promise((resolve) => {
        const locale = getKeyFromEnum(value, Locale);

        if (locale !== undefined) {
          updateGuild(pGuild.id, attribute, locale)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(
              ', '
            )}**`,
          });
        }
      });
    },
    auth: AuthType.admin,
  },
  {
    name: 'p.locale',
    hover: 'portal channels locale',
    get: ({
      pVoiceChannel,
      pChannels,
    }): string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return Locale[pChannel.locale];
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'locale';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        const locale = getKeyFromEnum(value, Locale);

        if (locale !== undefined) {
          updatePortal(pGuild.id, pChannel.id, attribute, locale)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(
              ', '
            )}**`,
          });
        }
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.locale',
    hover: 'voice channels locale',
    get: ({
      pVoiceChannel,
    }): string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return Locale[pVoiceChannel?.locale ?? 1];
    },
    set: ({
      pVoiceChannel,
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'locale';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      if (!pVoiceChannel) {
        return Promise.resolve({
          result: false,
          value: 'pVoiceChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        const locale = getKeyFromEnum(value, Locale);

        if (locale !== undefined) {
          updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, locale)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(
              ', '
            )}**`,
          });
        }
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'v.position',
    hover: 'voice channels position in Discord',
    get: ({
      voiceChannel,
    }): number | string => {
      if (!voiceChannel) {
        return 'N/A';
      }

      return voiceChannel.position;
    },
    set: ({
      voiceChannel,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'position';

      if (!voiceChannel) {
        return Promise.resolve({
          result: false,
          value: 'voiceChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (isNaN(Number(value))) {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **a number**`,
          });
        }

        voiceChannel
          .edit({ position: Number(value) })
          .then((r) => {
            return resolve({
              result: r.position === Number(value),
              value:
                                r.position === Number(value)
                                  ? `attribute ${
                                    category.join('.') + '.' + attribute
                                  } set successfully to \`${value}\``
                                  : `attribute ${
                                    category.join('.') + '.' + attribute
                                  } failed to be set to\`${value}\` to ${value} (is ${r.position})`,
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
    name: 'p.regexOverwrite',
    hover: 'whether voice channels spawned from portal channel will let users use their own regex',
    get: ({
      pVoiceChannel,
      pChannels,
    }): boolean | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.regexOverwrite;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'regexOverwrite';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (value === 'true') {
          updatePortal(pGuild.id, pChannel.id, attribute, true)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else if (value === 'false') {
          updatePortal(pGuild.id, pChannel.id, attribute, false)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`,
          });
        }
      });
    },
    auth: AuthType.voice,
  },
  {
    name: 'p.regex',
    hover: 'portal channels regex',
    get: ({
      pVoiceChannel,
      pChannels,
    }): string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.regexPortal;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'regexPortal';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        updatePortal(pGuild.id, pChannel.id, attribute, value)
          .then((r) => {
            return resolve({
              result: r,
              value: r
                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``,
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
    auth: AuthType.portal,
  },
  {
    name: 'p.v.regex',
    hover: 'voice channels spawned by portal channel regex',
    get: ({
      pVoiceChannel,
      pChannels,
    }): string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }
      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.regexVoice;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p', 'v'];
      const attribute = 'regexVoice';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        updatePortal(pGuild.id, pChannel.id, attribute, value)
          .then((r) => {
            return resolve({
              result: r,
              value: r
                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``,
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
    auth: AuthType.portal,
  },
  {
    name: 'v.regex',
    hover: 'voice channels regex',
    get: ({
      pVoiceChannel,
    }): string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      return pVoiceChannel.regex;
    },
    set: ({
      pVoiceChannel,
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'regex';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      if (!pVoiceChannel) {
        return Promise.resolve({
          result: false,
          value: 'pVoiceChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, value)
          .then((r) => {
            return resolve({
              result: r,
              value: r
                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``,
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
    name: 'm.regex',
    hover: 'members regex',
    get: ({
      pMember,
    }): string => {
      return pMember && pMember.regex ? pMember.regex : 'not-set';
    },
    set: ({
      pGuild,
      pMember,
    },
    value: string
    ): Promise<ReturnPromise> => {
      const category = ['m'];
      const attribute = 'regex';

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      return new Promise((resolve) => {
        if (pMember) {
          updateMember(pGuild.id, pMember.id, attribute, value)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: 'could not find member',
          });
        }
      });
    },
    auth: AuthType.none,
  },
  {
    name: 'p.userLimit',
    hover: 'voice channels spawned by portal channel user limit',
    get: ({
      pVoiceChannel,
      pChannels,
    }): number | string => {
      if (!pVoiceChannel) {
        return 'N/A';
      }

      if (!pChannels) {
        return 'N/A';
      }

      const pChannel = pChannels.find((portal) =>
        portal.pVoiceChannels.some((voice) => voice.id === pVoiceChannel.id)
      );

      if (pChannel) {
        return pChannel.userLimitPortal;
      }

      return 'N/A';
    },
    set: ({
      pChannel,
      pGuild,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['p'];
      const attribute = 'userLimitPortal';
      const newUserLimit = Number(value);

      if (!pGuild) {
        return Promise.resolve({
          result: false,
          value: 'pGuild is undefined',
        });
      }

      if (!pChannel) {
        return Promise.resolve({
          result: false,
          value: 'pChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (isNaN(newUserLimit)) {
          return resolve({
            result: false,
            value: `attribute ${
              category.join('.') + '.' + attribute
            } can only be **a number from 0-99 (0 means unlimited)**`,
          });
        }

        if (newUserLimit >= 0) {
          updatePortal(pGuild.id, pChannel.id, 'userLimitPortal', newUserLimit)
            .then((r) => {
              return resolve({
                result: r,
                value: r
                  ? `attribute ${
                    category.join('.') + '.' + attribute
                  } set successfully to \`${value}\``
                  : `attribute ${
                    category.join('.') + '.' + attribute
                  } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${
              category.join('.') + '.' + attribute
            } can be a number from 0-n (0 means unlimited)`,
          });
        }
      });
    },
    auth: AuthType.portal,
  },
  {
    name: 'v.userLimit',
    hover: 'voice channels user limit',
    get: ({
      voiceChannel
    }
    ): number | string => {
      if (!voiceChannel) {
        return 'N/A';
      }

      return voiceChannel.userLimit;
    },
    set: ({
      voiceChannel,
    },
    value: string,
    ): Promise<ReturnPromise> => {
      const category = ['v'];
      const attribute = 'userLimit';
      const newUserLimit = Number(value);

      if (!voiceChannel) {
        return Promise.resolve({
          result: false,
          value: 'voiceChannel is undefined',
        });
      }

      return new Promise((resolve) => {
        if (newUserLimit >= 0) {
          voiceChannel
            .setUserLimit(newUserLimit)
            .then((r) => {
              return resolve({
                result: r.userLimit === newUserLimit,
                value:
                                    r.userLimit === newUserLimit
                                      ? `attribute ${
                                        category.join('.') + '.' + attribute
                                      } set successfully to \`${value}\``
                                      : `attribute ${
                                        category.join('.') + '.' + attribute
                                      } failed to be set to \`${value}\``,
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`,
              });
            });
        } else {
          return resolve({
            result: false,
            value: `attribute ${
              category.join('.') + '.' + attribute
            } can only be **a number from 0-n (0 means unlimited)**`,
          });
        }
      });
    },
    auth: AuthType.voice,
  },
];
