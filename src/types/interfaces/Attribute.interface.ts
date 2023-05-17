import { BaseGuildTextChannel, EmbedBuilder, Guild, GuildMember, Message, OverwriteResolvable, OverwriteType, VoiceChannel } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { LocaleEnum, LocaleList } from '../../data/enums/Locales.enum';
import { ProfanityLevelEnum, ProfanityLevelList } from '../../data/enums/ProfanityLevel.enum';
import { RankSpeedEnum, RankSpeedList } from '../../data/enums/RankSpeed.enum';
import { createEmbed, getKeyFromEnum, isUserAuthorised, isMod } from '../../libraries/help.library';
import { updateGuild, updateMember, update_portal, update_voice } from '../../libraries/mongo.library';
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
        name: 'p.ann_announce',
        hover: 'if voice channels spawned by portal channel will make announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }

            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.ann_announce;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'ann_announce';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_portal(guildObject.id, portal_object.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_portal(guildObject.id, portal_object.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.ann_announce',
        hover: 'if voice channel will make announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }

            return voiceObject.ann_announce;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'ann_announce';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.no_bots',
        hover: 'if bots can join voice channels spawned by portal channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.no_bots;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'no_bots';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_portal(guildObject.id, portal_object.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_portal(guildObject.id, portal_object.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.no_bots',
        hover: 'if bots can join voice channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }

            return voiceObject.no_bots;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'no_bots';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.allowed_roles',
        hover: 'the role allowed to create a voice channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt
        ): string[] | string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!voiceChannel) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal => portal.voice_list.some(voice => voice.id === voiceObject.id)
            );

            if (portal_object) {
                const portal_channel = voiceChannel.guild.channels.cache
                    .find(c => c.id === portal_object.id) as BaseGuildTextChannel;

                if (portal_channel && portal_channel.permissionOverwrites.cache.size > 0) {
                    return `${portal_channel.permissionOverwrites.cache
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
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portalObject: PChannel,
            guildObject: PGuild, value: string, memberObject: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'allowed_roles';

            if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions.everyone && mentionRoles.length === 0) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
                    });
                }

                const portal_channel = voiceChannel.guild.channels.cache
                    .find(c => c.id === portalObject.id) as BaseGuildTextChannel;

                if (!portal_channel) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
                    });
                }

                const permittedIds = [];
                const disallowedIds = [];

                if (!message.mentions.everyone) {
                    message.mentions.roles.map(role => permittedIds.push(role.id));
                    if (message.guild) {
                        permittedIds.push(portalObject.creator_id);
                        disallowedIds.push(message.guild.roles.everyone.id);
                    }
                } else {
                    if (message && message.guild) {
                        permittedIds.push(message.guild.roles.everyone.id);
                    }
                }

                for (const permittedId of permittedIds) {
                    await portal_channel.permissionOverwrites.edit(permittedId, { Connect: true })
                        .catch(e => {
                            return Promise.resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }

                for (const disallowedId of disallowedIds) {
                    await portal_channel.permissionOverwrites.edit(disallowedId, { Connect: true })
                        .catch(e => {
                            return Promise.resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
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
                    value: `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${roles}\``
                });
            }

            return Promise.resolve({
                result: true,
                value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'p.v.allowed_roles',
        hover: 'the role given to the spawned voice channels',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt
        ): string[] | string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!voiceChannel) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object && portal_object.allowed_roles) {
                const allowed_roles = voiceChannel.guild.roles.cache
                    .filter(r => {
                        if (portal_object.allowed_roles) {
                            return portal_object.allowed_roles
                                .some(id => id === r.id);
                        } else {
                            return false;
                        }
                    });

                if (allowed_roles) {
                    return `${allowed_roles.map(r => r.name).join(', ')}`;
                } else {
                    return 'N/A';
                }
            }

            return '@everyone';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string, member_object: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const ctgr = ['p', 'v'];
            const attr = 'allowed_roles';

            return new Promise((resolve) => {
                if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
                    const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                    if (!message.mentions.everyone && mentionRoles.length === 0) {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
                        });
                    }

                    const allowed_roles = message.mentions.everyone
                        ? message.guild?.roles.everyone.id
                        : message.mentions.roles.map(r => r.id);

                    if (allowed_roles) {
                        update_portal(guildObject.id, portal_object.id, attr, allowed_roles)
                            .then(r => {
                                const roles = message.mentions.everyone
                                    ? '@everyone'
                                    : message.mentions.roles
                                        .map(r => `@${r.name}`)
                                        .join(', ');

                                return resolve({
                                    result: r,
                                    value: r
                                        ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${roles}\``
                                        : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${roles}\``
                                });
                            })
                            .catch(e => {
                                return resolve({
                                    result: false,
                                    value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                                });
                            });
                    } else {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
                        });
                    }
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.allowed_roles',
        hover: 'the role allowed join the voice channel',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): string[] | string => {
            if (!voiceObject) {
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
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string, member_object: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'allowed_roles';

            if (message.mentions.everyone || (message.mentions && message.mentions.roles)) {
                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions.everyone && mentionRoles.length === 0) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
                    });
                }

                if (!voiceChannel) {
                    return Promise.resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
                    });
                }

                const permittedIds = [];
                const disallowedIds = [];

                if (!message.mentions.everyone) {
                    message.mentions.roles.map(role => permittedIds.push(role.id));
                    if (message.guild) {
                        permittedIds.push(portal_object.creator_id);
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
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }

                for (const disallowedId of disallowedIds) {
                    await voiceChannel.permissionOverwrites.edit(disallowedId, { Connect: true })
                        .catch(e => {
                            return Promise.resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
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
                    value: `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${roles}\``
                });
            }

            return Promise.resolve({
                result: false,
                value: `attribute ${ctgr.join('.') + '.' + attr} can only be one or more roles`
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.render',
        hover: 'if voice channels spawned by portal channel will use the text interpreter',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.render;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'render';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_portal(guildObject.id, portal_object.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_portal(guildObject.id, portal_object.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }

            return voiceObject.render;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string// , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'render';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.ann_user',
        hover: 'if voice channels spawned by portal channel will make join/leave announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.ann_user;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'ann_user';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_portal(guildObject.id, portal_object.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_portal(guildObject.id, portal_object.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.ann_user',
        hover: 'if voice channel will make join/leave announcements',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }

            return voiceObject.ann_user;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'ann_user';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
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
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string //, member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'bitrate';
            const new_bitrate = Number(value);

            return new Promise((resolve) => {
                if (isNaN(new_bitrate)) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number**`
                    });
                }

                if (new_bitrate < 8000) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} must be greater or equal to 8000`
                    });
                }

                voiceChannel
                    .edit({ bitrate: new_bitrate })
                    .then(r => {
                        return resolve({
                            result: r.bitrate === new_bitrate,
                            value: r.bitrate === new_bitrate
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to\`${value}\` to ${value} (is ${r.bitrate})`
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'g.kick_after',
        hover: 'Portals kick_after',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild // , guild: Guild
        ): number => {
            return guildObject.kick_after;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string, member_object: GuildMember, message: Message
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'kick_after';

            return new Promise((resolve) => {
                if (!isMod(message.member)) {
                    return resolve({
                        result: false,
                        value: `you must be a Portal moderator to set attribute ${ctgr.join('.') + '.' + attr}`
                    });
                }

                if (isNaN(Number(value))) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} has to be a number`
                    });
                }

                updateGuild(guildObject.id, attr, Number(value))
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.admin
    }, {
        name: 'g.ban_after',
        hover: 'Portals ban_after',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild // , guild: Guild
        ): number => {
            return guildObject.ban_after;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string, member_object: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'ban_after';

            return new Promise((resolve) => {
                if (!isMod(message.member)) {
                    return resolve({
                        result: false,
                        value: `you must be a Portal moderator to set attribute ${ctgr.join('.') + '.' + attr}`
                    });
                }

                if (isNaN(Number(value))) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} has to be a number`
                    });
                }

                updateGuild(guildObject.id, attr, Number(value))
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild // , guild: Guild
        ): string => {
            return guildObject.prefix;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'prefix';

            return new Promise((resolve) => {
                updateGuild(guildObject.id, attr, String(value))
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.mute_role',
        hover: 'role given to muted members',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild, guild: Guild
        ): string => {
            if (!guild) {
                return 'N/A';
            }

            const mute_role = guild.roles.cache
                .find(r => r.id === guildObject.mute_role);

            if (mute_role) {
                return mute_role.name;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string, member_object: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'mute_role';

            return new Promise((resolve) => {
                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions.everyone && mentionRoles.length === 0) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be a role`
                    });
                }

                const mute_role = message.mentions.roles.first();

                if (mute_role) {
                    updateGuild(guildObject.id, attr, mute_role.id)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${mute_role.name}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${mute_role.name}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be a role`
                    });
                }
            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.rank_speed',
        hover: 'leveling speed of members',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild // , guild: Guild
        ): string => {
            return RankSpeedEnum[guildObject.rank_speed];
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'rank_speed';

            return new Promise((resolve) => {
                const speed = getKeyFromEnum(value, RankSpeedEnum);

                if (speed !== undefined) {
                    updateGuild(guildObject.id, attr, speed)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${RankSpeedList.join(', ')}**`
                    });
                }

            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.profanity_level',
        hover: 'how harsh Portal will be flagging members for use of profanities',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild // , guild: Guild
        ): string => {
            return ProfanityLevelEnum[guildObject.profanity_level];
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'profanity_level';

            return new Promise((resolve) => {
                const level = getKeyFromEnum(value, ProfanityLevelEnum);

                if (level !== undefined) {
                    updateGuild(guildObject.id, attr, level)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${ProfanityLevelList.join(', ')}**`
                    });
                }

            });
        },
        auth: AuthEnum.admin
    },
    {
        name: 'g.initial_role',
        hover: 'role given to new members',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild, guild: Guild
        ): string => {
            if (!guildObject.initial_role || guildObject.initial_role === 'null') {
                return 'initial role has not been set yet 1';
            }

            const role = guild.roles.cache
                .find(r => r.id === guildObject.initial_role);

            if (role) {
                return `@${role.name}`;
            } else {
                return 'initial role has not been set yet 2';
            }
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string, member_object: PMember | undefined, message: Message
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'initial_role';

            return new Promise((resolve) => {
                if (!message.guild) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set as user guild could not be fetched`
                    });
                }

                const mentionRoles = Array.prototype.slice.call(message.mentions.roles, 0);
                if (!message.mentions || !message.mentions.roles || mentionRoles.length === 0) {
                    if (value === 'null') {
                        updateGuild(guildObject.id, attr, 'null')
                            .then(r => {
                                return resolve({
                                    result: r,
                                    value: r
                                        ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                        : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                                });
                            })
                            .catch(e => {
                                return resolve({
                                    result: false,
                                    value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                                });
                            });
                    } else {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set as no role was given`
                        });
                    }
                } else {
                    const new_role = message.mentions.roles.first() || message.guild.roles.cache.get(value);

                    if (new_role) {
                        updateGuild(guildObject.id, attr, new_role.id)
                            .then(r => {
                                return resolve({
                                    result: r,
                                    value: r
                                        ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                        : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                                });
                            })
                            .catch(e => {
                                return resolve({
                                    result: false,
                                    value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                                });
                            });
                    } else {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set as role could not be found`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild // , guild: Guild
        ): string => {
            return LocaleEnum[guildObject.locale];
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['g'];
            const attr = 'locale';

            return new Promise((resolve) => {
                const locale = getKeyFromEnum(value, LocaleEnum);

                if (locale !== undefined) {
                    updateGuild(guildObject.id, attr, locale)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${LocaleList.join(', ')}**`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return LocaleEnum[portal_object.locale];
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'locale';

            return new Promise((resolve) => {
                const locale = getKeyFromEnum(value, LocaleEnum);

                if (locale !== undefined) {
                    update_portal(guildObject.id, portal_object.id, attr, locale)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${LocaleList.join(', ')}**`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): string => {
            if (!voiceObject) {
                return 'N/A';
            }

            return LocaleEnum[voiceObject.locale];
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'locale';

            return new Promise((resolve) => {
                const locale = getKeyFromEnum(value, LocaleEnum);

                if (locale !== undefined) {
                    update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, locale)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${LocaleList.join(', ')}**`
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
            voiceChannel: VoiceChannel | undefined | null // , voiceObject: VoiceChannelPrtl | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): number | string => {
            if (!voiceChannel) {
                return 'N/A';
            }

            return voiceChannel.position;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'position';

            return new Promise((resolve) => {
                if (isNaN(Number(value))) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number**`
                    });
                }

                voiceChannel
                    .edit({ position: Number(value) })
                    .then(r => {
                        return resolve({
                            result: r.position === Number(value),
                            value: r.position === Number(value)
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to\`${value}\` to ${value} (is ${r.position})`
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                        });
                    });
            });
        },
        auth: AuthEnum.voice
    },
    {
        name: 'p.regex_overwrite',
        hover: 'whether voice channels spawned from portal channel will let users use their own regex',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): boolean | string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.regex_overwrite;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'regex_overwrite';

            return new Promise((resolve) => {
                if (value === 'true') {
                    update_portal(guildObject.id, portal_object.id, attr, true)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                }
                else if (value === 'false') {
                    update_portal(guildObject.id, portal_object.id, attr, false)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.regex_portal;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'regex_portal';

            return new Promise((resolve) => {
                update_portal(guildObject.id, portal_object.id, attr, value)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): string => {
            if (!voiceObject) {
                return 'N/A';
            }
            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.regex_voice;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['p', 'v'];
            const attr = 'regex_voice';

            return new Promise((resolve) => {
                update_portal(guildObject.id, portal_object.id, attr, value)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): string => {
            if (!voiceObject) {
                return 'N/A';
            }

            return voiceObject.regex;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string // , member_object: MemberPrtl | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'regex';

            return new Promise((resolve) => {
                update_voice(guildObject.id, portal_object.id, voiceObject.id, attr, value)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
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
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null, guildObject: PGuild, guild: Guild,
            member_object: PMember | undefined
        ): string => {
            return (member_object && member_object.regex)
                ? member_object.regex
                : 'not-set';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel, portal_object: PChannel,
            guildObject: PGuild, value: string, member_object: PMember | undefined
        ): Promise<ReturnPromise> => {
            const ctgr = ['m'];
            const attr = 'regex';

            return new Promise((resolve) => {
                if (member_object) {
                    updateMember(guildObject.id, member_object.id, attr, value)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
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
        name: 'p.user_limit',
        hover: 'voice channels spawned by portal channel user limit',
        get: (
            voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
            PObjectList: PChannel[] | undefined | null // , guildObject: PGuilt, guild: Guild
        ): number | string => {
            if (!voiceObject) {
                return 'N/A';
            }

            if (!PObjectList) {
                return 'N/A';
            }

            const portal_object = PObjectList.find(portal =>
                portal.voice_list.some(voice =>
                    voice.id === voiceObject.id
                )
            );

            if (portal_object) {
                return portal_object.user_limit_portal;
            }

            return 'N/A';
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel,
            portal_object: PChannel, guildObject: PGuild, value: number
        ): Promise<ReturnPromise> => {
            const ctgr = ['p'];
            const attr = 'user_limit_portal';
            const new_user_limit = Number(value);

            return new Promise((resolve) => {
                if (isNaN(new_user_limit)) {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number from 0-99 (0 means unlimited)**`
                    });
                }

                if (value >= 0) {
                    update_portal(guildObject.id, portal_object.id, 'user_limit_portal', new_user_limit)
                        .then(r => {
                            return resolve({
                                result: r,
                                value: r
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can be a number from 0-n (0 means unlimited)`
                    });
                }
            });
        },
        auth: AuthEnum.portal
    },
    {
        name: 'v.user_limit',
        hover: 'voice channels user limit',
        get: (
            voiceChannel: VoiceChannel | undefined | null // , voiceObject: VoiceChannelPrtl | undefined | null,
            // PObjectList: PortalChannelPrtl[] | undefined | null, guildObject: PGuilt, guild: Guild
        ): number | string => {
            if (!voiceChannel) {
                return 'N/A';
            }

            return voiceChannel.userLimit;
        },
        set: (
            voiceChannel: VoiceChannel, voiceObject: PVoiceChannel,
            portal_object: PChannel, guildObject: PGuild, value: number
        ): Promise<ReturnPromise> => {
            const ctgr = ['v'];
            const attr = 'user_limit';
            const new_user_limit = Number(value);

            return new Promise((resolve) => {
                if (new_user_limit >= 0) {
                    voiceChannel.setUserLimit(new_user_limit)
                        .then(r => {
                            return resolve({
                                result: r.userLimit === new_user_limit,
                                value: r.userLimit === new_user_limit
                                    ? `attribute ${ctgr.join('.') + '.' + attr} set successfully to \`${value}\``
                                    : `attribute ${ctgr.join('.') + '.' + attr} failed to be set to \`${value}\``
                            });
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set: ${e}`
                            });
                        });
                } else {
                    return resolve({
                        result: false,
                        value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number from 0-n (0 means unlimited)**`
                    });
                }
            });
        },
        auth: AuthEnum.voice,
    }
];

export function isAttribute(candidate: string): string {
    for (let i = 0; i < attributes.length; i++) {
        const sub_str = String(candidate)
            .substring(1, (String(attributes[i].name).length + 1));

        if (sub_str == attributes[i].name) {
            return attributes[i].name;
        }
    }

    return '';
}

export function getAttributeGuide(): EmbedBuilder {
    const attrArray: Field[] = [
        {
            emote: 'Used in Regex Interpreter',
            role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
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
    voiceChannel: VoiceChannel | undefined | null, voiceObject: PVoiceChannel | undefined | null,
    PObjectList: PChannel[] | undefined | null, guildObject: PGuild,
    guild: Guild, attr: string
): string | number | boolean {

    for (let l = 0; l < attributes.length; l++) {
        if (attr === attributes[l].name) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return attributes[l]
                .get(voiceChannel, voiceObject, PObjectList, guildObject, guild);
        }
    }

    return -1;
}

export function setAttribute(
    voiceChannel: VoiceChannel | undefined | null, guildObject: PGuild,
    candidate: string, value: string, member: GuildMember, message: Message
): Promise<ReturnPromise> {
    return new Promise((resolve) => {
        let voiceObject: PVoiceChannel | undefined = undefined;
        let portal_object: PChannel | undefined = undefined;

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

                        for (let i = 0; i < guildObject.portal_list.length; i++) {
                            for (let j = 0; j < guildObject.portal_list[i].voice_list.length; j++) {
                                if (guildObject.portal_list[i].voice_list[j].id === voiceChannel.id) {
                                    portal_object = guildObject.portal_list[i];
                                    voiceObject = guildObject.portal_list[i].voice_list[j];

                                    break;
                                }
                            }
                        }

                        if (!portal_object || !voiceObject) {
                            return resolve({
                                result: false,
                                value: 'you must be in a channel handled by Portal'
                            });
                        }

                        if (attributes[l].auth === AuthEnum.portal) {
                            if (portal_object.creator_id !== member.id) {
                                return resolve({
                                    result: false,
                                    value: `attribute ${candidate} can only be **set by the portal creator**`
                                });
                            }
                        } else if (attributes[l].auth === AuthEnum.voice) {
                            if (voiceObject.creator_id !== member.id) {
                                return resolve({
                                    result: false,
                                    value: `attribute ${candidate} can only be **set by the voice creator**`
                                });
                            }
                        }

                        break;
                }

                const member_object = guildObject.member_list.find(m => m.id === member.id);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                attributes[l]
                    .set(voiceChannel, voiceObject, portal_object, guildObject, value, member_object, message)
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