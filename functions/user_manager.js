/* eslint-disable no-undef */
const help_mngr = require('./../functions/help_manager');

level_speed = { 'slow': 0.01, 'normal': 0.05, 'fast': 0.1 };

module.exports = 
{
	calculate_rank: function (user) {
		if (user.points >= user.tier * 1000) {
			user.level++;
			if (user.level % 5 === 0) {
				user.tier++;
			}

			user.points -= user.tier * 1000;

			return true;
		}

		return false;
	}
	,

	update_timestamp: function (voiceState, guild_list) {
		if (voiceState.member.user.bot) return;

		const user = guild_list[voiceState.guild.id].member_list[voiceState.member.id];
		const speed = guild_list[voiceState.guild.id].level_speed;

		if (user.timestamp === null) {
			user.timestamp = new Date();
		} else {
			return this.add_points_time(user, speed);
		}

		return false;
	}
	,

	add_points_time: function (user, speed) {
		const voice_time = help_mngr.time_elapsed(user.timestamp, 0);

		user.points += voice_time.remaining_sec * level_speed[speed];
		user.points += voice_time.remaining_min * level_speed[speed] * 60 * 1.15;
		user.points += voice_time.remaining_hrs * level_speed[speed] * 60 * 60 * 1.25;

		user.timestamp = null;

		if (this.calculate_rank(user)) {
			return user.level;
		}

		return false;
	}
	,

	add_points_message: function (message, guild_list) {
		const user = guild_list[message.guild.id].member_list[message.author.id];
		const speed = guild_list[message.guild.id].level_speed;

		user.points += message.content.length * level_speed[speed];

		if (this.calculate_rank(user)) {
			return user.level;
		}

		return false;
	}
	,

	add_points_voice: function (message, guild_list) {
		const user = guild_list[message.guild.id].member_list[message.author.id];
		const speed = guild_list[message.guild.id].level_speed;

		user.points += message.content.length * level_speed[speed];

		if (this.calculate_rank(user)) {
			return user.level;
		}

		return false;
	}
	,

	kick: function (message, args)
	{
		// This command must be limited to mods and admins. In this example we just hardcode the role names.
		// Please read on Array.some() to understand this bit:
		// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
		if(!message.member.roles.some(r=>['Administrator', 'Moderator'].includes(r.name)) )
			return message.reply('Sorry, you don\'t have permissions to use this!');
		
		// Let's first check if we have a member and if we can kick them!
		// message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
		// We can also support getting the member by ID, which would be args[0]
		let member = message.mentions.members.first() || message.guild.members.get(args[0]);
		if(!member)
			return message.reply('Please mention a valid member of this server');
		if(!member.kickable)
			return message.reply('I cannot kick this user! Do they have a higher role? Do I have kick permissions?');
		
		// slice(1) removes the first part, which here should be the user mention or ID
		// join(' ') takes all the various parts to make it a single string.
		let reason = args.slice(1).join(' ');
		if(!reason) reason = 'No reason provided';
		
		// Now, time for a swift kick in the nuts!
		// await member.kick(reason)
		member.kick(reason)
			.catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
		message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
	}
	,

	ban: function (message, args)
	{
		// Most of this command is identical to kick, except that here we'll only let admins do it.
		// In the real world mods could ban too, but this is just an example, right? ;)
		if(!message.member.roles.some(r=>['Administrator'].includes(r.name)) )
			return message.reply('Sorry, you don\'t have permissions to use this!');
		
		let member = message.mentions.members.first();
		if(!member)
			return message.reply('Please mention a valid member of this server');
		if(!member.bannable)
			return message.reply('I cannot ban this user! Do they have a higher role? Do I have ban permissions?');

		let reason = args.slice(1).join(' ');
		if(!reason) reason = 'No reason provided';
		
		// await member.ban(reason)
		member.ban(reason)
			.catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
		message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
	}
};