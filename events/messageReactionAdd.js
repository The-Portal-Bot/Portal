// const guld_mngr = require('../functions/guild_manager');
// const help_mngr = require('../functions/help_manager');

module.exports = async (args) => {
	if (args.reaction.partial) {
		try {
			await args.reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			return {
				result: false, value: 'Something went wrong when fetching the message: ' + error
			};
		}
	}
	// if current message is in role list
	if (args.guild_list[args.reaction.message.guild.id].role_list[args.reaction.message.id]) {
		let message_reaction_list = args.guild_list[args.reaction.message.guild.id].role_list[args.reaction.message.id];
		for (let i = 0; i < message_reaction_list.role_emote_map.length; i++) {
			if (message_reaction_list.role_emote_map[i].give === args.reaction.emote) {
				let role_give = message_reaction_list.role_emote_map[i].role;
				let role = args.message.guild.roles.find(role => role.name === role_give);
				args.message.member.roles.add(role);
			} else if (message_reaction_list.role_emote_map[i].strip === args.reaction.emote) {
				let role_give = message_reaction_list.role_emote_map[i].role;
				let role = args.message.guild.roles.find(role => role.name === role_give);
				args.message.member.roles.remove(role);
			} else {

			}	
		}		
	}
	// Now the message has been cached and is fully available
	console.log(`${args.reaction.message.author}'s message "${args.reaction.message.content}" gained a reaction!`);
	// The reaction is now also fully available and the properties will be reflected accurately:
	console.log(`${args.reaction.count} user(s) have given the same reaction to this message!`);

	
};