const help_mngr = require('../functions/help_manager');

module.exports = async (args) => {
	const leave_message = `member: ${args.member.presence.user}\n` +
		`id: ${args.member.guild.id}\n` +
		`left: ${args.member.guild}.`;

	if (args.guild_list[args.member.guild.id] || !args.guild_list[args.member.guild.id].announcement) {
		args.member.guild.channels.cache
			.find(channel => channel.id === args.guild_list[args.member.guild.id].announcement)
			.send(help_mngr.create_rich_embed('Member left', leave_message, '#FC0303', null,
				args.member.user.avatarURL(), null, true, null, null));
	}

	if (!args.member.bot) {
		delete args.guild_list[args.member.guild.id].member_list[args.member.id];
	}

	return { result: true, value: 'Member added to guild' };
};
