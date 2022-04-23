import { BanOptions, Guild, GuildMember, Message, VoiceState } from "discord.js";
import { RankSpeedEnum, RankSpeedValueList } from "../data/enums/RankSpeed.enum";
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { MemberPrtl } from "../types/classes/MemberPrtl.class";
import { Rank } from "../types/classes/TypesPrtl.interface";
import { timeElapsed } from './help.library';
import { update_entire_member, update_member } from "./mongo.library";

export function give_role_from_rankup(
	member_prtl: MemberPrtl, member: GuildMember, ranks: Rank[], guild: Guild
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (!ranks) {
			return reject('could not find ranks');
		}

		const new_rank = ranks
			.find(r => r.level === member_prtl.level);

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
				return reject(`failed to give role to member / ${e}`);
			});
	});
}

export function calculate_rank(
	member: MemberPrtl
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
	member_prtl: MemberPrtl, rank_speed: number
): number {
	if (!member_prtl.timestamp) {
		return member_prtl.points;
	}

	const voice_time = timeElapsed(member_prtl.timestamp, 0);

	member_prtl.points += Math.round(voice_time.remaining_sec * RankSpeedValueList[rank_speed] * 0.5);
	member_prtl.points += Math.round(voice_time.remaining_min * RankSpeedValueList[rank_speed] * 30 * 1.15);
	member_prtl.points += Math.round(voice_time.remaining_hrs * RankSpeedValueList[rank_speed] * 30 * 30 * 1.25);

	member_prtl.timestamp = null;

	return member_prtl.points;
}

export function update_timestamp(
	voiceState: VoiceState, guild_object: GuildPrtl
): Promise<number | boolean> {
	return new Promise((resolve, reject) => {
		if (voiceState.member && !voiceState.member.user.bot) {
			const member_prtl = guild_object.member_list
				.find(m =>
					voiceState && voiceState.member && m.id === voiceState.member.id
				);

			if (!member_prtl) {
				return resolve(false);
			}

			const ranks = guild_object.ranks;
			const member = voiceState.member;
			const speed = guild_object.rank_speed;
			const cached_level = member_prtl.level;

			if (!member_prtl.timestamp) {
				member_prtl.timestamp = new Date();
				update_member(voiceState.guild.id, member.id, 'timestamp', member_prtl.timestamp)
					.then(() => {
						return resolve(false);
					})
					.catch(e => {
						return reject(`failed to update member / ${e}`);
					});
			} else {
				member_prtl.points = add_points_time(member_prtl, speed);
				member_prtl.level = calculate_rank(member_prtl);
				member_prtl.timestamp = null;

				update_entire_member(voiceState.guild.id, member.id, member_prtl)
					.then(() => {
						give_role_from_rankup(member_prtl, member, ranks, voiceState.guild)
							.then(() => {
								if (member_prtl.level > cached_level) {
									return resolve(member_prtl.level);
								} else {
									return resolve(false);
								}
							})
							.catch(e => {
								return reject(`failed to give role / ${e}`);
							});
					})
					.catch(e => {
						return reject(`failed to update member / ${e}`);
					});
			}
		} else {
			return resolve(false);
		}
	});
}

export function add_points_message(
	message: Message, member: MemberPrtl, rank_speed: number
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

		update_member(message.guild.id, member.id, 'points', member.points)
			.catch(e => {
				return reject(`failed to update member / ${e}`);
			});

		const level = calculate_rank(member);

		if (level) {
			update_member(message.guild.id, member.id, 'level', level)
				.catch(e => {
					return reject(`failed to update member / ${e}`);
				});
		}

		return level ? level : false;
	});
}

export function kick(
	member_to_kick: GuildMember, kick_reason: string
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (member_to_kick.kickable) {
			member_to_kick
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