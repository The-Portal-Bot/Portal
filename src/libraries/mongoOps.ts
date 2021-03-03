import { Client, GuildMember, StreamDispatcher, TextChannel, VoiceChannel } from 'discord.js';
import { VideoSearchResult } from 'yt-search';
import { GiveRolePrtl } from '../types/classes/GiveRolePrtl';
import { GuildPrtl, MusicData } from '../types/classes/GuildPrtl';
import { MemberPrtl } from '../types/classes/MemberPrtl';
import { PortalChannelPrtl } from '../types/classes/PortalChannelPrtl';
import { VoiceChannelPrtl } from '../types/classes/VoiceChannelPrtl';
import { Rank, MongoPromise } from '../types/interfaces/InterfacesPrtl';
import GuildPrtlMdl from '../types/models/GuildPrtlMdl';
import config from '../config.json';
import { PollPrtl } from '../types/classes/PollPrtl';

// fetch guilds
export async function fetch_guild_list(
): Promise<GuildPrtl[] | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.find({})
            .then(guilds => {
                if (!!guilds) {
                    return resolve(<GuildPrtl[]><unknown>guilds);
                } else {
                    return undefined;
                }
            })
            .catch(e => {
                return resolve(undefined);
            });
    });
};

export async function fetch_guild(
    guild_id: string
): Promise<GuildPrtl | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.findOne(
            {
                id: guild_id
            }
        )
            .then(guild => {
                if (!!guild) {
                    return resolve(<GuildPrtl><unknown>guild);
                } else {
                    return undefined;
                }
            })
            .catch(e => {
                return resolve(undefined);
            });
    });
};

export async function fetch_guild_authenticate(
    guild_id: string, member_id: string
): Promise<{ prefix: string, member_list: MemberPrtl[], auth_role: string[] } | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.findOne(
            {
                id: guild_id
            },
            {
                prefix: 1,
                member_list: { $elemMatch: { id: member_id } },
                auth_role: 1
            })
            .then((r: any) => {
                if (!!r) {
                    return resolve(<{ prefix: string, member_list: MemberPrtl[], auth_role: string[] }><unknown>{
                        prefix: r.prefix,
                        member_list: r.member_list,
                        auth_role: r.auth_role
                    });
                } else {
                    return undefined;
                }
            })
            .catch(e => {
                return resolve(undefined);
            });
    });
};

export async function fetch_guild_spotify(
    guild_id: string
): Promise<{ spotify: string, portal_list: PortalChannelPrtl[] } | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.findOne(
            {
                id: guild_id
            },
            {
                spotify: 1,
                portal_list: 1
            })
            .then((r: any) => {
                if (!!r) {
                    return resolve(<{ spotify: string, portal_list: PortalChannelPrtl[] }><unknown>{
                        spotify: r.spotify,
                        portal_list: r.portal_list
                    });
                } else {
                    return undefined;
                }
            })
            .catch(e => {
                return resolve(undefined);
            });
    });
};

export async function guild_exists(
    guild_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.countDocuments(
            {
                id: guild_id
            }
        )
            .then(count => {
                return resolve(count > 0);
            })
            .catch(e => {
                return resolve(false);;
            });
    });
};

export async function update_guild(
    guild_id: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve) => {
        const placeholder: any = {};
        placeholder[key] = value;
        GuildPrtlMdl.updateOne(
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
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

// CRUD guilds

function create_member_list(guild_id: string, client: Client): MemberPrtl[] {
    const member_list: MemberPrtl[] = [];

    const guild = client.guilds.cache.find(guild => guild.id === guild_id);
    if (!guild) return member_list;

    guild.members.cache.forEach(member => {
        if (!member.user.bot) {
            if (client.user && member.id !== client.user.id) {
                member_list.push(
                    new MemberPrtl(member.id, 1, 0, 1, 0, new Date('1 January, 1970, 00:00:00 UTC'), false, false, false, 'null')
                );
            }
        }
    });

    return member_list;
};

export async function insert_guild(
    guild_id: string, client: Client
): Promise<boolean> {
    const id: string = guild_id;
    const portal_list: PortalChannelPrtl[] = [];
    const member_list = create_member_list(guild_id, client);
    const ignore_list: string[] = [];
    const url_list: string[] = [];
    const role_list: GiveRolePrtl[] = [];
    const ranks: Rank[] = [];
    const auth_role: string[] = [];
    const spotify: string | null = 'null';
    const music_data: MusicData = { channel_id: 'null', message_id: 'null', votes: [] };
    const music_queue: VideoSearchResult[] = [];
    const dispatcher: StreamDispatcher | undefined = undefined;
    const announcement: string | null = 'null';
    const locale: string = 'en';
    const announce: boolean = true;
    const level_speed: string = 'normal';
    const premium: boolean = true; // as it is not a paid service anymore
    const prefix: string = config.prefix;

    return new Promise((resolve) => {
        GuildPrtlMdl.create({
            id: id,
            portal_list: portal_list,
            member_list: member_list,
            ignore_list: ignore_list,
            url_list: url_list,
            role_list: role_list,
            ranks: ranks,
            auth_role: auth_role,
            spotify: spotify,
            music_data: music_data,
            music_queue: music_queue,
            dispatcher: dispatcher,
            announcement: announcement,
            locale: locale,
            announce: announce,
            level_speed: level_speed,
            premium: premium,
            prefix: prefix
        })
            .then(r => {
                return resolve(!!r);
            })
            .catch(e => {
                return resolve(false);;
            });
    });
};

export async function remove_guild(
    guild_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.deleteOne({
            id: guild_id
        })
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function update_member(
    guild_id: string, member_id: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve) => {
        const placeholder: any = {};
        placeholder['member_list.$[m].' + key] = value;

        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $set: placeholder
            },
            {
                'new': true,
                'arrayFilters': [
                    { 'm.id': member_id }
                ]
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function insert_member(
    new_member: GuildMember
): Promise<boolean> {
    const new_member_portal = new MemberPrtl(new_member.id, 1, 0, 1, 0, null, false, false, false, null);
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            { id: new_member.guild.id },
            {
                $push: {
                    member_list: new_member_portal
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function remove_member(
    member_to_remove: GuildMember
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: member_to_remove.guild.id
            },
            {
                $pull: {
                    member_list: {
                        id: member_to_remove.id
                    }
                }
            })
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function update_portal(
    guild_id: string, portal_id: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve) => {
        const placeholder: any = {};
        placeholder['portal_list.$[p].' + key] = value;

        GuildPrtlMdl.updateOne(
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
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function insert_portal(
    guild_id: string, new_portal: PortalChannelPrtl
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    portal_list: new_portal
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function remove_portal(
    guild_id: string, portal_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $pull: {
                    portal_list: {
                        id: portal_id
                    }
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function update_voice(
    guild_id: string, portal_id: string, voice_id: string, key: string, value: any
): Promise<boolean> {
    return new Promise((resolve) => {
        const placeholder: any = {};
        placeholder['portal_list.$[p].voice_list.$[v].' + key] = value;

        GuildPrtlMdl.updateOne(
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
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function insert_voice(
    guild_id: string, portal_id: string, new_voice: VoiceChannelPrtl
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                "$push": {
                    "portal_list.$[p].voice_list": new_voice
                }
            },
            {
                "new": true,
                "arrayFilters": [
                    { "p.id": portal_id }
                ]
            }
        )
            .then((r: MongoPromise) => { resolve(!!r) })
            .catch(e => { resolve(false) });
    });
};

export async function remove_voice(
    guild_id: string, portal_id: string, voice_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                "$pull": {
                    "portal_list.$[p].voice_list": { id: voice_id }
                }
            },
            {
                "new": true,
                "arrayFilters": [
                    { "p.id": portal_id }
                ]
            }
        )
            .then((r: MongoPromise) => { resolve(!!r) })
            .catch(e => { resolve(false) });
    });
};

//

export async function insert_url(
    guild_id: string, new_url: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    url_list: new_url
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function remove_url(
    guild_id: string, remove_url: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $pull: {
                    url_list: remove_url
                }
            })
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function insert_ignore(
    guild_id: string, new_ignore: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    ignore_list: new_ignore
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function remove_ignore(
    guild_id: string, remove_ignore: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $pull: {
                    ignore_list: remove_ignore
                }
            })
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function insert_authorised_role(
    guild_id: string, new_auth_role: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    auth_role: new_auth_role
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function remove_authorised_role(
    guild_id: string, auth_role: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $pull: {
                    auth_role: auth_role
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function set_ranks(
    guild_id: string, new_ranks: Rank[]): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                ranks: new_ranks
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function insert_poll(
    guild_id: string, poll: PollPrtl
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    poll_list: poll
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function remove_poll(
    guild_id: string, message_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $pull: {
                    poll_list: { message_id: message_id }
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function insert_role_assigner(
    guild_id: string, new_role_assigner: GiveRolePrtl
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    role_list: new_role_assigner
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function remove_role_assigner(
    guild_id: string, message_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $pull: {
                    role_list: { message_id: message_id }
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

//

export async function insert_music_video(
    guild_id: string, video: VideoSearchResult
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    music_queue: video
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function clear_music_vote(
    guild_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $set: {
                    'music_data.votes': []
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function insert_music_vote(
    guild_id: string, user_id: string
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $push: {
                    'music_data.votes': user_id
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => {
                return resolve(false);
            });
    });
};

export async function set_music_data(
    guild_id: string, new_music_data: MusicData
): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            {
                id: guild_id
            },
            {
                $set: {
                    music_data: new_music_data
                }
            }
        )
            .then((r: MongoPromise) => {
                return resolve(r.ok === 1);;
            })
            .catch(e => { return resolve(false);; });
    });
}

//

export enum ChannelTypePrtl {
    unknown = 0,
    portal = 1,
    voice = 2,
    url = 3,
    spotify = 4,
    announcement = 5,
    music = 6
}

export async function deleted_channel_sync(
    channel_to_remove: VoiceChannel | TextChannel
): Promise<number> {
    return new Promise((resolve) => {
        fetch_guild(channel_to_remove.guild.id)
            .then(guild_object => {
                if (guild_object) {
                    // check if it is a Portal or a Voice channel
                    if (!channel_to_remove.isText()) {
                        const current_voice = <VoiceChannel>channel_to_remove;
                        guild_object.portal_list.some(p => {
                            if (p.id === current_voice.id) {
                                remove_portal(current_voice.guild.id, p.id)
                                    .then(r => {
                                        return r
                                            ? resolve(ChannelTypePrtl.portal)
                                            : resolve(ChannelTypePrtl.unknown)
                                    })
                                    .catch(() => {
                                        return resolve(ChannelTypePrtl.unknown)
                                    });
                                return true;
                            }

                            p.voice_list.some(v => {
                                if (v.id === current_voice.id) {
                                    remove_voice(current_voice.guild.id, p.id, v.id)
                                        .then(r => {
                                            return r
                                                ? resolve(ChannelTypePrtl.voice)
                                                : resolve(ChannelTypePrtl.unknown)
                                        })
                                        .catch(() => {
                                            return resolve(ChannelTypePrtl.unknown)
                                        });
                                    return true;
                                }
                            });
                        });
                    } else {
                        const current_text = <TextChannel>channel_to_remove;

                        if (guild_object.spotify === current_text.id) {
                            update_guild(current_text.guild.id, 'spotify', 'null')
                                .then(r => {
                                    return r
                                        ? resolve(ChannelTypePrtl.spotify)
                                        : resolve(ChannelTypePrtl.unknown)
                                })
                                .catch(() => {
                                    return resolve(ChannelTypePrtl.unknown)
                                });
                        } else if (guild_object.announcement === current_text.id) {
                            update_guild(current_text.guild.id, 'announcement', 'null')
                                .then(r => {
                                    return r
                                        ? resolve(ChannelTypePrtl.announcement)
                                        : resolve(ChannelTypePrtl.unknown);
                                })
                                .catch(() => {
                                    return resolve(ChannelTypePrtl.unknown);
                                });
                        } else if (guild_object.music_data.channel_id === current_text.id) {
                            const music_data = new MusicData('null', 'null', []);
                            set_music_data(guild_object.id, music_data)
                                .then(r => {
                                    return r
                                        ? resolve(ChannelTypePrtl.music)
                                        : resolve(ChannelTypePrtl.unknown)
                                })
                                .catch(() => {
                                    return resolve(ChannelTypePrtl.unknown);
                                });
                        } else {
                            for (let i = 0; i < guild_object.url_list.length; i++) {
                                if (guild_object.url_list[i] === current_text.id) {
                                    insert_url(current_text.guild.id, current_text.id)
                                        .then(r => {
                                            return r
                                                ? resolve(ChannelTypePrtl.url)
                                                : resolve(ChannelTypePrtl.unknown);
                                        })
                                        .catch(() => {
                                            return resolve(ChannelTypePrtl.unknown);
                                        });
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    return resolve(ChannelTypePrtl.unknown);
                }
            })
            .catch(() => {
                return resolve(ChannelTypePrtl.unknown);
            });
    });
};