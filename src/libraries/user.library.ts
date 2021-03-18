import { Guild, GuildMember, Message, VoiceState } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { MemberPrtl } from "../types/classes/MemberPrtl.class";
import { RankSpeedEnum, RankSpeedValueList } from "../data/enums/RankSpeed.enum";
import { get_logger, time_elapsed } from './help.library';
import { update_member } from "./mongo.library";

export function give_role_from_rankup(member_prtl: MemberPrtl, member: GuildMember, ranks: any, guild: Guild): boolean {
	if (ranks) return false;

	const new_rank = ranks.find((rank: { level: number }) => rank.level === member_prtl.level);
	if (new_rank === null || new_rank === undefined) return false;

	const new_role = guild.roles.cache.find(role => role.id === new_rank.id);
	if (new_role === null || new_role === undefined) return false;

	if (!member.roles.cache.some(role => role === new_role)) {
		member.roles.add(new_role);
		return true;
	}

	return false;
};

export function calculate_rank(member: MemberPrtl): number | boolean {
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

		if (member_prtl === undefined) {
			return false;
		}

		const ranks = guild_object.ranks;
		const member = voiceState.member;
		const speed = guild_object.rank_speed;
		const cached_level = member_prtl.level;

		if (member_prtl.timestamp === null) {
			member_prtl.timestamp = new Date();
			update_member(voiceState.guild.id, member.id, 'timestamp', member_prtl.timestamp)
				.then(r => {
					get_logger().log({ level: 'info', type: 'none', message: `updated member` });
				})
				.catch(e => {
					get_logger().log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
				});

			return false;
		}

		const points = add_points_time(member_prtl, speed);

		update_member(voiceState.guild.id, member.id, 'points', points)
			.then(r => {
				get_logger().log({ level: 'info', type: 'none', message: `updated member` });
			})
			.catch(e => {
				get_logger().log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
			});

		update_member(voiceState.guild.id, member.id, 'timestamp', null)
			.then(r => {
				get_logger().log({ level: 'info', type: 'none', message: `updated member` });
			})
			.catch(e => {
				get_logger().log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
			});

		const level = calculate_rank(member_prtl);

		if (level) {
			update_member(voiceState.guild.id, member.id, 'level', level)
				.then(r => {
					get_logger().log({ level: 'info', type: 'none', message: `updated member` });
				})
				.catch(e => {
					get_logger().log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
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
		.then(r => {
			get_logger().log({ level: 'info', type: 'none', message: `updated member` });
		})
		.catch(e => {
			get_logger().log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
		});

	const level = calculate_rank(member);

	if (level) {
		update_member(message.guild.id, member.id, 'level', level)
			.then(r => {
				get_logger().log({ level: 'info', type: 'none', message: `updated member` });
			})
			.catch(e => {
				get_logger().log({ level: 'error', type: 'none', message: `failed to update member / ${e}` });
			});
	}

	return level ? level : false;
};

export function kick(message: Message, args: any): void {
	// This command must be limited to mods and admins. In this example we just hardcode the role names.
	// Please read on Array.some() to understand this bit:
	// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
	if (message.member && !message.member.roles.cache.some(r => ['Administrator', 'Moderator'].includes(r.name))) {
		message.reply('Sorry, you don\'t have permissions to use this!');
	}

	// Let's first check if we have a member and if we can kick them!
	// message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
	// We can also support getting the member by ID, which would be args[0]
	if (message.mentions) {
		if (message.mentions.members) {
			if (message.guild) {
				const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
				if (!member) { message.reply('Please mention a valid member of this server'); }
				else {
					if (!member.kickable) { message.reply('I cannot kick this user! Do they have a higher role? Do I have kick permissions?'); }

					// slice(1) removes the first part, which here should be the user mention or ID
					// join(' ') takes all the various parts to make it a single string.
					let reason = args.slice(1).join(' ');
					if (!reason) reason = 'No reason provided';

					// Now, time for a swift kick in the nuts!
					// await member.kick(reason)
					member.kick(reason).catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
					message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
				}
			}
		}
	}

};

export function ban(message: Message, args: any): void {
	// Most of this command is identical to kick, except that here we'll only let admins do it.
	// In the real world mods could ban too, but this is just an example, right? ;)
	// if (message.member && !message.member.roles.some(r => ['Administrator'].includes(r.name))) {
	// 	message.reply('Sorry, you don\'t have permissions to use this!');
	// }

	// if (message) {
	// 	if (message.mentions) {
	// 		const member = message.mentions.members.first();
	// 		if (!member) { message.reply('Please mention a valid member of this server'); }
	// 		if (!member.bannable) { message.reply('I cannot ban this user! Do they have a higher role? Do I have ban permissions?'); }

	// 		let reason = args.slice(1).join(' ');
	// 		if (!reason) reason = 'No reason provided';

	// 		// await member.ban(reason)
	// 		member.ban(reason).catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
	// 		message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
	// 	}
	// }
};