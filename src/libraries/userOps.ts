import { Message, Guild, GuildMember, VoiceState, User } from "discord.js";
import { MemberPrtl } from "../types/classes/MemberPrtl";
import { time_elapsed } from './helpOps';

const level_speed = { slow: 0.01, normal: 0.05, fast: 0.1 };

export function give_role_from_rankup(user: MemberPrtl, member: GuildMember, ranks: any, guild: Guild) {
	if (ranks) return;
	const new_rank = ranks.find((rank: { level: number }) => rank.level === user.level);
	if (new_rank === null || new_rank === undefined) return;

	const new_role = guild.roles.cache.find(role => role.id === new_rank.id);
	if (new_role === null || new_role === undefined) return;

	if (!member.roles.cache.some(role => role === new_role)) { member.roles.add(new_role); }
};

export function calculate_rank(user: any) {
	if (user.points >= user.tier * 1000) {
		user.points -= user.tier * 1000;
		user.level++;
		if (user.level % 5 === 0) {
			user.tier++;
		}

		return user.level;
	}
};

export function add_points_time(user: any, speed: string) {
	const voice_time = time_elapsed(user.timestamp, 0);

	const speed_num: number = (speed === 'slow')
		? level_speed.slow
		: (speed === 'normal')
			? level_speed.normal
			: (speed === 'fast')
				? level_speed.fast
				: level_speed.normal;

	user.points += Math.round(voice_time.remaining_sec * speed_num);
	user.points += Math.round(voice_time.remaining_min * speed_num * 60 * 1.15);
	user.points += Math.round(voice_time.remaining_hrs * speed_num * 60 * 60 * 1.25);

	user.timestamp = null;
};

export function update_timestamp(voiceState: VoiceState, guild_list: any): boolean {
	if (voiceState.member && voiceState.member.user.bot) {
		const guild = voiceState.guild;
		const ranks = guild_list[voiceState.guild.id].ranks;
		const user = guild_list[voiceState.guild.id].member_list[voiceState.member.id];
		const member = voiceState.member;
		const speed = guild_list[voiceState.guild.id].level_speed;
		const cached_level = user.level;

		if (user.timestamp === null) {
			user.timestamp = new Date();
			return false;
		}

		add_points_time(user, speed);
		calculate_rank(user);
		give_role_from_rankup(user, member, ranks, guild);

		if (user.level > cached_level) {
			return user.level;
		}
	}
	return false;
};

export function add_points_message(message: Message, guild_list: any): boolean {
	if (message && message.guild) {
		const user: MemberPrtl = guild_list[message.guild.id].member_list[message.author.id];
		const speed: string = guild_list[message.guild.id].level_speed;
		const speed_num: number = (speed === 'slow')
			? level_speed.slow
			: (speed === 'normal')
				? level_speed.normal
				: (speed === 'fast')
					? level_speed.fast
					: level_speed.normal;
		const points = message.content.length * speed_num;

		user.points += points > 5 ? 5 : Math.round(points);
		const level = calculate_rank(user);

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