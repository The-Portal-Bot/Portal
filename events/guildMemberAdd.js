const help_mngr = require('../functions/help_manager');

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

	return {
		result: true, value: 'Member added to guild'
	};
};
