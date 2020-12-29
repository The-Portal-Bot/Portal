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
				return { result: false, value: `role ${current_role_map[i].give} does not exist` };
			}
			if (current_member.roles.cache.has(current_role_map[i].id)) { // member has role
				clear_user_reactions(args);
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
				return { result: false, value: `failed to add role ${current_role_map[i].give}` };
			}

			clear_user_reactions(args);
			return { result: true, value: `you have been added to role ${current_role_map[i].give}` };

		}
		else if (current_role_map[i].strip === args.messageReaction.emoji.name) {

			if (!args.messageReaction.message.guild.roles.cache.has(current_role_map[i].id)) { // guild has role
				clear_user_reactions(args);
				return { result: false, value: `role ${current_role_map[i].strip} does not exist` };
			}
			if (!current_member.roles.cache.has(current_role_map[i].id)) { // member does not has role
				clear_user_reactions(args);
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
				return { result: false, value: `failed to remove role ${current_role_map[i].strip}` };
			}

			clear_user_reactions(args);
			return { result: true, value: `you have been striped from role ${current_role_map[i].strip}` };
		}
	}
};

const reaction_music_manager = function(args) {
	const current_guild = args.guild_list[args.messageReaction.message.guild.id];
	let voice_connection_in_reaction_guild = null;

	if(args.messageReaction.emoji.name !== '📜' && args.messageReaction.emoji.name !== '❌') {
		if (current_guild.music_data.message_id !== args.messageReaction.message.id) {
			return { result: null, value: 'message is not music player' };
		}
		voice_connection_in_reaction_guild = args.client.voice.connections.find(connection =>
			connection.channel.guild.id === args.messageReaction.message.guild.id,
		);
		if (!voice_connection_in_reaction_guild) {
			clear_user_reactions(args);
			return { result: false, value: 'portal is not playing music write now' };
		}
		const is_member_in_same_channel_as_portal = voice_connection_in_reaction_guild.channel.members
			.some(member => {
				console.log(member.id ,' === ' , args.user.id);
				return member.id === args.user.id;
			});
		if (!is_member_in_same_channel_as_portal) {
			clear_user_reactions(args);
			return { result: false, value: 'you must be in the same channel with portal to control music' };
		}
	}
	const return_value = { result: true, value: '' };

	switch(args.messageReaction.emoji.name) {
	case '▶️' : {
		return_value.value = 'resuming player';
		musc_mngr.play(args.messageReaction.message.guild.id, args.guild_list,
			args.client, args.messageReaction.message.guild);
		break;
	}
	case '⏸' : {
		return_value.value = 'pausing player';
		musc_mngr.pause(args.messageReaction.message.guild.id, args.guild_list);
		break;
	}
	case '⏹' : {
		if(current_guild.dispatcher !== null && current_guild.dispatcher !== undefined) {
			return_value.value = 'player is not connected';
			break;
		}
		if(!current_guild.music_data.votes.includes(args.user.id)) {
			current_guild.music_data.votes.push(args.user.id);
		}

		const votes = current_guild.music_data.votes.length;
		const users = voice_connection_in_reaction_guild.channel.members
			.filter(member => !member.user.bot).size;

		if (votes >= users / 2) {
			return_value.value = 'stopping player (majority)';
			musc_mngr.stop(args.messageReaction.message.guild.id, args.guild_list,
				args.messageReaction.message.guild);
			current_guild.music_data.votes = [];
		}
		else if (args.user.presence.member.hasPermission('ADMINISTRATOR')) {
			return_value.value = 'stopping player (admin)';
			musc_mngr.stop(args.messageReaction.message.guild.id, args.guild_list,
				args.messageReaction.message.guild);
			current_guild.music_data.votes = [];
		}
		else {
			return_value.value = `${votes}/${users / 2} (majority or admin authorization needed to stop)`;
		}
		break;
	}
	case '⏭' : {
		if(current_guild.dispatcher !== null && current_guild.dispatcher !== undefined) {
			return_value.value = 'player is not connected';
			break;
		}
		if(!current_guild.music_data.votes.includes(args.user.id)) {
			current_guild.music_data.votes.push(args.user.id);
		}

		const votes = current_guild.music_data.votes.length;
		const users = voice_connection_in_reaction_guild.channel.members
			.filter(member => !member.user.bot).size;

		if (votes >= users / 2) {
			return_value.value = 'skipping video (majority)';
			musc_mngr.skip(args.messageReaction.message.guild.id, args.guild_list,
				args.client, args.messageReaction.message.guild);
			current_guild.music_data.votes = [];
		}
		else if (args.user.presence.member.hasPermission('ADMINISTRATOR')) {
			return_value.value = 'skipping video (admin)';
			musc_mngr.skip(args.messageReaction.message.guild.id, args.guild_list,
				args.client, args.messageReaction.message.guild);
			current_guild.music_data.votes = [];
		}
		else {
			return_value.value = `${votes}/${users / 2} (majority or admin authorization needed to skip)`;
		}
		break;
	}
	case '📜' : {
		const current_music_queue = args.guild_list[args.messageReaction.message.guild.id].music_queue;
		const music_queue = current_music_queue.length > 0
			? '\n' + current_music_queue.map((video, i) => `${i + 1}. **${video.title}`).join('**\n').toString() + '**'
			: ' empty';
		return_value.value = `Music queue:${music_queue}`;
		break;
	}
	case '❌' : {
		args.guild_list[args.messageReaction.message.guild.id].music_queue = [];
		return_value.value = 'Music queue: has been cleared.';
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
	if(return_value_role.result !== null) {
		return return_value_role;
	}

	const return_value_music = reaction_music_manager(args);
	if(return_value_music.result !== null) {
		return return_value_music;
	}
};