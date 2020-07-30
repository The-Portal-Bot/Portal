const help_mngr = require('../functions/help_manager');

const member_class = require('../assets/classes/member_class');

module.exports = async (args) => {
	if (!args.guild_list[args.member.guild.id].announcement) {
		return {
			result: false, value: 'announcements channel has not been set.'
		};
	}

	args.member.guild.channels.cache.find(channel =>
		channel.id === args.guild_list[args.member.guild.id].announcement)
		.send(help_mngr.create_rich_embed(
			`${args.member.displayName} joined ${args.member.guild}.`
		));

	if (args.member.id !== '704400876860735569') {
		args.guild_list[args.member.guild.id].member_list[args.member.id] = new member_class(1, 0, 0, 0, null);
	}

	return {
		result: true, value: 'Member added to guild'
	};
};
