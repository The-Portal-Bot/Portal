const musc_mngr = require('../functions/music_manager');

const clear_user_reactions = function(args) {
	args.messageReaction.message.reactions.cache
		.forEach(reaction => reaction.users.remove(args.user.id));
};

const reaction_role_manager = function(args) {
	const current_guild = args.guild_list[args.messageReaction.message.guild.id];
	if (!current_guild.role_list[args.messageReaction.message.id]) {
		return { result: null, value: 'message is not role giving' };
	}
	const current_role_list = current_guild.role_list[args.messageReaction.message.id];
	const current_role_map = current_role_list.role_emote_map;
	const current_member = args.messageReaction.message.guild.members.cache
		.find(member => member.id === args.user.id);

	for(let i = 0; current_role_map.length; i++) {
		if(current_role_map[i].give === args.messageReaction.emoji.name) { // give role
			if (!args.messageReaction.message.guild.roles.cache.has(current_role_map[i].id)) { // guild has role
				clear_user_reactions(args);
				console.log({ result: false, value: `role ${current_role_map[i].give} does not exist` });
				return { result: false, value: `role ${current_role_map[i].give} does not exist` };
			}
			if (current_member.roles.cache.has(current_role_map[i].id)) { // member has role
				clear_user_reactions(args);
				console.log({ result: false, value: `you already have role ${current_role_map[i].give}` });
				return { result: false, value: `you already have role ${current_role_map[i].give}` };
			}

			const role = args.messageReaction.message.guild.roles.cache
				.find(cached_role => cached_role.id === current_role_map[i].id);

			try {
				args.messageReaction.message.guild.members.cache
					.find(member => member.id === args.user.id)
					.roles
					.add(role);
			}
			catch (error) {
				clear_user_reactions(args);
				console.log({ result: false, value: `failed to add role ${current_role_map[i].give}` });
				return { result: false, value: `failed to add role ${current_role_map[i].give}` };
			}

			clear_user_reactions(args);
			console.log({ result: true, value: `you have been added to role ${current_role_map[i].give}` });
			return { result: true, value: `you have been added to role ${current_role_map[i].give}` };

		}
		else if (current_role_map[i].strip === args.messageReaction.emoji.name) {

			if (!args.messageReaction.message.guild.roles.cache.has(current_role_map[i].id)) { // guild has role
				clear_user_reactions(args);
				console.log({ result: false, value: `role ${current_role_map[i].strip} does not exist` });
				return { result: false, value: `role ${current_role_map[i].strip} does not exist` };
			}
			if (!current_member.roles.cache.has(current_role_map[i].id)) { // member does not has role
				clear_user_reactions(args);
				console.log({ result: false, value: `you do not have role ${current_role_map[i].strip}` });
				return { result: false, value: `you do not have role ${current_role_map[i].strip}` };
			}

			const role = args.messageReaction.message.guild.roles.cache
				.find(cached_role => cached_role.id === current_role_map[i].id);

			try {
				args.messageReaction.message.guild.members.cache
					.find(member => member.id === args.user.id)
					.roles
					.remove(role);
			}
			catch (error) {
				clear_user_reactions(args);
				console.log({ result: false, value: `failed to remove role ${current_role_map[i].strip}` });
				return { result: false, value: `failed to remove role ${current_role_map[i].strip}` };
			}

			clear_user_reactions(args);
			console.log({ result: true, value: `you have been striped from role ${current_role_map[i].strip}` });
			return { result: true, value: `you have been striped from role ${current_role_map[i].strip}` };
		}
	}
};

const reaction_music_manager = function(args) {
	const current_guild = args.guild_list[args.messageReaction.message.guild.id];
	if (current_guild.music_data.message_id !== args.messageReaction.message.id) {
		return { result: null, value: 'message is not music player' };
	}
	const voice_connection_in_reaction_guild = args.client.voice.connections.find(connection =>
		connection.channel.guild.id === args.messageReaction.message.guild.id,
	);
	if (!voice_connection_in_reaction_guild) {
		clear_user_reactions(args);
		return { result: false, value: 'portal is not playing music write now' };
	}
	const is_member_in_same_channel_as_portal = voice_connection_in_reaction_guild.channel.members
		.some(member => member.id === args.user.presence.member.id);
	if (!is_member_in_same_channel_as_portal) {
		clear_user_reactions(args);
		return { result: false, value: 'you must be in the same channel with portal to control music' };
	}

	const return_value = { result: true, value: '' };

	switch(args.messageReaction.emoji.name) {
	case '▶️' : {
		return_value.value = 'resuming player';
		musc_mngr.play(args.messageReaction.message.guild.id, args.guild_list);
		break;
	}
	case '⏸' : {
		return_value.value = 'pausing player';
		musc_mngr.pause(args.messageReaction.message.guild.id, args.guild_list);
		break;
	}
	case '⏹' : {
		if(!current_guild.music_data.votes.includes(args.user.id)) {
			current_guild.music_data.votes.push(args.user.id);
		}

		const votes = current_guild.music_data.votes.length;
		const users = voice_connection_in_reaction_guild.channel.members.filter(member => !member.user.bot).size;

		if (votes >= users / 2) {
			return_value.value = 'stoping player';
			musc_mngr.stop(args.messageReaction.message.guild.id, args.guild_list,
				args.messageReaction.message.guild);
			args.guild_list[args.messageReaction.message.guild.id].music_data.votes = [];
		}
		else {
			return_value.value = `${votes}/${users / 2} (majority needed to stop/admins)`;
		}
		break;
	}
	case '⏭' : {
		if(!current_guild.music_data.votes.includes(args.user.id)) {
			votes.push(args.user.id);
		}

		const votes = current_guild.music_data.votes.length;
		const users = voice_connection_in_reaction_guild.channel.members.filter(member => !member.user.bot).size;

		if (votes >= users / 2) {
			return_value.value = 'skipping video';
			musc_mngr.skip(args.messageReaction.message.guild.id, args.guild_list,
				args.client, args.messageReaction.message.guild);
			args.guild_list[args.messageReaction.message.guild.id].music_data.votes = [];
		}
		else {
			return_value.value = `${votes}/${users / 2} (majority needed to skip/admins)`;
		}
		break;
	}
	}

	clear_user_reactions(args);
	return return_value;
};

module.exports = async (args) => {
	if(args.user.bot) return null;

	if (args.messageReaction.partial) {
		try {
			await args.messageReaction.fetch();
		}
		catch (error) {
			return {
				result: false,
				value: 'Something went wrong when fetching the message: ' + error,
			};
		}
	}

	const return_value_role = reaction_role_manager(args);
	console.log('return_value_role :>> ', return_value_role);
	if(return_value_role.result !== null) {
		console.log('INSIDE 1');
		return return_value_role;
	}

	const return_value_music = reaction_music_manager(args);
	console.log('return_value_music :>> ', return_value_music);

	if(return_value_music.result !== null) {
		console.log('INSIDE 2');
		return return_value_music;
	}

	return { result: false, value: 'Message is neither music player nor role giving' };
};