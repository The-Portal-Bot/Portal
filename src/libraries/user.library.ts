import { BanOptions, Guild, GuildMember, Message, VoiceState } from "discord.js";
import { RankSpeedEnum, RankSpeedValueList } from "../data/enums/RankSpeed.enum";
import { PGuild } from "../types/classes/PGuild.class";
import { PMember } from "../types/classes/PMember.class";
import { Rank } from "../types/classes/PTypes.interface";
import { timeElapsed } from './help.library';
import { updateEntireMember, updateMember } from "./mongo.library";

export function giveRoleFromRankUp(
    pMember: PMember, member: GuildMember, ranks: Rank[], guild: Guild
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!ranks) {
            return reject('could not find ranks');
        }

        const new_rank = ranks
            .find(r => r.level === pMember.level);

        if (!new_rank) {
            return resolve(false);
        }

        const new_role = guild.roles.cache
            .find(role => role.id === new_rank.role);

        if (new_role === null || new_role === undefined) {
            return resolve(false);
        }

        member.roles
            .add(new_role)
            .then(() => {
                return resolve(true);
            })
            .catch(e => {
                return reject(`failed to give role to member: ${e}`);
            });
    });
}

export function calculate_rank(
    member: PMember
): number {
    if (member.tier === 0) {
        member.tier = 1; // must be removed
    }

    if (member.points >= member.tier * 2500) {
        member.points -= member.tier * 2500;
        member.level++;

        if (member.level % 5 === 0) {
            member.tier++;
        }
    }

    return member.level;
}

export function add_points_time(
    pMember: PMember, rank_speed: number
): number {
    if (!pMember.timestamp) {
        return pMember.points;
    }

    const voice_time = timeElapsed(pMember.timestamp, 0);

    pMember.points += Math.round(voice_time.remaining_sec * RankSpeedValueList[rank_speed] * 0.5);
    pMember.points += Math.round(voice_time.remaining_min * RankSpeedValueList[rank_speed] * 30 * 1.15);
    pMember.points += Math.round(voice_time.remaining_hrs * RankSpeedValueList[rank_speed] * 30 * 30 * 1.25);

    pMember.timestamp = null;

    return pMember.points;
}

export function update_timestamp(
    voiceState: VoiceState, guild_object: PGuild
): Promise<number | boolean> {
    return new Promise((resolve, reject) => {
        if (voiceState.member && !voiceState.member.user.bot) {
            const pMember = guild_object.member_list
                .find(m =>
                    voiceState && voiceState.member && m.id === voiceState.member.id
                );

            if (!pMember) {
                return resolve(false);
            }

            const ranks = guild_object.ranks;
            const member = voiceState.member;
            const speed = guild_object.rank_speed;
            const cached_level = pMember.level;

            if (!pMember.timestamp) {
                pMember.timestamp = new Date();
                updateMember(voiceState.guild.id, member.id, 'timestamp', pMember.timestamp)
                    .then(() => {
                        return resolve(false);
                    })
                    .catch(e => {
                        return reject(`failed to update member: ${e}`);
                    });
            } else {
                pMember.points = add_points_time(pMember, speed);
                pMember.level = calculate_rank(pMember);
                pMember.timestamp = null;

                updateEntireMember(voiceState.guild.id, member.id, pMember)
                    .then(() => {
                        giveRoleFromRankUp(pMember, member, ranks, voiceState.guild)
                            .then(() => {
                                if (pMember.level > cached_level) {
                                    return resolve(pMember.level);
                                } else {
                                    return resolve(false);
                                }
                            })
                            .catch(e => {
                                return reject(`failed to give role: ${e}`);
                            });
                    })
                    .catch(e => {
                        return reject(`failed to update member: ${e}`);
                    });
            }
        } else {
            return resolve(false);
        }
    });
}

export function add_points_message(
    message: Message, member: PMember, rank_speed: number
): Promise<number | boolean> {
    return new Promise((resolve, reject) => {
        if (rank_speed === RankSpeedEnum.none) {
            return false
        }

        if (!message.guild) {
            return false
        }

        const points = message.content.length * RankSpeedValueList[rank_speed];
        member.points += points > 5 ? 5 : points;

        updateMember(message.guild.id, member.id, 'points', member.points)
            .catch(e => {
                return reject(`failed to update member: ${e}`);
            });

        const level = calculate_rank(member);

        if (level) {
            updateMember(message.guild.id, member.id, 'level', level)
                .catch(e => {
                    return reject(`failed to update member: ${e}`);
                });
        }

        return level ? level : false;
    });
}

export function kick(
    memberToKick: GuildMember, kick_reason: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (memberToKick.kickable) {
            memberToKick
                .kick(kick_reason)
                .then(() => {
                    return resolve(true);
                })
                .catch(e => {
                    return reject(e);
                });
        } else {
            return resolve(false);
        }
    });
}

export function ban(
    member_to_ban: GuildMember, ban_options: BanOptions
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (member_to_ban.bannable) {
            member_to_ban
                .ban(ban_options)
                .then(() => {
                    return resolve(true);
                })
                .catch(e => {
                    return reject(e);
                });
        } else {
            return resolve(false);
        }
    });
}