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

// fetch guilds
export async function fetch_guild_list(
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

export async function fetch_guild(
    guild_id: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
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

export async function fetch_guild_channel_delete(
    guild_id: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
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
                    return resolve(<PGuild>{
                        id: r.id,
                        pChannels: r.portal_list,
                        announcement: r.announcement,
                        musicData: r.music_data,
                        urlList: r.url_list,
                        ignoreList: r.ignore_lis
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

export async function fetch_guild_announcement(
    guild_id: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
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

export async function fetch_guild_reaction_data(
    guild_id: string, memberId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
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
                        musicData: r.music_data,
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

export async function fetch_guild_members(
    guild_id: string
): Promise<PMember[] | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
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

export async function fetch_guild_music_queue(
    guild_id: string
): Promise<{ queue: VideoSearchResult[], data: MusicData } | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
                },
                {
                    musicData: 1,
                    musicQueue: 1
                })
            .then((r: any) => {
                if (r) {
                    return resolve(<{ queue: VideoSearchResult[], data: MusicData }>{
                        data: r.music_data,
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

export async function fetchGuildPredata(
    guild_id: string, memberId: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
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
                        musicData: r.music_data,
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
    guild_id: string
): Promise<PGuild | undefined> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .findOne(
                {
                    id: guild_id
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
    guild_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .countDocuments(
                {
                    id: guild_id
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
    guild_id: string, memberId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .countDocuments(
                {
                    id: guild_id,
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    guild_id: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder[key] = value;
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

function createMemberList(guild_id: string, client: Client): PMember[] {
    const member_list: PMember[] = [];

    const guild = client.guilds.cache.find(guild => guild.id === guild_id);
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
    guild_id: string, client: Client
): Promise<boolean> {
    const id: string = guild_id;
    const portal_list: PChannel[] = [];
    const member_list: PMember[] = createMemberList(guild_id, client);
    const url_list: string[] = [];
    const role_list: PGiveRole[] = [];
    const poll_list: string[] = [];
    const ranks: Rank[] = [];
    const initial_role: string | null = 'null';
    const music_data: MusicData = {
        channelId: 'null',
        messageId: 'null',
        messageLyricsId: 'null',
        votes: [],
        pinned: false
    }
    const music_queue: VideoSearchResult[] = [];
    const announcement: string | null = 'null';
    const mute_role: string | null = 'null';
    const locale = 1;
    const announce = true;
    const rank_speed: number = RankSpeedEnum.default;
    const profanity_level: number = ProfanityLevelEnum.default;
    const kick_after = 0;
    const ban_after = 0;
    const premium = true; // as it is not a paid service anymore
    const prefix: string = process.env.PREFIX as unknown as string;

    return new Promise((resolve, reject) => {
        PGuildModel
            .create({
                id: id,
                portalList: portal_list,
                memberList: member_list,
                urlList: url_list,
                roleList: role_list,
                pollList: poll_list,
                initialRole: initial_role,
                ranks: ranks,
                musicData: music_data,
                musicQueue: music_queue,
                announcement: announcement,
                muteRole: mute_role,
                locale: locale,
                announce: announce,
                rankSpeed: rank_speed,
                profanityLevel: profanity_level,
                kickAfter: kick_after,
                banAfter: ban_after,
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
    guild_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .deleteOne({
                id: guild_id
            })
            .then((r: any) => {
                if ((r && r.id === guild_id)) {
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

//

export async function updateMember(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    guild_id: string, memberId: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['member_list.$[m].' + key] = value;

        PGuildModel
            .updateOne(
                {
                    id: guild_id
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    guild_id: string, memberId: string, member: PMember
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['member_list.$[m]'] = member;

        PGuildModel
            .updateOne(
                {
                    id: guild_id
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
    guild_id: string, memberId: string
): Promise<boolean> {
    const new_member_portal = new PMember(
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
                { id: guild_id },
                {
                    $push: {
                        memberList: new_member_portal
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

export async function remove_member(
    memberId: string, guild_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

//

export async function update_portal(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    guild_id: string, portal_id: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['portal_list.$[p].' + key] = value;

        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $set: placeholder
                },
                {
                    'new': true,
                    'arrayFilters': [
                        { 'p.id': portal_id }
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

export async function insert_portal(
    guild_id: string, new_portal: IPChannel
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $push: {
                        portalList: new_portal
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

export async function remove_portal(
    guild_id: string, portal_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $pull: {
                        portalList: {
                            id: portal_id
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

//

export async function update_voice(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    guild_id: string, portal_id: string, voice_id: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const placeholder: any = {}
        placeholder['portal_list.$[p].voice_list.$[v].' + key] = value;

        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $set: placeholder
                },
                {
                    'new': true,
                    'arrayFilters': [
                        { 'p.id': portal_id },
                        { 'v.id': voice_id }
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

export async function insert_voice(
    guild_id: string, portal_id: string, new_voice: PVoiceChannel
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $push: {
                        'portal_list.$[p].voice_list': new_voice
                    }
                },
                {
                    'new': true,
                    'arrayFilters': [
                        { 'p.id': portal_id }
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

export async function remove_voice(
    guild_id: string, portal_id: string, voice_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $pull: {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        'portal_list.$[p].voice_list': {
                            id: voice_id
                        }
                    }
                },
                {
                    'new': true,
                    'arrayFilters': [
                        {
                            'p.id': portal_id
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

//

export async function insert_url(
    guild_id: string, new_url: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

export async function remove_url(
    guild_id: string, remove_url: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

//

export async function insert_ignore( // channel
    guild_id: string, new_ignore: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

export async function remove_ignore( // channel
    guild_id: string, remove_ignore: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

//

export async function set_ranks(
    guild_id: string, new_ranks: Rank[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

//

export async function insert_poll(
    guild_id: string, poll: PPoll
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

export async function remove_poll(
    guild_id: string, messageId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

//

export async function insert_vendor(
    guild_id: string, new_vendor: PGiveRole
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

export async function remove_vendor(
    guild_id: string, messageId: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

//

export async function insert_music_video(
    guild_id: string, video: VideoSearchResult
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
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

export async function clear_music_vote(
    guild_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $set: {
                        'music_data.votes': []
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

export async function insert_music_vote(
    guild_id: string, user_id: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $push: {
                        'music_data.votes': user_id
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

export async function set_music_data(
    guild_id: string, new_music_data: MusicData
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        PGuildModel
            .updateOne(
                {
                    id: guild_id
                },
                {
                    $set: {
                        musicData: new_music_data
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

//

export async function deleted_channel_sync(
    channel_to_remove: VoiceChannel | TextChannel
): Promise<number> {
    return new Promise((resolve) => {
        fetch_guild_channel_delete(channel_to_remove.guild.id)
            .then(guild_object => {
                if (guild_object) {
                    // check if it is a portal or portal-voice channel
                    if (channel_to_remove.type !== ChannelType.GuildText) {
                        const current_voice = channel_to_remove;
                        guild_object.pChannels.some(p => {
                            if (p.id === current_voice.id) {
                                remove_portal(current_voice.guild.id, p.id)
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

                            p.voiceList.some(v => {
                                if (v.id === current_voice.id) {
                                    remove_voice(current_voice.guild.id, p.id, v.id)
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
                        const current_text = channel_to_remove;

                        if (guild_object.announcement === current_text.id) {
                            updateGuild(current_text.guild.id, 'announcement', 'null')
                                .then(r => {
                                    return r
                                        ? resolve(PortalChannelTypes.announcement)
                                        : resolve(PortalChannelTypes.unknown);
                                })
                                .catch(() => {
                                    return resolve(PortalChannelTypes.unknown);
                                });
                        } else if (guild_object.musicData.channelId === current_text.id) {
                            const music_data = new MusicData('null', 'null', 'null', [], false);
                            set_music_data(guild_object.id, music_data)
                                .then(r => {
                                    return r
                                        ? resolve(PortalChannelTypes.music)
                                        : resolve(PortalChannelTypes.unknown)
                                })
                                .catch(() => {
                                    return resolve(PortalChannelTypes.unknown);
                                });
                        } else {
                            for (let i = 0; i < guild_object.urlList.length; i++) {
                                if (guild_object.urlList[i] === current_text.id) {
                                    remove_url(current_text.guild.id, current_text.id)
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

                            for (let i = 0; i < guild_object.ignoreList.length; i++) {
                                if (guild_object.ignoreList[i] === current_text.id) {
                                    remove_ignore(current_text.guild.id, current_text.id)
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