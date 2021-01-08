import { Client, MessageReaction, User, VoiceConnection } from "discord.js";
import { pause, play, skip, stop } from "../libraries/musicOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import { get_role } from "../libraries/guildOps";

function clear_user_reactions(client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User) {
	messageReaction.message.reactions.cache.forEach(reaction => reaction.users.remove(user.id));
};

function reaction_role_manager(client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User): ReturnPormise {
	if (!messageReaction.message.guild) return { result: false, value: 'message has no guild' };
	const guild_object = guild_list.find(g => {
		if (messageReaction && messageReaction.message && messageReaction.message.guild)
			return g.id === messageReaction.message.guild.id;
		return false;
	});
	if (!guild_object) return { result: false, value: 'message is not role giving' };

	const role_list_object = guild_object.role_list.find(r => {
		return r.message_id === messageReaction.message.id;
	});

	if (!role_list_object) return { result: false, value: 'is not a role giving message' };

	const current_member = messageReaction.message.guild.members.cache.find(member => member.id === user.id);
	if (!current_member) return { result: false, value: 'could not find member' };

	let result = false;
	let value = 'failed to give role';

	const found_role = role_list_object.role_emote_map.some(role_map => {
		if (messageReaction.message.guild) {
			if (role_map.give === messageReaction.emoji.name) { // give role
				const role_to_give = get_role(messageReaction?.message?.guild, role_map.role_id);
				if (role_to_give) {
					try {
						current_member.roles.add(role_to_give);
						result = true;
						value = `you have been assigned to ${role_map.role_id}`;
					}
					catch (error) {
						clear_user_reactions(client, guild_list, messageReaction, user);
						result = false;
						value = `failed to assign you, to role ${role_map.role_id}`;
					}
					return true;
				}
			} else if (role_map.strip === messageReaction.emoji.name) {
				const role_to_strip = get_role(messageReaction?.message?.guild, role_map.role_id);
				if (role_to_strip) {
					try {
						current_member.roles.remove(role_to_strip);
						result = true;
						value = `you have been stripped off ${role_map.role_id}`;
					}
					catch (error) {
						clear_user_reactions(client, guild_list, messageReaction, user);
						result = false;
						value = `failed to strip role ${role_map.role_id}`;
					}
					return true;
				}
			} // gave other emote
		}
		return false;
	});

	if (found_role)
		return { result: result, value: value };
	else
		return { result: false, value: 'could not find role' };
};

function reaction_music_manager(client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User) {
	if (!messageReaction.message.guild) return { result: false, value: 'message has no guild' };
	if (!client.voice) return { result: false, value: 'message has no client' };

	const guild_object = guild_list.find(g => {
		if (messageReaction && messageReaction.message && messageReaction.message.guild)
			return g.id === messageReaction.message.guild.id;
	});
	if (!guild_object) return { result: false, value: 'message is not role giving' };
	if (!guild_object.music_data) return { result: false, value: 'message has no music_data' };
	if (!guild_object.music_data.votes) guild_object.music_data.votes = [];
	if (guild_object.music_data.message_id !== messageReaction.message.id) {
		return { result: false, value: 'message is not music player' };
	}

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
			if (!guild_object.dispatcher) {
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

module.exports = async (
	args: { client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User }
) => {
	return new Promise((resolve) => {
		if (args.user.bot) return resolve({ result: false, value: '' });

		if (args.messageReaction.partial) {
			try {
				args.messageReaction.fetch();
			} catch (error) {
				return resolve({
					result: false,
					value: 'Something went wrong when fetching the message: ' + error,
				});
			}
		}

		const return_value_role = reaction_role_manager(args.client, args.guild_list, args.messageReaction, args.user);
		if (return_value_role.result) return resolve(return_value_role);

		const return_value_music = reaction_music_manager(args.client, args.guild_list, args.messageReaction, args.user);
		return resolve(return_value_music);
	});
};