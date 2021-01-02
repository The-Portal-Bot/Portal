const help_mngr = require('../libraries/helpOps');
const member_class = require('../types/classes/MemberPrtl');

module.exports = async (args) => {
	const join_message = `member: ${args.member.presence.user}\n` +
		`id: ${args.member.guild.id}\n` +
		`joined: ${args.member.guild}.`;

	if (args.guild_list[args.member.guild.id].announcement) {
		args.member.guild.channels.cache
			.find(channel => channel.id === args.guild_list[args.member.guild.id].announcement)
			.send(help_mngr.create_rich_embed('Member joined', join_message, '#00C70D', null,
				args.member.user.avatarURL(), null, true, null, null));
	}

	if (!args.member.bot) {
		args.guild_list[args.member.guild.id].member_list[args.member.id] = new member_class(1, 0, 0, 0, null);
	}

	return { result: true, value: 'Member added to guild' };
};
