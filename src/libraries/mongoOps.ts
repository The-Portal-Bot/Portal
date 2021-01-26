import { GuildPrtl, MusicData } from "../types/classes/GuildPrtl";
import GuildPrtlMdl from "../types/models/GuildPrtlMdl";
import { Channel, Client, GuildChannel, GuildMember, StreamDispatcher } from "discord.js";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl";
import { GiveRolePrtl } from "../types/classes/GiveRolePrtl";
import { Rank } from "../types/interfaces/InterfacesPrtl";
import { VideoSearchResult } from "yt-search";
import { MemberPrtl } from "../types/classes/MemberPrtl";
import { stop } from "./musicOps";
import { VoiceChannelPrtl } from "../types/classes/VoiceChannelPrtl";

// fetch guilds

export async function fetch_guild_list(): Promise<GuildPrtl[] | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.find({})
            .then(guilds => {
                if (!!guilds) {
                    return resolve(<GuildPrtl[]><unknown>guilds);
                } else {
                    return undefined;
                }
            })
            .catch(error => {
                return resolve(undefined);
            });
    });
};

export async function fetch_guild(guild_id: string): Promise<GuildPrtl | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.findOne({ id: guild_id })
            .then(guild => {
                if (!!guild) {
                    return resolve(<GuildPrtl><unknown>guild);
                } else {
                    return undefined;
                }
            })
            .catch(error => {
                return resolve(undefined);
            });
    });
};

export async function guild_exists(guild_id: string): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.countDocuments({ id: guild_id })
            .then(count => {
                return resolve(count > 0);
            })
            .catch(error => {
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
        if (!member.user.bot)
            if (client.user && member.id !== client.user.id)
                member_list.push(new MemberPrtl(member.id, 1, 0, 1, 0, new Date('1 January, 1970, 00:00:00 UTC'), false, false, 'null'));
    });

    console.log('member_list :>> ', member_list);
    return member_list;
};

export async function insert_guild(guild_id: string, client: Client): Promise<boolean> {
    const id: string = guild_id;
    const portal_list: PortalChannelPrtl[] = [];
    const member_list = create_member_list(guild_id, client);
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

    return new Promise((resolve) => {
        GuildPrtlMdl.create({
            id: id,
            portal_list: portal_list,
            member_list: member_list,
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
            premium: premium
        })
            .then((response) => {
                return resolve(!!response);
            })
            .catch((error) => {
                console.log('error inserting guild: ', error);
                return resolve(false);
            });
    });
};

export async function remove_guild(guild_id: string): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.deleteOne({ id: guild_id })
            .then(response => resolve(!!response))
            .catch(() => resolve(false));
    });
};

//

export async function insert_member(new_member: GuildMember): Promise<boolean> {
    const new_member_portal = new MemberPrtl(new_member.id, 1, 0, 1, 0, null, false, false, null);
    return new Promise((resolve) => {
        // edo thelei na tou po kai se poio guild na paei
        GuildPrtlMdl.updateOne({ id: new_member.guild.id }, { $push: { member_list: new_member_portal } })
            .then(response => resolve(!!response))
            .catch(() => resolve(false));
    });
};

export async function remove_member(member_to_remove: GuildMember): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne({ id: member_to_remove.guild.id }, { $pull: { member_list: { id: member_to_remove.id } } })
            .then(response => resolve(!!response))
            .catch(() => resolve(false));
    });
};

//

export async function insert_portal(guild_id: string, new_portal: PortalChannelPrtl): Promise<boolean> {
    return new Promise((resolve) => {
        // edo thelei na tou po kai se poio guild na paei
        GuildPrtlMdl.updateOne(
            { id: guild_id },
            {
                $push: { portal_list: new_portal }
            }
        )
            .then(response => resolve(!!response))
            .catch(() => resolve(false));
    });
};

// export async function remove_portal(member_to_remove: GuildMember): Promise<boolean> {
//     return new Promise((resolve) => {
//         GuildPrtlMdl.updateOne({ id: member_to_remove.guild.id }, { $pull: { member_list: { id: member_to_remove.id } } })
//             .then(response => resolve(!!response))
//             .catch(() => resolve(false));
//     });
// };

//

export async function insert_voice(guild_id: string, portal_id: string, new_voice: VoiceChannelPrtl): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            { id: guild_id },
            {
                "$push": {
                    "portal_list.$[b].voice_list": new_voice
                }
            },
            {
                "new": true,
                "arrayFilters": [
                    { "b.id": portal_id }
                ]
            }
        )
            .then(response => { console.log('response :>> ', response); resolve(!!response) })
            .catch(error => { console.log('error :>> ', error); resolve(false) });
    });
};

// export async function remove_voice(member_to_remove: GuildMember): Promise<boolean> {
//     return new Promise((resolve) => {
//         GuildPrtlMdl.updateOne({ id: member_to_remove.guild.id }, { $pull: { member_list: { id: member_to_remove.id } } })
//             .then(response => resolve(!!response))
//             .catch(() => resolve(false));
//     });
// };


//



export async function insert_spotify(guild_id: string, new_spotify: string): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne(
            { id: guild_id },
            {
                spotify: new_spotify
            }
        )
            .then(response => resolve(response))
            .catch(() => resolve(false));
    });
};

// export async function remove_spotify(member_to_remove: GuildMember): Promise<boolean> {
//     return new Promise((resolve) => {
//         GuildPrtlMdl.updateOne({ id: member_to_remove.guild.id }, { $pull: { member_list: { id: member_to_remove.id } } })
//             .then(response => resolve(!!response))
//             .catch(() => resolve(false));
//     });
// };

//

//

export async function insert_announcement(guild_id: string, new_announcement: string): Promise<boolean> {
    return new Promise((resolve) => {
        // edo thelei na tou po kai se poio guild na paei
        GuildPrtlMdl.updateOne(
            { id: guild_id },
            {
                announcement: new_announcement
            }
        )
            .then(response => resolve(response))
            .catch(() => resolve(false));
    });
};

// export async function remove_announcement(member_to_remove: GuildMember): Promise<boolean> {
//     return new Promise((resolve) => {
//         GuildPrtlMdl.updateOne({ id: member_to_remove.guild.id }, { $pull: { member_list: { id: member_to_remove.id } } })
//             .then(response => resolve(!!response))
//             .catch(() => resolve(false));
//     });
// };

//

//

export async function insert_url(guild_id: string, new_url: string): Promise<boolean> {
    return new Promise((resolve) => {
        // edo thelei na tou po kai se poio guild na paei
        GuildPrtlMdl.updateOne(
            { id: guild_id },
            {
                $push: { url_list: new_url }
            }
        )
            .then(response => resolve(response))
            .catch(() => resolve(false));
    });
};

// export async function remove_url(member_to_remove: GuildMember): Promise<boolean> {
//     return new Promise((resolve) => {
//         GuildPrtlMdl.updateOne({ id: member_to_remove.guild.id }, { $pull: { member_list: { id: member_to_remove.id } } })
//             .then(response => resolve(!!response))
//             .catch(() => resolve(false));
//     });
// };

//

export async function set_ranks(guild_id: string, new_ranks: Rank[]): Promise<boolean> {
    return new Promise((resolve) => {
        // edo thelei na tou po kai se poio guild na paei
        GuildPrtlMdl.updateOne(
            { id: guild_id },
            {
                ranks: new_ranks
            }
        )
            .then(response => resolve(response))
            .catch(() => resolve(false));
    });
};

//

export async function insert_role_assigner(guild_id: string, new_role_assigner: GiveRolePrtl): Promise<boolean> {
    return new Promise((resolve) => {
        // edo thelei na tou po kai se poio guild na paei
        GuildPrtlMdl.updateOne(
            { id: guild_id },
            {
                role_list: new_role_assigner
            }
        )
            .then(response => resolve(response))
            .catch(() => resolve(false));
    });
};

//

export async function delete_channel(channel_to_remove: GuildChannel): Promise<number> {
    return new Promise((resolve) => {
        const TypesOfChannel = { Unknown: 0, Portal: 1, Voice: 2, Url: 3, Spotify: 4, Announcement: 5, Music: 6 };
        let type_of_channel = TypesOfChannel.Unknown;

        fetch_guild(channel_to_remove.guild.id)
            .then(guild_object => {
                if (guild_object) {
                    const found = guild_object.portal_list.some(p => {
                        if (p.id === channel_to_remove.id) {
                            GuildPrtlMdl.updateOne(
                                { id: channel_to_remove.guild.id },
                                {
                                    $pull: {
                                        portal_list: { id: channel_to_remove.id }
                                    }
                                }
                            )
                                .then(response => {
                                    return response
                                        ? resolve(TypesOfChannel.Portal)
                                        : resolve(type_of_channel)
                                })
                                .catch(() => resolve(type_of_channel));
                            return true;
                        }

                        p.voice_list.some(v => {
                            if (v.id === channel_to_remove.id) {
                                GuildPrtlMdl.updateOne(
                                    { id: channel_to_remove.guild.id },
                                    {
                                        $pull: {
                                            voice_list: { id: channel_to_remove.id }
                                        }
                                    }
                                )
                                    .then(response => {
                                        return response
                                            ? resolve(TypesOfChannel.Voice)
                                            : resolve(type_of_channel)
                                    })
                                    .catch(() => resolve(type_of_channel));
                                return true;
                            }
                        });
                    });

                    if (!found) {
                        for (let i = 0; i < guild_object.url_list.length; i++) {
                            if (guild_object.url_list[i] === channel_to_remove.id) {
                                GuildPrtlMdl.updateOne(
                                    { id: channel_to_remove.guild.id },
                                    {
                                        $pull: {
                                            url_list: channel_to_remove.id
                                        }
                                    }
                                )
                                    .then(response => {
                                        return response
                                            ? resolve(TypesOfChannel.Url)
                                            : resolve(type_of_channel)
                                    })
                                    .catch(() => resolve(type_of_channel));
                                break;
                            }
                        }

                        if (guild_object.spotify === channel_to_remove.id) {
                            GuildPrtlMdl.updateOne(
                                { id: channel_to_remove.guild.id },
                                {
                                    spotify: null
                                }
                            )
                                .then(response => {
                                    return response
                                        ? resolve(TypesOfChannel.Spotify)
                                        : resolve(type_of_channel)
                                })
                                .catch(() => resolve(type_of_channel));
                        }

                        if (guild_object.announcement === channel_to_remove.id) {
                            GuildPrtlMdl.updateOne(
                                { id: channel_to_remove.guild.id },
                                {
                                    announcement: null
                                }
                            )
                                .then(response => {
                                    return response
                                        ? resolve(TypesOfChannel.Announcement)
                                        : resolve(type_of_channel)
                                })
                                .catch(() => resolve(type_of_channel));
                        }

                        if (guild_object.music_data.channel_id === channel_to_remove.id) {
                            stop(guild_object, channel_to_remove.guild);
                            GuildPrtlMdl.updateOne(
                                { id: channel_to_remove.guild.id },
                                {
                                    music_data: {
                                        channel_id: undefined,
                                        message_id: undefined,
                                        votes: []
                                    },
                                    dispatcher: undefined
                                }
                            )
                                .then(response => {
                                    return response
                                        ? resolve(TypesOfChannel.Music)
                                        : resolve(type_of_channel)
                                })
                                .catch(() => resolve(type_of_channel));
                        }
                    }

                    return resolve(type_of_channel);
                }
            })
            .catch(() => { return resolve(type_of_channel) });
    });
};