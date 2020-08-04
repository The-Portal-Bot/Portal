// const guld_mngr = require('../functions/guild_manager');
// const help_mngr = require('../functions/help_manager');

module.exports = async (args) => {
	if(args.user.bot) return null;

	if (args.messageReaction.partial) {
		try {
			await args.messageReaction.fetch();
		} catch (error) {
			return {
				result: false,
				value: 'Something went wrong when fetching the message: ' + error
			};
		}
	}

	const current_guild = args.guild_list[args.messageReaction.message.guild.id];

	if (current_guild.role_list[args.messageReaction.message.id]) {
		
		const current_role_list = current_guild.role_list[args.messageReaction.message.id];
		const current_role_map = current_role_list.role_emote_map;

		for (let i = 0; i < current_role_map.length; i++) {

			if (current_role_map[i].give === args.messageReaction.emoji.name) {
				let role = args.messageReaction.message.guild.roles.cache
					.find(role => role.id === current_role_map[i].id);

				if (role) {
					args.messageReaction.message.guild.members.cache.find(member =>
						member.id === args.user.id
					).roles.add(role);
				} else {
					return {result: false, value: `there is not role ${current_role_map[i].role}`};
				}

				const userReactions = args.messageReaction.message.reactions.cache
					.filter(reaction => reaction.users.cache.has(args.user.id));
				try {
					for (const reaction of userReactions.values()) {
						await reaction.users.remove(args.user.id);
					}
				} catch (error) {
					console.error('Failed to remove reactions.');
				}

				return {
					result: true,
					value: `you have been added to role ${current_role_map[i].role}`
				};
			} else if (current_role_map[i].strip === args.messageReaction.emoji.name) {
				let role = args.messageReaction.message.guild.roles.cache
					.find(role => role.id === current_role_map[i].id);

				if (role) {
					args.messageReaction.message.guild.members.cache.find(member =>
						member.id === args.user.id
					).roles.remove(role);
				} else {
					return {result: false, value: `there is not role ${current_role_map[i].role}`};
				}
				
				const userReactions = args.messageReaction.message.reactions.cache
					.filter(reaction => reaction.users.cache.has(args.user.id));
				try {
					for (const reaction of userReactions.values()) {
						await reaction.users.remove(args.user.id);
					}
				} catch (error) {
					console.error('Failed to remove reactions.');
				}

				return {
					result: true,
					value: `you have been striped from role ${current_role_map[i].role}`
				};
			} else {
				return {
					result: true,
					value: 'there is something wrong with the role giver message'
				};
			}
		}
	}
};