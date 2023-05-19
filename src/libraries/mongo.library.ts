import { ChannelType, Client, TextChannel, VoiceChannel } from 'discord.js';
import { Document } from 'mongoose';
import { VideoSearchResult } from 'yt-search';
import { PortalChannelTypes } from '../data/enums/PortalChannel.enum';
import { ProfanityLevelEnum } from '../data/enums/ProfanityLevel.enum';
import { RankSpeedEnum } from '../data/enums/RankSpeed.enum';
import { PGiveRole } from '../types/classes/PGiveRole.class';
import { PGuild, IPGuild, MusicData } from '../types/classes/PGuild.class';
import { PMember } from '../types/classes/PMember.class';
import { PPoll } from '../types/classes/PPoll.class';
import { IPChannel, PChannel } from '../types/classes/PPortalChannel.class';
import { Rank } from '../types/classes/PTypes.interface';
import { PVoiceChannel } from '../types/classes/PVoiceChannel.class';
import PGuildModel from '../types/models/PGuild.model';

export async function fetchGuildList(
): Promise<PGuild[] | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .find({})
            .then((guilds: IPGuild[]) => {
                if (guilds) {
                    return resolve(guilds as unknown as PGuild[]);
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuild(
    guildId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                }
            )
            .then((guild: IPGuild | null) => {
                if (guild) {
                    return resolve(guild as unknown as PGuild);
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuildChannelDelete(
    guildId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                },
                {
                    id: 1,
                    portalList: 1,
                    announcement: 1,
                    musicData: 1,
                    urlList: 1,
                    ignoreList: 1
                })
            .then((r: any) => {
                if (r) {
                    return resolve({
                        id: r.id,
                        pChannels: r.portal_list,
                        announcement: r.announcement,
                        musicData: r.musicData,
                        urlList: r.url_list,
                        ignoreList: r.ignore_lis
                    } as PGuild);
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuildAnnouncement(
    guildId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                },
                {
                    announcement: 1,
                    initialRole: 1
                })
            .then((r: any) => {
                if (r) {
                    return resolve(<PGuild>{
                        announcement: r.announcement,
                        initialRole: r.initial_role
                    });
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuildReactionData(
    guildId: string, memberId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                },
                {
                    id: 1,
                    memberList: {
                        $elemMatch: {
                            id: memberId
                        }
                    },
                    roleList: 1,
                    pollList: 1,
                    musicData: 1,
                    musicQueue: 1
                })
            .then((r: any) => {
                if (r) {
                    return resolve(<PGuild>{
                        id: r.id,
                        pMembers: r.member_list,
                        roleList: r.role_list,
                        pollList: r.poll_list,
                        musicData: r.musicData,
                        musicQueue: r.music_queue
                    });
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuildMembers(
    guildId: string
): Promise<PMember[] | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                },
                {
                    memberList: 1
                })
            .then((r: any) => {
                if (r) {
                    return resolve(<PMember[]>r.member_list);
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuildMusicQueue(
    guildId: string
): Promise<{ queue: VideoSearchResult[], data: MusicData } | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                },
                {
                    musicData: 1,
                    musicQueue: 1
                })
            .then((r: any) => {
                if (r) {
                    return resolve(<{ queue: VideoSearchResult[], data: MusicData }>{
                        data: r.musicData,
                        queue: r.music_queue
                    });
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuildPreData(
    guildId: string, memberId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                },
                {
                    id: 1,
                    prefix: 1,
                    portalList: 1,
                    memberList: {
                        $elemMatch: {
                            id: memberId
                        }
                    },
                    ignoreList: 1,
                    urlList: 1,
                    muteRole: 1,
                    musicData: 1,
                    musicQueue: 1,
                    initialRole: 1,
                    rankSpeed: 1,
                    profanityLevel: 1,
                    kickAfter: 1,
                    banAfter: 1
                })
            .then((r: any) => {
                if (r) {
                    return resolve(<PGuild>{
                        id: r.id,
                        prefix: r.prefix,
                        pChannels: r.portal_list,
                        pMembers: r.member_list,
                        ignoreList: r.ignore_list,
                        urlList: r.url_list,
                        muteRole: r.mute_role,
                        musicData: r.musicData,
                        musicQueue: r.music_queue,
                        initialRole: r.initial_role,
                        rankSpeed: r.rank_speed,
                        profanityLevel: r.profanity_level,
                        kickAfter: r.kick_after,
                        banAfter: r.ban_after
                    });
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function fetchGuildRest(
    guildId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guildId
                },
                {
                    id: 0,
                    prefix: 0,
                    portalList: 0,
                    ignoreList: 0,
                    urlList: 0,
                    musicData: 0,
                    rankSpeed: 0,
                    profanityLevel: 0
                })
            .then((r: any) => {
                if (r) {
                    return resolve(<PGuild>{
                        id: r.id,
                        pMembers: r.member_list,
                        pollList: r.poll_list,
                        ranks: r.ranks,
                        musicQueue: r.music_queue,
                        announcement: r.announcement,
                        locale: r.locale,
                        announce: r.announce,
                        premium: r.premium
                    });
                } else {
                    return resolve(undefined);
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function guildExists(
    guildId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .countDocuments(
                {
                    id: guildId
                }
            )
            .then((count: number) => {
                return resolve(count > 0);
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function memberExists(
    guildId: string, memberId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .countDocuments(
                {
                    id: guildId,
                    memberList: {
                        $elemMatch: {
                            id: memberId
                        }
                    }
                }
            )
            .then((count: number) => {
                return resolve(count > 0);
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function updateGuild(
    guildId: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder[key] = value;
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $set: placeholder
                },
                {
                    'new': true
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

// CRUD guilds
function createMemberList(guildId: string, client: Client): PMember[] {
    const member_list: PMember[] = [];

    const guild = client.guilds.cache.find(guild => guild.id === guildId);
    if (!guild) {
        return member_list;
    }

    // const member_array = guild.members.cache.array();
    // for(let i = 0; i < member_array.length; i++) {
    //     if (!member_array[i].user.bot) {
    //         if (client.user && member_array[i].id !== client.user.id) {
    //             member_list.push(
    //                 new MemberPrtl(
    //                     member_array[i].id,
    //                     1,
    //                     0,
    //                     1,
    //                     0,
    //                     new Date('1 January, 1970, 00:00:00 UTC'),
    //                     'null'
    //                 )
    //             );
    //         }
    //     }
    // }

    guild.members.cache.forEach(member => {
        if (!member.user.bot) {
            if (client.user && member.id !== client.user.id) {
                member_list.push(
                    new PMember(
                        member.id,
                        1,
                        0,
                        1,
                        0,
                        0,
                        new Date('1 January, 1970, 00:00:00 UTC'),
                        'null'
                    )
                );
            }
        }
    });

    return member_list;
}

export async function insertGuild(
    guildId: string, client: Client
): Promise<boolean> {
    const id: string = guildId;
    const pChannels: PChannel[] = [];
    const pMembers: PMember[] = createMemberList(guildId, client);
    const URLList: string[] = [];
    const pRoles: PGiveRole[] = [];
    const polls: string[] = [];
    const ranks: Rank[] = [];
    const initialRole: string | null = 'null';
    const musicData: MusicData = {
        channelId: 'null',
        messageId: 'null',
        messageLyricsId: 'null',
        votes: [],
        pinned: false
    }
    const musicQueue: VideoSearchResult[] = [];
    const announcement: string | null = 'null';
    const muteRole: string | null = 'null';
    const locale = 1;
    const announce = true;
    const rankSpeed: number = RankSpeedEnum.default;
    const profanityLevel: number = ProfanityLevelEnum.default;
    const kickAfter = 0;
    const banAfter = 0;
    const premium = true; // as it is not a paid service anymore
    const prefix: string = process.env.PREFIX as unknown as string;

    return new Promise((resolve, reject) => {
        PGuildModel
            .create({
                id: id,
                portalList: pChannels,
                memberList: pMembers,
                urlList: URLList,
                roleList: pRoles,
                pollList: polls,
                initialRole: initialRole,
                ranks: ranks,
                musicData: musicData,
                musicQueue: musicQueue,
                announcement: announcement,
                muteRole: muteRole,
                locale: locale,
                announce: announce,
                rankSpeed: rankSpeed,
                profanityLevel: profanityLevel,
                kickAfter: kickAfter,
                banAfter: banAfter,
                premium: premium,
                prefix: prefix
            })
            .then((r: Document<any>) => {
                return resolve(!!r);
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function removeGuild(
    guildId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .deleteOne({
                id: guildId
            })
            .then((r: any) => {
                if ((r && r.id === guildId)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function updateMember(
    guildId: string, memberId: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['member_list.$[m].' + key] = value;

        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $set: placeholder
                },
                {
                    'new': true,
                    'arrayFilters': [
                        {
                            'm.id': memberId
                        }
                    ]
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function updateEntireMember(
    guildId: string, memberId: string, member: PMember
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['member_list.$[m]'] = member;

        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $set: placeholder
                },
                {
                    'new': true,
                    'arrayFilters': [
                        {
                            'm.id': memberId
                        }
                    ]
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function insertMember(
    guildId: string, memberId: string
): Promise<boolean> {
    const newPMember = new PMember(
        memberId,
        1,
        0,
        1,
        0,
        0,
        null,
        'null'
    );
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                { id: guildId },
                {
                    $push: {
                        memberList: newPMember
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function removeMember(
    memberId: string, guildId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $pull: {
                        memberList: {
                            id: memberId
                        }
                    }
                })
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function updatePortal(
    guildId: string, portalId: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['portal_list.$[p].' + key] = value;

        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $set: placeholder
                },
                {
                    'new': true,
                    'arrayFilters': [
                        { 'p.id': portalId }
                    ]
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function insertPortal(
    guildId: string, newPortal: IPChannel
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        portalList: newPortal
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function removePortal(
    guildId: string, portalId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $pull: {
                        portalList: {
                            id: portalId
                        }
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function updateVoice(
    guildId: string, portalId: string, voiceId: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['portal_list.$[p].voice_list.$[v].' + key] = value;

        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $set: placeholder
                },
                {
                    'new': true,
                    'arrayFilters': [
                        { 'p.id': portalId },
                        { 'v.id': voiceId }
                    ]
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function insertVoice(
    guildId: string, portalId: string, newVoice: PVoiceChannel
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        'portal_list.$[p].voice_list': newVoice
                    }
                },
                {
                    'new': true,
                    'arrayFilters': [
                        { 'p.id': portalId }
                    ]
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                reject(e);
            });
    });
}

export async function removeVoice(
    guildId: string, portalId: string, voiceId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $pull: {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        'portal_list.$[p].voice_list': {
                            id: voiceId
                        }
                    }
                },
                {
                    'new': true,
                    'arrayFilters': [
                        {
                            'p.id': portalId
                        }
                    ]
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                reject(e);
            });
    });
}

export async function insertURL(
    guildId: string, new_url: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        urlList: new_url
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function removeURL(
    guildId: string, remove_url: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $pull: {
                        urlList: remove_url
                    }
                })
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(`did not execute database transaction: ${e}`);
            });
    });
}

export async function insertIgnore( // channel
    guildId: string, new_ignore: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        ignoreList: new_ignore
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function removeIgnore( // channel
    guildId: string, remove_ignore: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $pull: {
                        ignoreList: remove_ignore
                    }
                })
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function setRanks(
    guildId: string, new_ranks: Rank[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    ranks: new_ranks
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function insertPoll(
    guildId: string, poll: PPoll
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        pollList: poll
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function removePoll(
    guildId: string, messageId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $pull: {
                        pollList: {
                            messageId: messageId
                        }
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function insertVendor(
    guildId: string, new_vendor: PGiveRole
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        roleList: new_vendor
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function removeVendor(
    guildId: string, messageId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $pull: {
                        roleList: {
                            messageId: messageId
                        }
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function insertMusicVideo(
    guildId: string, video: VideoSearchResult
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        musicQueue: video
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function clearMusicVote(
    guildId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $set: {
                        'musicData.votes': []
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function insertMusicVote(
    guildId: string, user_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $push: {
                        'musicData.votes': user_id
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function setMusicData(
    guildId: string, newMusicData: MusicData
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guildId
                },
                {
                    $set: {
                        musicData: newMusicData
                    }
                }
            )
            .then((r) => {
                if ((r && r.modifiedCount && r.modifiedCount > 0)) {
                    return resolve(true);
                } else {
                    return reject('did not execute database transaction');
                }
            })
            .catch((e: any) => {
                return reject(e);
            });
    });
}

export async function deletedChannelSync(
    channelToRemove: VoiceChannel | TextChannel
): Promise<number> {
    return new Promise((resolve) => {
        fetchGuildChannelDelete(channelToRemove.guild.id)
            .then(pGuild => {
                if (pGuild) {
                    // check if it is a portal or portal-voice channel
                    if (channelToRemove.type !== ChannelType.GuildText) {
                        const currentVoice = channelToRemove;
                        pGuild.pChannels.some(p => {
                            if (p.id === currentVoice.id) {
                                removePortal(currentVoice.guild.id, p.id)
                                    .then(r => {
                                        return r
                                            ? resolve(PortalChannelTypes.portal)
                                            : resolve(PortalChannelTypes.unknown)
                                    })
                                    .catch(() => {
                                        return resolve(PortalChannelTypes.unknown)
                                    });

                                return true;
                            }

                            p.pVoiceChannels.some(v => {
                                if (v.id === currentVoice.id) {
                                    removeVoice(currentVoice.guild.id, p.id, v.id)
                                        .then(r => {
                                            return r
                                                ? resolve(PortalChannelTypes.voice)
                                                : resolve(PortalChannelTypes.unknown)
                                        })
                                        .catch(() => {
                                            return resolve(PortalChannelTypes.unknown)
                                        });

                                    return true;
                                }
                            });
                        });
                    } else {
                        const currentText = channelToRemove;

                        if (pGuild.announcement === currentText.id) {
                            updateGuild(currentText.guild.id, 'announcement', 'null')
                                .then(r => {
                                    return r
                                        ? resolve(PortalChannelTypes.announcement)
                                        : resolve(PortalChannelTypes.unknown);
                                })
                                .catch(() => {
                                    return resolve(PortalChannelTypes.unknown);
                                });
                        } else if (pGuild.musicData.channelId === currentText.id) {
                            const musicData = new MusicData('null', 'null', 'null', [], false);
                            setMusicData(pGuild.id, musicData)
                                .then(r => {
                                    return r
                                        ? resolve(PortalChannelTypes.music)
                                        : resolve(PortalChannelTypes.unknown)
                                })
                                .catch(() => {
                                    return resolve(PortalChannelTypes.unknown);
                                });
                        } else {
                            for (let i = 0; i < pGuild.urlList.length; i++) {
                                if (pGuild.urlList[i] === currentText.id) {
                                    removeURL(currentText.guild.id, currentText.id)
                                        .then(r => {
                                            return r
                                                ? resolve(PortalChannelTypes.url)
                                                : resolve(PortalChannelTypes.unknown);
                                        })
                                        .catch(() => {
                                            return resolve(PortalChannelTypes.unknown);
                                        });
                                    break;
                                }
                            }

                            for (let i = 0; i < pGuild.ignoreList.length; i++) {
                                if (pGuild.ignoreList[i] === currentText.id) {
                                    removeIgnore(currentText.guild.id, currentText.id)
                                        .then(r => {
                                            return r
                                                ? resolve(PortalChannelTypes.url)
                                                : resolve(PortalChannelTypes.unknown);
                                        })
                                        .catch(() => {
                                            return resolve(PortalChannelTypes.unknown);
                                        });
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    return resolve(PortalChannelTypes.unknown);
                }
            })
            .catch(() => {
                return resolve(PortalChannelTypes.unknown);
            });
    });
}