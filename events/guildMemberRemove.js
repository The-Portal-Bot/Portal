const help_mngr = require('../functions/help_manager');

module.exports = async (args) => {
	if (!args.guild_list[args.member.guild.id].announcement) {
		return {
			result: false, value: 'announcements channel has not been set.' };
	}

	args.member.guild.channels.cache
		.find(channel => channel.id === args.guild_list[args.member.guild.id].announcement)
		.send(help_mngr.create_rich_embed(`${args.member.displayName} left ${args.member.guild}.`));

	if (args.member.id !== '704400876860735569') {
		delete args.guild_list[args.member.guild.id].member_list[args.member.id];
	}

	return { result: true, value: 'Member added to guild' };
};
