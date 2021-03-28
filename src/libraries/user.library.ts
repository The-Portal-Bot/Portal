import { BanOptions, Guild, GuildMember, Message, PermissionString, VoiceState } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { MemberPrtl } from "../types/classes/MemberPrtl.class";
import { RankSpeedEnum, RankSpeedValueList } from "../data/enums/RankSpeed.enum";
import { logger, time_elapsed } from './help.library';
import { update_member } from "./mongo.library";

export function give_role_from_rankup(
	member_prtl: MemberPrtl, member: GuildMember, ranks: any, guild: Guild
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (ranks) return reject(false);

		const new_rank = ranks.find((rank: { level: number }) => rank.level === member_prtl.level);
		if (new_rank === null || new_rank === undefined) return reject(false);

		const new_role = guild.roles.cache.find(role => role.id === new_rank.id);
		if (new_role === null || new_role === undefined) return reject(false);

		if (!member.roles.cache.some(role => role === new_role)) {
			member.roles.add(new_role);
			return resolve(true);
		}

		return reject(false);
	});
};

export function calculate_rank(
	member: MemberPrtl
): number | boolean {
	if (member.tier === 0) {
		member.tier = 1; // must be removed
	}

	if (member.points >= member.tier * 1000) {
		member.points -= member.tier * 1000;

		member.level++;
		if (member.level % 5 === 0) {
			member.tier++;
		}

		return member.level;
	}

	return false;
};

export function add_points_time(
	member_prtl: MemberPrtl, rank_speed: number
): number | boolean {
	if (!member_prtl.timestamp) {
		return member_prtl.points;
	}

	const voice_time = time_elapsed(member_prtl.timestamp, 0);

	member_prtl.points += Math.round(voice_time.remaining_sec * RankSpeedValueList[rank_speed]);
	member_prtl.points += Math.round(voice_time.remaining_min * RankSpeedValueList[rank_speed] * 60 * 1.15);
	member_prtl.points += Math.round(voice_time.remaining_hrs * RankSpeedValueList[rank_speed] * 60 * 60 * 1.25);

	member_prtl.timestamp = null;

	return member_prtl.points;
};

export function update_timestamp(
	voiceState: VoiceState, guild_object: GuildPrtl
): number | boolean {
	if (voiceState.member && voiceState.member.user.bot) {
		const member_prtl = guild_object.member_list.find(m => {
			if (voiceState && voiceState.member) {
				return m.id === voiceState.member.id;
			}
		});

		if (!member_prtl) {
			return false;
		}

		const ranks = guild_object.ranks;
		const member = voiceState.member;
		const speed = guild_object.rank_speed;
		const cached_level = member_prtl.level;

		if (member_prtl.timestamp === null) {
			member_prtl.timestamp = new Date();
			update_member(voiceState.guild.id, member.id, 'timestamp', member_prtl.timestamp)
				.catch(e => {
					logger.log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
				});

			return false;
		}

		const points = add_points_time(member_prtl, speed);

		update_member(voiceState.guild.id, member.id, 'points', points)
			.catch(e => {
				logger.log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
			});

		update_member(voiceState.guild.id, member.id, 'timestamp', null)
			.catch(e => {
				logger.log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
			});

		const level = calculate_rank(member_prtl);

		if (level) {
			update_member(voiceState.guild.id, member.id, 'level', level)
				.catch(e => {
					logger.log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
				});
		}

		give_role_from_rankup(member_prtl, member, ranks, voiceState.guild);

		if (member_prtl.level > cached_level) {
			return member_prtl.level;
		}
	}

	return false;
};

export function add_points_message(
	message: Message, member: MemberPrtl, rank_speed: number
): number | boolean {
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
			logger.log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
		});

	const level = calculate_rank(member);

	if (level) {
		update_member(message.guild.id, member.id, 'level', level)
			.catch(e => {
				logger.log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
			});
	}

	return level ? level : false;
};

export function kick(
	member_to_kick: GuildMember, kick_reason: string
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		member_to_kick
			.kick(kick_reason)
			.then(r => {
				return resolve(true);
			})
			.catch(e => {
				return reject(e);
			});
	});
};

export function ban(
	member_to_ban: GuildMember, ban_options: BanOptions
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		member_to_ban
			.ban(ban_options)
			.then(r => {
				return resolve(true);
			})
			.catch(e => {
				return reject(e);
			});
	});
};