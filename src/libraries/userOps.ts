import { Message, Guild, GuildMember, VoiceState, User } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { MemberPrtl } from "../types/classes/MemberPrtl";
import { time_elapsed } from './helpOps';

const level_speed = { slow: 0.01, normal: 0.05, fast: 0.1 };

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

export function calculate_rank(member: MemberPrtl): number | null {
	if (member.points >= member.tier * 1000) {
		member.points -= member.tier * 1000;
		member.level++;

		if (member.level % 5 === 0) {
			member.tier++;
		}

		return member.level;
	}

	return null;
};

export function add_points_time(member_prtl: MemberPrtl, speed: string): boolean {
	if (!member_prtl.timestamp) {
		return false;
	}
	const voice_time = time_elapsed(member_prtl.timestamp, 0);

	const speed_num: number = (speed === 'slow')
		? level_speed.slow
		: (speed === 'normal')
			? level_speed.normal
			: (speed === 'fast')
				? level_speed.fast
				: level_speed.normal;

	member_prtl.points += Math.round(voice_time.remaining_sec * speed_num);
	member_prtl.points += Math.round(voice_time.remaining_min * speed_num * 60 * 1.15);
	member_prtl.points += Math.round(voice_time.remaining_hrs * speed_num * 60 * 60 * 1.25);

	member_prtl.timestamp = null;

	return true;
};

export function update_timestamp(voiceState: VoiceState, guild_list: GuildPrtl[]): number | boolean {
	if (voiceState.member && voiceState.member.user.bot) {
		const guild = guild_list.find(guild => {
			if (voiceState && voiceState.guild)
				return guild.id === voiceState.guild.id;
		});

		if (guild === undefined) {
			return false;
		}

		const member_prtl = guild.member_list.find(m => {
			if (voiceState && voiceState.member)
				return m.id === voiceState.member.id;
		});

		if (member_prtl === undefined) {
			return false;
		}

		const ranks = guild.ranks;
		const member = voiceState.member;
		const speed = guild.level_speed;
		const cached_level = member_prtl.level;

		if (member_prtl.timestamp === null) {
			member_prtl.timestamp = new Date();
			return false;
		}

		add_points_time(member_prtl, speed);
		calculate_rank(member_prtl);
		give_role_from_rankup(member_prtl, member, ranks, voiceState.guild);

		if (member_prtl.level > cached_level) {
			return member_prtl.level;
		}
	}
	return false;
};

export function add_points_message(message: Message, guild_list: GuildPrtl[]): number | boolean {
	if (message && message.guild) {
		const guild = guild_list.find(guild => {
			if (message && message.guild)
				return guild.id === message.guild.id;
		});

		if (guild === undefined) {
			return false;
		}

		const member = guild.member_list.find(m => {
			if (message && message.author)
				return m.id === message.author.id;
		});

		if (member === undefined) {
			return false;
		}

		const speed: string = guild.level_speed;
		const speed_num: number = (speed === 'slow')
			? level_speed.slow
			: (speed === 'normal')
				? level_speed.normal
				: (speed === 'fast')
					? level_speed.fast
					: level_speed.normal;
		const points = message.content.length * speed_num;

		member.points += points > 5 ? 5 : Math.round(points);
		const level = calculate_rank(member);

		if (level) {
			return level;
		}
	}

	return false;
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