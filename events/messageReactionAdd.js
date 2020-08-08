module.exports = async (args) => {
	if(args.user.bot) return null;

	if (args.messageReaction.partial)
		try {
			await args.messageReaction.fetch();
		} catch (error) {
			return { 
				result: false, 
				value: 'Something went wrong when fetching the message: ' + error
			};
		}

	const current_guild = args.guild_list[args.messageReaction.message.guild.id];
	if (!current_guild.role_list[args.messageReaction.message.id])
		return { result: false, value: 'message is not role giving' };		
	const current_role_list = current_guild.role_list[args.messageReaction.message.id];
	const current_role_map = current_role_list.role_emote_map;
	const current_member = args.messageReaction.message.guild.members.cache
		.find(member => member.id === args.user.id);
	
	const found = current_role_map.some(role_message => {
		if(role_message.give === args.messageReaction.emoji.name) { // give role
			if (!args.messageReaction.message.guild.roles.cache.has(role_message.id)) // guild has role
				return { result: false, value: `role ${role_message.give} does not exist` };
			if (current_member.roles.cache.has(role_message.id)) // member has role
				return { result: false, value: `you already have role ${role_message.give}` };

			let role = args.messageReaction.message.guild.roles.cache
				.find(role => role.id === role_message.id);

			try {
				args.messageReaction.message.guild.members.cache
					.find(member => member.id === args.user.id)
					.roles
					.add(role);
			} catch (error) {
				return { result: false, value: `failed to add role ${role_message.give}` };
			}

			return { result: true, value: `you have been added to role ${role_message.give}` };

		} else if (role_message.strip === args.messageReaction.emoji.name) {

			if (!args.messageReaction.message.guild.roles.cache.has(role_message.id)) // guild has role
				return { result: false, value: `role ${role_message.strip} does not exist` };
			if (!current_member.roles.cache.has(role_message.id)) // member does not has role
				return { result: false, value: `you do not have role ${role_message.strip}` };

			let role = args.messageReaction.message.guild.roles.cache
				.find(role => role.id === role_message.id);

			try {
				args.messageReaction.message.guild.members.cache
					.find(member => member.id === args.user.id)
					.roles
					.remove(role);
			} catch (error) {
				return { result: false, value: `failed to remove role ${role_message.strip}` };
			}

			return { result: true, value: `you have been striped from role ${role_message.strip}` };
		}
	});

	if(found) {
		const user_reactions = args.messageReaction.message.reactions.cache
			.filter(reaction => reaction.users.cache.has(args.user.id));

		try {
			for (const reaction of user_reactions.values())
				await reaction.users.remove(args.user.id);
		} catch (error) {
			console.error('Failed to remove reactions.');
		}
	}


	// for (let i = 0; i < current_role_map.length; i++) {

	// 	if (current_role_map[i].give === args.messageReaction.emoji.name) {

	// 		if (args.messageReaction.message.guild.roles.cache.has(current_role_map[i].id)) {
	// 			return { result: false, value: `you already have role ${current_role_map[i].role}` };
	// 		}
				
	// 		let role = args.messageReaction.message.guild.roles.cache
	// 			.find(role => role.id === current_role_map[i].id);

	// 		if (role)
	// 			args.messageReaction.message.guild.members.cache
	// 				.find(member => member.id === args.user.id)
	// 				.roles
	// 				.add(role);
	// 		else
	// 			return {result: false, value: `there is not role ${current_role_map[i].role}`};

	// 		const user_reactions = args.messageReaction.message.reactions.cache
	// 			.filter(reaction => reaction.users.cache.has(args.user.id));

	// 		try {
	// 			for (const reaction of user_reactions.values())
	// 				await reaction.users.remove(args.user.id);
	// 		} catch (error) {
	// 			console.error('Failed to remove reactions.');
	// 		}

	// 		return { result: true, value: `you have been added to role ${current_role_map[i].role}` };
	// 	} else if (current_role_map[i].strip === args.messageReaction.emoji.name) {

	// 		if (!args.messageReaction.message.guild.roles.cache.has(current_role_map[i].id)) {
	// 			return { result: false, value: `you do not have role ${current_role_map[i].role}` };
	// 		}

	// 		let role = args.messageReaction.message.guild.roles.cache
	// 			.find(role => role.id === current_role_map[i].id);

	// 		if (role)
	// 			args.messageReaction.message.guild.members.cache
	// 				.find(member => member.id === args.user.id)
	// 				.roles
	// 				.remove(role);
	// 		else
	// 			return {result: false, value: `there is not role ${current_role_map[i].role}`};
				
	// 		const user_reactions = args.messageReaction.message.reactions.cache
	// 			.filter(reaction => reaction.users.cache.has(args.user.id));

	// 		try {
	// 			for (const reaction of user_reactions.values())
	// 				await reaction.users.remove(args.user.id);
	// 		} catch (error) {
	// 			console.error('Failed to remove reactions.');
	// 		}

	// 		return { result: true, value: `you have been striped from role ${current_role_map[i].role}` };
	// 	} else {
	// 		return { result: true, value: 'there is something wrong with the role giver message' };
	// 	}
	// }
	
};