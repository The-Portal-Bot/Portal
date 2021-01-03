import { Client, MessageReaction, User, VoiceConnection } from "discord.js";
import { pause, play, skip, stop } from "../libraries/musicOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function clear_user_reactions(client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User) {
	messageReaction.message.reactions.cache.forEach(reaction => reaction.users.remove(user.id));
};

function reaction_role_manager(client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User): ReturnPormise {
	if (!messageReaction.message.guild) return { result: false, value: 'message has no guild' };
	const guild_object = guild_list.find(g => {
		if (messageReaction && messageReaction.message && messageReaction.message.guild)
			return g.id === messageReaction.message.guild.id;
	});
	if (!guild_object) return { result: false, value: 'message is not role giving' };

	const role_list_object = guild_object.role_list.find(r => r.message_id === messageReaction.message.id);
	if (!role_list_object) return { result: false, value: 'you have no set any roles' };
	const role_map_object = role_list_object.role_emote_map;

	const current_member = messageReaction.message.guild.members.cache.find(member => member.id === user.id);
	if (!current_member) return { result: false, value: 'could not find member' };

	for (let i = 0; role_map_object.length; i++) {
		if (role_map_object[i].give === messageReaction.emoji.name) { // give role
			if (!messageReaction.message.guild.roles.cache.has(role_map_object[i].role_id)) { // guild has role
				clear_user_reactions(client, guild_list, messageReaction, user);
				return { result: false, value: `role ${role_map_object[i].give} does not exist` };
			}
			if (current_member.roles.cache.has(role_map_object[i].role_id)) { // member has role
				clear_user_reactions(client, guild_list, messageReaction, user);
				return { result: false, value: `you already have role ${role_map_object[i].give}` };
			}

			const role = messageReaction.message.guild.roles.cache
				.find(cached_role => cached_role.id === role_map_object[i].role_id);
			if (!role) return { result: false, value: `could not fetch role` };

			try {
				current_member.roles.add(role);
			}
			catch (error) {
				clear_user_reactions(client, guild_list, messageReaction, user);
				return { result: false, value: `failed to add role ${role_map_object[i].give}` };
			}

			clear_user_reactions(client, guild_list, messageReaction, user);
			return { result: true, value: `you have been added to role ${role_map_object[i].give}` };
		}
		else if (role_map_object[i].strip === messageReaction.emoji.name) {

			if (!messageReaction.message.guild.roles.cache.has(role_map_object[i].role_id)) { // guild has role
				clear_user_reactions(client, guild_list, messageReaction, user);
				return { result: false, value: `role ${role_map_object[i].strip} does not exist` };
			}
			if (!current_member.roles.cache.has(role_map_object[i].role_id)) { // member does not has role
				clear_user_reactions(client, guild_list, messageReaction, user);
				return { result: false, value: `you do not have role ${role_map_object[i].strip}` };
			}

			const role = messageReaction.message.guild.roles.cache
				.find(cached_role => cached_role.id === role_map_object[i].role_id);
			if (!role) return { result: false, value: `could not fetch role` };

			try {
				current_member.roles.remove(role);
			}
			catch (error) {
				clear_user_reactions(client, guild_list, messageReaction, user);
				return { result: false, value: `failed to remove role ${role_map_object[i].strip}` };
			}

			clear_user_reactions(client, guild_list, messageReaction, user);
			return { result: true, value: `you have been striped from role ${role_map_object[i].strip}` };
		}
	}
	return { result: false, value: 'could complete action' };
};

function reaction_music_manager(client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User) {
	if (!messageReaction.message.guild) return { result: false, value: 'message has no guild' };
	if (!client.voice) return { result: false, value: 'message has no client' };
	if (!messageReaction.message.guild) return { result: false, value: 'message has no guild' };

	const guild_object = guild_list.find(g => {
		if (messageReaction && messageReaction.message && messageReaction.message.guild)
			return g.id === messageReaction.message.guild.id;
	});
	if (!guild_object) return { result: false, value: 'message is not role giving' };
	if (!guild_object.music_data) return { result: false, value: 'message has no music_data' };
	if (!guild_object.music_data.votes) return { result: false, value: 'message has no music votes' };

	let voice_connection_in_reaction_guild: VoiceConnection | undefined = undefined;

	if (messageReaction.emoji.name !== '📜' && messageReaction.emoji.name !== '❌') {
		if (guild_object.music_data.message_id !== messageReaction.message.id) {
			return { result: false, value: 'message is not music player' };
		}
		voice_connection_in_reaction_guild = client.voice.connections.find((connection: VoiceConnection) => {
			if (!messageReaction.message || !messageReaction.message.guild) return false;
			return connection.channel.guild.id === messageReaction.message.guild.id;
		});
		if (!voice_connection_in_reaction_guild) {
			clear_user_reactions(client, guild_list, messageReaction, user);
			return { result: false, value: 'portal is not playing music write now' };
		}
		const is_member_in_same_channel_as_portal = voice_connection_in_reaction_guild.channel.members
			.some(member => {
				console.log(member.id, ' === ', user.id);
				return member.id === user.id;
			});
		if (!is_member_in_same_channel_as_portal) {
			clear_user_reactions(client, guild_list, messageReaction, user);
			return { result: false, value: 'you must be in the same channel with portal to control music' };
		}
	}
	const return_value = { result: true, value: '' };

	switch (messageReaction.emoji.name) {
		case '▶️': {
			return_value.value = 'resuming player';
			play(messageReaction.message.guild.id, guild_list,
				client, messageReaction.message.guild);
			break;
		}
		case '⏸': {
			return_value.value = 'pausing player';
			pause(messageReaction.message.guild.id, guild_list);
			break;
		}
		case '⏹': {
			if (!voice_connection_in_reaction_guild) {
				return_value.value = 'could not find voice connection';
				break;
			}
			if (guild_object.dispatcher !== null && guild_object.dispatcher !== undefined) {
				return_value.value = 'player is not connected';
				break;
			}
			if (!guild_object.music_data.votes.includes(user.id)) {
				guild_object.music_data.votes.push(user.id);
			}

			const votes = guild_object.music_data.votes.length;
			const users = voice_connection_in_reaction_guild?.channel.members
				.filter(member => !member.user.bot).size;

			if (votes >= users / 2) {
				return_value.value = 'stopping player (majority)';
				stop(messageReaction.message.guild.id, guild_list,
					messageReaction.message.guild);
				guild_object.music_data.votes = [];
			}
			else if (user.presence?.member?.hasPermission('ADMINISTRATOR')) {
				return_value.value = 'stopping player (admin)';
				stop(messageReaction.message.guild.id, guild_list,
					messageReaction.message.guild);
				guild_object.music_data.votes = [];
			}
			else {
				return_value.value = `${votes}/${users / 2} (majority or admin authorization needed to stop)`;
			}
			break;
		}
		case '⏭': {
			if (!voice_connection_in_reaction_guild) {
				return_value.value = 'could not find voice connection';
				break;
			}
			if (guild_object.dispatcher !== null && guild_object.dispatcher !== undefined) {
				return_value.value = 'player is not connected';
				break;
			}
			if (!guild_object.music_data.votes.includes(user.id)) {
				guild_object.music_data.votes.push(user.id);
			}

			const votes = guild_object.music_data.votes.length;
			const users = voice_connection_in_reaction_guild.channel.members
				.filter(member => !member.user.bot).size;

			if (votes >= users / 2) {
				return_value.value = 'skipping video (majority)';
				skip(messageReaction.message.guild.id, guild_list,
					client, messageReaction.message.guild);
				guild_object.music_data.votes = [];
			}
			else if (user.presence?.member?.hasPermission('ADMINISTRATOR')) {
				return_value.value = 'skipping video (admin)';
				skip(messageReaction.message.guild.id, guild_list,
					client, messageReaction.message.guild);
				guild_object.music_data.votes = [];
			}
			else {
				return_value.value = `${votes}/${users / 2} (majority or admin authorization needed to skip)`;
			}
			break;
		}
		case '📜': {
			const current_music_queue = guild_object.music_queue;
			const music_queue = current_music_queue.length > 0
				? '\n' + current_music_queue.map((video, i) => `${i + 1}. **${video.title}`).join('**\n').toString() + '**'
				: ' empty';
			return_value.value = `Music queue:${music_queue}`;
			break;
		}
		case '❌': {
			guild_object.music_queue = [];
			return_value.value = 'Music queue: has been cleared.';
			break;
		}
	}

	clear_user_reactions(client, guild_list, messageReaction, user);
	return return_value;
};

module.exports = async (client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User) => {
	if (user.bot) return null;

	if (messageReaction.partial) {
		try {
			await messageReaction.fetch();
		} catch (error) {
			return {
				result: false,
				value: 'Something went wrong when fetching the message: ' + error,
			};
		}
	}

	const return_value_role = reaction_role_manager(client, guild_list, messageReaction, user);
	if (return_value_role.result !== null) {
		return return_value_role;
	}

	const return_value_music = reaction_music_manager(client, guild_list, messageReaction, user);
	if (return_value_music.result !== null) {
		return return_value_music;
	}
};