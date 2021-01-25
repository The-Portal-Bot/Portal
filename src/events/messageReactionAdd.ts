import { Client, MessageReaction, User, VoiceConnection } from "discord.js";
import { get_role } from "../libraries/guildOps";
import { is_authorised, update_music_message } from "../libraries/helpOps";
import { pause, play, skip, stop } from "../libraries/musicOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function clear_user_reactions(
	client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User
) {
	messageReaction.message.reactions.cache.forEach(reaction => reaction.users.remove(user.id));
};

function reaction_role_manager(
	client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User
): ReturnPormise {
	if (!messageReaction.message.guild) return { result: false, value: 'message has no guild' };

	const guild_object = guild_list.find(g => g.id === messageReaction?.message?.guild?.id);
	if (!guild_object) return { result: false, value: 'guild could not be found in guild_list' };

	const role_list_object = guild_object.role_list.find(r => r.message_id === messageReaction.message.id);
	if (!role_list_object) return { result: false, value: 'message is not role assigner' };

	const current_member = messageReaction.message.guild.members.cache.find(member => member.id === user.id);
	if (!current_member) return { result: false, value: 'could not fetch member' };

	let result = false;
	let value = 'failed to give role';

	role_list_object.role_emote_map.some(role_map => {
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
						result = false;
						value = `failed to assign you, to role ${role_map.role_id}`;
					}
					clear_user_reactions(client, guild_list, messageReaction, user);
					return true;
				}
			} else if (role_map.strip === messageReaction.emoji.name) {
				const role_to_strip = get_role(messageReaction?.message?.guild, role_map.role_id);
				if (role_to_strip) {
					try {
						current_member.roles.remove(role_to_strip);
						result = true;
						value = `you no longer have role ${role_map.role_id}`;
					}
					catch (error) {
						result = false;
						value = `failed to strip role ${role_map.role_id}`;
					}
					clear_user_reactions(client, guild_list, messageReaction, user);
					return true;
				}
			} // gave other emote
		}
		return false;
	});

	return { result: result, value: value };
};

async function reaction_music_manager(client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!messageReaction.message.guild) return resolve({ result: false, value: 'could not fetch message\'s guild' });
		const guild_object = guild_list.find(g => g.id === messageReaction?.message?.guild?.id);
		if (!guild_object) return resolve({ result: false, value: 'could not find guild in guild_list' });
		const member_object = guild_object.member_list.find(m => m.id === user.id);
		if (!guild_object.music_data) return resolve({ result: false, value: 'guild has no music channel' });
		if (guild_object.music_data.message_id !== messageReaction.message.id) return resolve({ result: false, value: 'message is not music player' });

		if (!guild_object.music_data.votes) guild_object.music_data.votes = [];
		let portal_voice_vonnection: VoiceConnection | undefined = undefined;

		portal_voice_vonnection = client.voice?.connections
			.find((connection: VoiceConnection) => {
				if (!messageReaction.message.guild) return false;
				return connection.channel.guild.id === messageReaction.message.guild.id;
			});
		if (!portal_voice_vonnection) {
			clear_user_reactions(client, guild_list, messageReaction, user);
			return resolve({ result: false, value: 'portal is not connected' });
		}

		const is_member_in_same_channel_as_portal = portal_voice_vonnection.channel.members.some(member => member.id === user.id);
		if (!is_member_in_same_channel_as_portal) {
			clear_user_reactions(client, guild_list, messageReaction, user);
			return resolve({ result: false, value: 'you must be in the same channel with portal to control music' });
		}

		switch (messageReaction.emoji.name) {
			case '▶️': {
				clear_user_reactions(client, guild_list, messageReaction, user);

				play(guild_object, client, messageReaction.message, messageReaction.message.guild)
					.then(response => { return resolve(response); })
					.catch(error => { return resolve({ result: false, value: error }); });
				break;
			}
			case '⏸': {
				clear_user_reactions(client, guild_list, messageReaction, user);

				pause(guild_object)
					.then(response => { return resolve(response); })
					.catch(error => { return resolve({ result: false, value: error }); });
				break;
			}
			case '⏹': {
				clear_user_reactions(client, guild_list, messageReaction, user);

				if (!guild_object.music_data.votes.includes(user.id))
					guild_object.music_data.votes.push(user.id);

				const votes = guild_object.music_data.votes.length;
				const users = portal_voice_vonnection?.channel?.members.filter(member => !member.user.bot).size;

				if (votes >= users / 2) {
					return stop(guild_object, messageReaction.message.guild)
						.then(response => { guild_object.music_data.votes = []; return resolve(response) })
						.catch(error => { return resolve({ result: false, value: error }) });
				}

				const guild = client.guilds.cache.find(g => g.id === guild_object.id);
				if (!guild) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to stop)` });
				const member = guild.members.cache.find(m => m.id === user.id);
				if (!member) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to stop)` });

				if ((member_object && member_object.dj) || is_authorised(guild_object, member)) {
					return stop(guild_object, messageReaction.message.guild)
						.then(response => { guild_object.music_data.votes = []; return resolve(response) })
						.catch(error => { return resolve({ result: false, value: error }) });
				}

				return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to stop)` });
			}
			case '⏭': {
				clear_user_reactions(client, guild_list, messageReaction, user);

				if (!guild_object.music_data.votes.includes(user.id))
					guild_object.music_data.votes.push(user.id);

				const votes = guild_object.music_data.votes.length;
				const users = portal_voice_vonnection?.channel?.members.filter(member => !member.user.bot).size;

				if (votes >= users / 2) {
					return skip(guild_object, client, messageReaction.message, messageReaction.message.guild)
						.then(response => { guild_object.music_data.votes = []; return resolve(response) })
						.catch(error => { return resolve({ result: false, value: error }) });
				}

				const guild = client.guilds.cache.find(g => g.id === guild_object.id);
				if (!guild) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)` });
				const member = guild.members.cache.find(m => m.id === user.id);
				if (!member) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)` });

				if ((member_object && member_object.dj) || is_authorised(guild_object, member)) {
					return skip(guild_object, client, messageReaction.message, messageReaction.message.guild)
						.then(response => { guild_object.music_data.votes = []; return resolve(response) })
						.catch(error => { return resolve({ result: false, value: error }) });
				}

				return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)` });
			}
			case '📜': {
				clear_user_reactions(client, guild_list, messageReaction, user);

				const current_music_queue = guild_object.music_queue;
				const music_queue = current_music_queue.length > 0
					? '\n' + current_music_queue.map((video, i) => `${i + 1}. **${video.title}`).join('**\n') + '**'
					: ' empty';

				return resolve({ result: true, value: `music queue: ${music_queue}` });
			}
			case '🧹': {
				clear_user_reactions(client, guild_list, messageReaction, user);

				if (guild_object.music_queue.length > 1) {
					guild_object.music_queue.splice(1, guild_object.music_queue.length);
					const guild = client.guilds.cache.find(g => g.id === guild_object.id);
					if (!guild) return resolve({ result: false, value: 'could fetch guild from client' });
					update_music_message(guild, guild_object, guild_object.music_queue[0]);
				}

				return resolve({ result: true, value: 'music queue has been cleared' });
			}
			case '❌': {
				clear_user_reactions(client, guild_list, messageReaction, user);

				// client_talk(client, guild_list, 'leave');
				stop(guild_object, messageReaction.message.guild)
					.then(response => {
						if (portal_voice_vonnection) {
							portal_voice_vonnection.disconnect();
							guild_object.music_queue = [];
						}
						return resolve({ result: true, value: 'leaving voice channel' });
					})
					.catch(error => { return resolve({ result: false, value: error }) });
			}
		}
	});
};

module.exports = async (
	args: { client: Client, guild_list: GuildPrtl[], messageReaction: MessageReaction, user: User }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.user.bot) return null; // resolve({ result: true, value: 'not handling bot reactions' });

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