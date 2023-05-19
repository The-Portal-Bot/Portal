import { BaseGuildTextChannel, EmbedBuilder, Guild, GuildMember, Message, OverwriteResolvable, OverwriteType, VoiceChannel } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { LocaleEnum, LocaleList } from '../../data/enums/Locales.enum';
import { ProfanityLevelEnum, ProfanityLevelList } from '../../data/enums/ProfanityLevel.enum';
import { RankSpeedEnum, RankSpeedList } from '../../data/enums/RankSpeed.enum';
import { createEmbed, getKeyFromEnum, isUserAuthorised, isMod } from '../../libraries/help.library';
import { updateGuild, updateMember, updatePortal, updateVoice } from '../../libraries/mongo.library';
import { PGuild } from '../classes/PGuild.class';
import { PMember } from '../classes/PMember.class';
import { PChannel } from '../classes/PPortalChannel.class';
import { Field, InterfaceBlueprint, ReturnPromise } from '../classes/PTypes.interface';
import { PVoiceChannel } from '../classes/PVoiceChannel.class';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';
export const ATTRIBUTE_PREFIX = '&';

const attributes: InterfaceBlueprint[] = [
    {
        name: 'p.annAnnounce',
        hover: 'if voice channels spawned by portal channel will make announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.annAnnounce;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'annAnnounce';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updatePortal(pGuild.id, pChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updatePortal(pGuild.id, pChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.annAnnounce',
        hover: 'if voice channel will make announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            return pVoiceChannel.annAnnounce;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'annAnnounce';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.noBots',
        hover: 'if bots can join voice channels spawned by portal channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.noBots;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'noBots';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updatePortal(pGuild.id, pChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updatePortal(pGuild.id, pChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.noBots',
        hover: 'if bots can join voice channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            return pVoiceChannel.noBots;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'noBots';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.allowedRoles',
        hover: 'the role allowed to create a voice channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt
        ): string[] | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!voiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal => portal.pVoiceChannels.some(voice => voice.id === pVoiceChannel.id)
            );

            if (pChannel) {
                const channel = voiceChannel.guild.channels.cache
                    .find(c => c.id === pChannel.id) as BaseGuildTextChannel;

                if (channel && channel.permissionOverwrites.cache.size > 0) {
                    return `${channel.permissionOverwrites.cache
                        .filter(p => p.type === OverwriteType.Role)
                        .filter(p => p.allow.bitfield === BigInt(1048576))
                        .map(p => {
                            const role = voiceChannel.guild.roles.cache
                                .find(r => r.id === p.id);

                            if (role) {
                                return `${role.name}`;
                            } else {
                                return 'N/A';
                            }
                        })
                        .join(', ')}`
                }
            }

            return '@everyone';
        },
        set: async (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'allowedRoles';

            if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions.everyone && mentionRoles.length === 0) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
                    });
                }

                const channel = voiceChannel.guild.channels.cache
                    .find(c => c.id === pChannel.id) as BaseGuildTextChannel;

                if (!channel) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
                    });
                }

                const permittedIds = [];
                const disallowedIds = [];

                if (!message.mentions.everyone) {
                    message.mentions.roles.map(role => permittedIds.push(role.id));
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
                    await channel.permissionOverwrites.edit(permittedId, { Connect: true })
                        .catch(e => {
                            return Promise.resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }

                for (const disallowedId of disallowedIds) {
                    await channel.permissionOverwrites.edit(disallowedId, { Connect: true })
                        .catch(e => {
                            return Promise.resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }

                const roles = message.mentions.everyone
                    ? '@everyone'
                    : message.mentions.roles
                        .map(r => `@${r.name}`)
                        .join(', ');

                return Promise.resolve({
                    result: true,
                    value: `attribute ${category.join('.') + '.' + attribute} set successfully to \`${roles}\``
                });
            }

            return Promise.resolve({
                result: true,
                value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'p.v.allowedRoles',
        hover: 'the role given to the spawned voice channels',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt
        ): string[] | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!voiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel && pChannel.allowedRoles) {
                const allowedRoles = voiceChannel.guild.roles.cache
                    .filter(r => {
                        if (pChannel.allowedRoles) {
                            return pChannel.allowedRoles
                                .some(id => id === r.id);
                        } else {
                            return false;
                        }
                    });

                if (allowedRoles) {
                    return `${allowedRoles.map(r => r.name).join(', ')}`;
                } else {
                    return 'N/A';
                }
            }

            return '@everyone';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const category = ['p', 'v'];
            const attribute = 'allowedRoles';

            return new Promise((resolve) => {
                if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
                    const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                    if (!message.mentions.everyone && mentionRoles.length === 0) {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
                        });
                    }

                    const allowedRoles = message.mentions.everyone
                        ? message.guild?.roles.everyone.id
                        : message.mentions.roles.map(r => r.id);

                    if (allowedRoles) {
                        updatePortal(pGuild.id, pChannel.id, attribute, allowedRoles)
                            .then(r => {
                                const roles = message.mentions.everyone
                                    ? '@everyone'
                                    : message.mentions.roles
                                        .map(r => `@${r.name}`)
                                        .join(', ');

                                return resolve({
                                    result: r,
                                    value: r
                                        ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${roles}\``
                                        : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${roles}\``
                                });
                            })
                            .catch(e => {
                                return resolve({
                                    result: false,
                                    value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                                });
                            });
                    } else {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
                        });
                    }
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.allowedRoles',
        hover: 'the role allowed join the voice channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): string[] | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!voiceChannel) {
                return 'N/A';
            }

            if (voiceChannel.permissionOverwrites.cache.size > 0) {
                return `${voiceChannel.permissionOverwrites.cache
                    .filter(p => p.type === OverwriteType.Role)
                    .filter(p => p.allow.bitfield === BigInt(1048576))
                    .map(p => {
                        const role = voiceChannel.guild.roles.cache
                            .find(r => r.id === p.id);

                        if (role) {
                            return `${role.name}`;
                        } else {
                            return 'N/A';
                        }
                    })
                    .join(', ')}`
            }

            return '@everyone';
        },
        set: async (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'allowedRoles';

            if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions.everyone && mentionRoles.length === 0) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
                    });
                }

                if (!voiceChannel) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
                    });
                }

                const permittedIds = [];
                const disallowedIds = [];

                if (!message.mentions.everyone) {
                    message.mentions.roles.map(role => permittedIds.push(role.id));
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
                    await voiceChannel.permissionOverwrites.edit(permittedId, { Connect: true })
                        .catch(e => {
                            return Promise.resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }

                for (const disallowedId of disallowedIds) {
                    await voiceChannel.permissionOverwrites.edit(disallowedId, { Connect: true })
                        .catch(e => {
                            return Promise.resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }

                const roles = message.mentions.everyone
                    ? '@everyone'
                    : message.mentions.roles
                        .map(r => `@${r.name}`)
                        .join(', ');

                return Promise.resolve({
                    result: true,
                    value: `attribute ${category.join('.') + '.' + attribute} set successfully to \`${roles}\``
                });
            }

            return Promise.resolve({
                result: false,
                value: `attribute ${category.join('.') + '.' + attribute} can only be one or more roles`
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.render',
        hover: 'if voice channels spawned by portal channel will use the text interpreter',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.render;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'render';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updatePortal(pGuild.id, pChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updatePortal(pGuild.id, pChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.render',
        hover: 'if voice channel will use the text interpreter',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            return pVoiceChannel.render;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string// , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'render';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.annUser',
        hover: 'if voice channels spawned by portal channel will make join/leave announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.annUser;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'annUser';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updatePortal(pGuild.id, pChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updatePortal(pGuild.id, pChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.annUser',
        hover: 'if voice channel will make join/leave announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            return pVoiceChannel.annUser;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'annUser';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'v.bitrate',
        hover: 'voice channels bitrate',
        get: (
            voiceChannel: VoiceChannel
        ): number => {
            return voiceChannel.bitrate;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string //, pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'bitrate';
            const newBitrate = Number(value);

            return new Promise((resolve) => {
                if (isNaN(newBitrate)) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **a number**`
                    });
                }

                if (newBitrate < 8000) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} must be greater or equal to 8000`
                    });
                }

                voiceChannel
                    .edit({ bitrate: newBitrate })
                    .then(r => {
                        return resolve({
                            result: r.bitrate === newBitrate,
                            value: r.bitrate === newBitrate
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to\`${value}\` to ${value} (is ${r.bitrate})`
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'g.kickAfter',
        hover: 'Portals kickAfter',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild // , guild: Guild
        ): number => {
            return pGuild.kickAfter;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: GuildMember, message: Message
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'kickAfter';

            return new Promise((resolve) => {
                if (!isMod(message.member)) {
                    return resolve({
                        result: false,
                        value: `you must be a Portal moderator to set attribute ${category.join('.') + '.' + attribute}`
                    });
                }

                if (isNaN(Number(value))) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} has to be a number`
                    });
                }

                updateGuild(pGuild.id, attribute, Number(value))
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.admin
    }, {
        name: 'g.banAfter',
        hover: 'Portals banAfter',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild // , guild: Guild
        ): number => {
            return pGuild.banAfter;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'banAfter';

            return new Promise((resolve) => {
                if (!isMod(message.member)) {
                    return resolve({
                        result: false,
                        value: `you must be a Portal moderator to set attribute ${category.join('.') + '.' + attribute}`
                    });
                }

                if (isNaN(Number(value))) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} has to be a number`
                    });
                }

                updateGuild(pGuild.id, attribute, Number(value))
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.admin
    },



    {
        name: 'g.prefix',
        hover: 'Portals prefix',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild // , guild: Guild
        ): string => {
            return pGuild.prefix;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'prefix';

            return new Promise((resolve) => {
                updateGuild(pGuild.id, attribute, String(value))
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.muteRole',
        hover: 'role given to muted members',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild, guild: Guild
        ): string => {
            if (!guild) {
                return 'N/A';
            }

            const muteRole = guild.roles.cache
                .find(r => r.id === pGuild.muteRole);

            if (muteRole) {
                return muteRole.name;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'muteRole';

            return new Promise((resolve) => {
                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions.everyone && mentionRoles.length === 0) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be a role`
                    });
                }

                const muteRole = message.mentions.roles.first();

                if (muteRole) {
                    updateGuild(pGuild.id, attribute, muteRole.id)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${muteRole.name}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${muteRole.name}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be a role`
                    });
                }
            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.rankSpeed',
        hover: 'leveling speed of members',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild // , guild: Guild
        ): string => {
            return RankSpeedEnum[pGuild.rankSpeed];
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'rankSpeed';

            return new Promise((resolve) => {
                const speed = getKeyFromEnum(value, RankSpeedEnum);

                if (speed !== undefined) {
                    updateGuild(pGuild.id, attribute, speed)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **${RankSpeedList.join(', ')}**`
                    });
                }

            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.profanityLevel',
        hover: 'how harsh Portal will be flagging members for use of profanities',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild // , guild: Guild
        ): string => {
            return ProfanityLevelEnum[pGuild.profanityLevel];
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'profanityLevel';

            return new Promise((resolve) => {
                const level = getKeyFromEnum(value, ProfanityLevelEnum);

                if (level !== undefined) {
                    updateGuild(pGuild.id, attribute, level)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **${ProfanityLevelList.join(', ')}**`
                    });
                }

            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.initialRole',
        hover: 'role given to new members',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild, guild: Guild
        ): string => {
            if (!pGuild.initialRole || pGuild.initialRole === 'null') {
                return 'initial role has not been set yet 1';
            }

            const role = guild.roles.cache
                .find(r => r.id === pGuild.initialRole);

            if (role) {
                return `@${role.name}`;
            } else {
                return 'initial role has not been set yet 2';
            }
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'initialRole';

            return new Promise((resolve) => {
                if (!message.guild) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} failed to be set as user guild could not be fetched`
                    });
                }

                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions || !message.mentions.roles || mentionRoles.length === 0) {
                    if (value === 'null') {
                        updateGuild(pGuild.id, attribute, 'null')
                            .then(r => {
                                return resolve({
                                    result: r,
                                    value: r
                                        ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                        : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                                });
                            })
                            .catch(e => {
                                return resolve({
                                    result: false,
                                    value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                                });
                            });
                    } else {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set as no role was given`
                        });
                    }
                } else {
                    const newRole = message.mentions.roles.first() || message.guild.roles.cache.get(value);

                    if (newRole) {
                        updateGuild(pGuild.id, attribute, newRole.id)
                            .then(r => {
                                return resolve({
                                    result: r,
                                    value: r
                                        ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                        : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                                });
                            })
                            .catch(e => {
                                return resolve({
                                    result: false,
                                    value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                                });
                            });
                    } else {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set as role could not be found`
                        });
                    }
                }
            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.locale',
        hover: 'Portals locale',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild // , guild: Guild
        ): string => {
            return LocaleEnum[pGuild.locale];
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['g'];
            const attribute = 'locale';

            return new Promise((resolve) => {
                const locale = getKeyFromEnum(value, LocaleEnum);

                if (locale !== undefined) {
                    updateGuild(pGuild.id, attribute, locale)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(', ')}**`
                    });
                }
            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'p.locale',
        hover: 'portal channels locale',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return LocaleEnum[pChannel.locale];
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'locale';

            return new Promise((resolve) => {
                const locale = getKeyFromEnum(value, LocaleEnum);

                if (locale !== undefined) {
                    updatePortal(pGuild.id, pChannel.id, attribute, locale)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(', ')}**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.locale',
        hover: 'voice channels locale',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            return LocaleEnum[pVoiceChannel.locale];
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'locale';

            return new Promise((resolve) => {
                const locale = getKeyFromEnum(value, LocaleEnum);

                if (locale !== undefined) {
                    updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, locale)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **${LocaleList.join(', ')}**`
                    });
                }

            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'v.position',
        hover: 'voice channels position in Discord',
        get: (
            voiceChannel: VoiceChannel | undefined | null // , pVoiceChannel: VoiceChannelPrtl | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): number | string => {
            if (!voiceChannel) {
                return 'N/A';
            }

            return voiceChannel.position;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'position';

            return new Promise((resolve) => {
                if (isNaN(Number(value))) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **a number**`
                    });
                }

                voiceChannel
                    .edit({ position: Number(value) })
                    .then(r => {
                        return resolve({
                            result: r.position === Number(value),
                            value: r.position === Number(value)
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to\`${value}\` to ${value} (is ${r.position})`
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.regexOverwrite',
        hover: 'whether voice channels spawned from portal channel will let users use their own regex',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): boolean | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.regexOverwrite;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'regexOverwrite';

            return new Promise((resolve) => {
                if (value === 'true') {
                    updatePortal(pGuild.id, pChannel.id, attribute, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    updatePortal(pGuild.id, pChannel.id, attribute, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.regex',
        hover: 'portal channels regex',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.regexPortal;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'regexPortal';

            return new Promise((resolve) => {
                updatePortal(pGuild.id, pChannel.id, attribute, value)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'p.v.regex',
        hover: 'voice channels spawned by portal channel regex',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }
            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.regexVoice;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['p', 'v'];
            const attribute = 'regexVoice';

            return new Promise((resolve) => {
                updatePortal(pGuild.id, pChannel.id, attribute, value)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.regex',
        hover: 'voice channels regex',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            return pVoiceChannel.regex;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string // , pMember: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'regex';

            return new Promise((resolve) => {
                updateVoice(pGuild.id, pChannel.id, pVoiceChannel.id, attribute, value)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'm.regex',
        hover: 'members regex',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null, pGuild: PGuild, guild: Guild,
            pMember: PMember | undefined
        ): string => {
            return (pMember && pMember.regex)
                ? pMember.regex
                : 'not-set';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel, pChannel: PChannel,
            pGuild: PGuild, value: string, pMember: PMember | undefined
        ): Promise<ReturnPromise> => {
            const category = ['m'];
            const attribute = 'regex';

            return new Promise((resolve) => {
                if (pMember) {
                    updateMember(pGuild.id, pMember.id, attribute, value)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `could not find member`
                    });
                }
            });
        },
        auth: AuthEnum.none
    },
    {
        name: 'p.userLimit',
        hover: 'voice channels spawned by portal channel user limit',
        get: (
            voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
            pChannels: PChannel[] | undefined | null // , pGuild: PGuilt, guild: Guild
        ): number | string => {
            if (!pVoiceChannel) {
                return 'N/A';
            }

            if (!pChannels) {
                return 'N/A';
            }

            const pChannel = pChannels.find(portal =>
                portal.pVoiceChannels.some(voice =>
                    voice.id === pVoiceChannel.id
                )
            );

            if (pChannel) {
                return pChannel.userLimitPortal;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel,
            pChannel: PChannel, pGuild: PGuild, value: number
        ): Promise<ReturnPromise> => {
            const category = ['p'];
            const attribute = 'userLimitPortal';
            const newUserLimit = Number(value);

            return new Promise((resolve) => {
                if (isNaN(newUserLimit)) {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **a number from 0-99 (0 means unlimited)**`
                    });
                }

                if (value >= 0) {
                    updatePortal(pGuild.id, pChannel.id, 'userLimitPortal', newUserLimit)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can be a number from 0-n (0 means unlimited)`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.userLimit',
        hover: 'voice channels user limit',
        get: (
            voiceChannel: VoiceChannel | undefined | null // , pVoiceChannel: VoiceChannelPrtl | undefined | null,
            // pChannels: PortalChannelPrtl[] | undefined | null, pGuild: PGuilt, guild: Guild
        ): number | string => {
            if (!voiceChannel) {
                return 'N/A';
            }

            return voiceChannel.userLimit;
        },
        set: (
            voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel,
            pChannel: PChannel, pGuild: PGuild, value: number
        ): Promise<ReturnPromise> => {
            const category = ['v'];
            const attribute = 'userLimit';
            const newUserLimit = Number(value);

            return new Promise((resolve) => {
                if (newUserLimit >= 0) {
                    voiceChannel.setUserLimit(newUserLimit)
                        .then(r => {
                            return resolve({
                                result: r.userLimit === newUserLimit,
                                value: r.userLimit === newUserLimit
                                    ? `attribute ${category.join('.') + '.' + attribute} set successfully to \`${value}\``
                                    : `attribute ${category.join('.') + '.' + attribute} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${category.join('.') + '.' + attribute} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${category.join('.') + '.' + attribute} can only be **a number from 0-n (0 means unlimited)**`
                    });
                }
            });
        },
        auth: AuthEnum.voice,
    }
];

export function isAttribute(candidate: string): string {
    for (let i = 0; i < attributes.length; i++) {
        const subStr = String(candidate)
            .substring(1, (String(attributes[i].name).length + 1));

        if (subStr == attributes[i].name) {
            return attributes[i].name;
        }
    }

    return '';
}

export function getAttributeGuide(): EmbedBuilder {
    const attrArray: Field[] = [
        {
            emote: 'Used in Regex Interpreter',
            role: '*used by channel name (regex, regexVoice, regexPortal) and run command*',
            inline: true
        },
        {
            emote: 'attributes are mutable data options',
            role: '*options correspond to server, portal or voice channels*',
            inline: true
        },
        {
            emote: '1.\tIn any text channel execute command `./run`',
            role: './run just like channel name generation uses the text interpreter',
            inline: false
        },
        {
            emote: '2.\t`./run My set locale is = &g.locale`',
            role: './run executes the given text and replies with the processed output',
            inline: false
        },
        {
            emote: '3.\tAwait a reply from portal which will be gr, de or en',
            role: '*The replied string will look like this: `My set locale is = gr`*',
            inline: false
        },
        {
            emote: '4.\t`./set g.locale de` (no prefix & needed)',
            role: '*set command, updates the data of an attribute in this case **locale** to **de***',
            inline: false
        },
        {
            emote: '5.\tWait for portal response which will be inform you if it was executed without issues',
            role: '*portal will either confirm update or inform you of the error it faced*',
            inline: false
        }
    ];

    return createEmbed(
        'Attribute Guide',
        '[Attributes](' + PORTAL_URL + INTERPRETER_URL + '/attributes/description) ' +
        'are options that can be manipulated by whomever has clearance.\n' +
        'How to use attributes with the Text Interpreter',
        '#FF5714',
        attrArray,
        null,
        null,
        null,
        null,
        null
    );
}

function getLink(attribute: string): string {
    const url = PORTAL_URL + INTERPRETER_URL + '/attributes';

    if (attribute.indexOf('g.') > -1) {
        return `${url}/detailed/global/${attribute}`
    } else if (attribute.indexOf('m.') > -1) {
        return `${url}/detailed/member/${attribute}`
    } else if (attribute.indexOf('p.') > -1) {
        return `${url}/detailed/portal/${attribute}`
    } else if (attribute.indexOf('v.') > -1) {
        return `${url}/detailed/voice/${attribute}`
    } else {
        return `${url}/description`
    }
}

export function getAttributeHelp(): EmbedBuilder[] {
    const attrArray: Field[][] = [];

    for (let l = 0; l <= attributes.length / 25; l++) {
        attrArray[l] = []
        for (let i = (24 * l); i < attributes.length && i < 24 * (l + 1); i++) {
            attrArray[l]
                .push({
                    emote: `${i + 1}. ${attributes[i].name}`,
                    role: `[hover or click](${getLink(attributes[i].name)} "${attributes[i].hover}")`,
                    inline: true
                });
        }
    }

    return attrArray
        .map((command, index) => {
            if (index === 0) {
                return createEmbed(
                    'Attributes',
                    '[Attributes](' + PORTAL_URL + INTERPRETER_URL + '/attributes/description) ' +
                    'are options that can be manipulated by whomever has clearance.\n' +
                    'Prefix: ' + ATTRIBUTE_PREFIX,
                    '#FF5714',
                    attrArray[0],
                    null,
                    null,
                    null,
                    null,
                    null
                )
            } else {
                return createEmbed(
                    null,
                    null,
                    '#FF5714',
                    attrArray[index],
                    null,
                    null,
                    null,
                    null,
                    null
                )
            }
        });
}

export function getAttributeHelpSuper(
    candidate: string
): EmbedBuilder | boolean {
    for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].name === candidate) {
            return createEmbed(
                attributes[i].name,
                null,
                '#FF5714',
                [
                    { emote: `Type`, role: `Attribute`, inline: true },
                    { emote: `Prefix`, role: `${ATTRIBUTE_PREFIX}`, inline: true },
                    { emote: `Description`, role: `[hover or click](${getLink(candidate)} "${attributes[i].hover}")`, inline: true }
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

export function getAttribute(
    voiceChannel: VoiceChannel | undefined | null, pVoiceChannel: PVoiceChannel | undefined | null,
    pChannels: PChannel[] | undefined | null, pGuild: PGuild,
    guild: Guild, attribute: string
): string | number | boolean {

    for (let l = 0; l < attributes.length; l++) {
        if (attribute === attributes[l].name) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return attributes[l]
                .get(voiceChannel, pVoiceChannel, pChannels, pGuild, guild);
        }
    }

    return -1;
}

export function setAttribute(
    voiceChannel: VoiceChannel | undefined | null, pGuild: PGuild,
    candidate: string, value: string, member: GuildMember, message: Message
): Promise<ReturnPromise> {
    return new Promise((resolve) => {
        let pVoiceChannel: PVoiceChannel | undefined = undefined;
        let pChannel: PChannel | undefined = undefined;

        for (let l = 0; l < attributes.length; l++) {
            if (candidate === attributes[l].name) {
                switch (attributes[l].auth) {
                    case AuthEnum.admin:
                        if (!isUserAuthorised(member)) {
                            return resolve({
                                result: false,
                                value: `attribute ${candidate} can only be **set by an administrator**`
                            });
                        }

                        break;
                    case AuthEnum.none:
                        // passes through no checks needed
                        break;
                    default:
                        if (!voiceChannel) {
                            return resolve({
                                result: false,
                                value: 'you must be in a channel handled by Portal'
                            });
                        }

                        for (let i = 0; i < pGuild.pChannels.length; i++) {
                            for (let j = 0; j < pGuild.pChannels[i].pVoiceChannels.length; j++) {
                                if (pGuild.pChannels[i].pVoiceChannels[j].id === voiceChannel.id) {
                                    pChannel = pGuild.pChannels[i];
                                    pVoiceChannel = pGuild.pChannels[i].pVoiceChannels[j];

                                    break;
                                }
                            }
                        }

                        if (!pChannel || !pVoiceChannel) {
                            return resolve({
                                result: false,
                                value: 'you must be in a channel handled by Portal'
                            });
                        }

                        if (attributes[l].auth === AuthEnum.portal) {
                            if (pChannel.creatorId !== member.id) {
                                return resolve({
                                    result: false,
                                    value: `attribute ${candidate} can only be **set by the portal creator**`
                                });
                            }
                        } else if (attributes[l].auth === AuthEnum.voice) {
                            if (pVoiceChannel.creatorId !== member.id) {
                                return resolve({
                                    result: false,
                                    value: `attribute ${candidate} can only be **set by the voice creator**`
                                });
                            }
                        }

                        break;
                }

                const pMember = pGuild.pMembers.find(m => m.id === member.id);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                attributes[l]
                    .set(voiceChannel, pVoiceChannel, pChannel, pGuild, value, pMember, message)
                    .then((r: ReturnPromise) => {
                        return resolve(r);
                    })
                    .catch((e: any) => {
                        return resolve({
                            result: false,
                            value: `attribute ${candidate} failed to be set: ${e}`
                        });
                    });

                break;
            } else if (l + 1 === attributes.length) {
                return resolve({
                    result: false,
                    value: `${candidate} is not an attribute`
                });
            }
        }
    });
}