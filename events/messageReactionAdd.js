// const guld_mngr = require('../functions/guild_manager');
// const help_mngr = require('../functions/help_manager');

module.exports = async (args) => {
	if(args.user.bot) return null;
	console.log(args.messageReaction);
	if (args.messageReaction.partial) {
		try {
			await args.messageReaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
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
			console.log(current_role_map[i].give, ' === ', args.messageReaction.emoji.name);
			console.log(current_role_map[i].strip, ' === ', args.messageReaction.emoji.name);

			if (current_role_map[i].give === args.messageReaction.emoji.name) {
				let role = args.messageReaction.message.guild.roles.cache
					.find(role => role.name === current_role_map[i].role);

				if (role) {
					args.messageReaction.message.member.roles
						.add(role);
				} else {
					return {result: false, value: `there is not role ${current_role_map[i].role}`};
				}
				return {
					result: true,
					value: `you have been added to role ${current_role_map[i].role}`
				};
			} else if (current_role_map[i].strip === args.messageReaction.emoji.name) {
				let role = args.messageReaction.message.guild.roles.cache
					.find(role => role.name === current_role_map[i].role);

				if (role) {
					args.messageReaction.message.member.roles
						.remove(role);
				} else {
					return {result: false, value: `there is not role ${current_role_map[i].role}`};
				}
				return {
					result: true,
					value: `you have been striped from role ${current_role_map[i].role}`
				};
			} else {
				return {
					result: true,
					value: 'there was something wrong with the role giver message'
				};
			}	
		}		
	}
	// Now the message has been cached and is fully available
	console.log(`${args.messageReaction.message.author}'s message "${args.messageReaction.message.content}" gained a messageReaction!`);
	// The messageReaction is now also fully available and the properties will be reflected accurately:
	console.log(`${args.messageReaction.count} user(s) have given the same messageReaction to this message!`);

	
};