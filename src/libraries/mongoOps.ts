import { GuildPrtl, MusicData } from "../types/classes/GuildPrtl";
import GuildPrtlMdl from "../types/models/GuildPrtlMdl";
import { Client, StreamDispatcher } from "discord.js";
import { PortalChannelPrtl } from "../types/classes/PortalChannelPrtl";
import { GiveRolePrtl } from "../types/classes/GiveRolePrtl";
import { Rank } from "../types/interfaces/InterfacesPrtl";
import { VideoSearchResult } from "yt-search";
import { MemberPrtl } from "../types/classes/MemberPrtl";

// fetch guilds

export async function fetch_guild_list(): Promise<GuildPrtl[] | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.find({})
            .then(guilds => { return guilds ? resolve(<GuildPrtl[]><unknown>guilds) : undefined })
            .catch(err => { return resolve(undefined) });
    });
};

export async function fetch_guild(guild_id: string): Promise<GuildPrtl | undefined> {
    return new Promise((resolve) => {
        GuildPrtlMdl.findOne({ id: guild_id })
            .then(guild => {
                return guild ? resolve(<GuildPrtl><unknown>guild) : undefined
            })
            .catch(error => { console.log('error :>> ', error); return resolve(undefined) });
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
                member_list.push(new MemberPrtl(member.id, 1, 0, 1, 0, null, false, false, null));
    });

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
    const spotify: string | null = null;
    const music_data: MusicData = { channel_id: undefined, message_id: undefined, votes: [] };
    const music_queue: VideoSearchResult[] = [];
    const dispatcher: StreamDispatcher | undefined = undefined;
    const announcement: string | null = null;
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
            premium: premium,
        })
            .then(() => { return resolve(true); })
            .catch(() => { return resolve(false); });
    });
};

export async function remove_guild(guild_id: string): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.remove({ id: guild_id })
            .then(resposne => resolve(!resposne))
            .catch(() => resolve(false));
    });
};

//

export async function insert_member(new_member: MemberPrtl): Promise<boolean> {
    return new Promise((resolve) => {
        GuildPrtlMdl.updateOne({ id: new_member.id }, { $push: { member_list: new_member } })
            .then(resposne => resolve(!resposne))
            .catch(() => resolve(false));
    });
};