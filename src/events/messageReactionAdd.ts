import { Client, MessageReaction, User, VoiceConnection } from "discord.js";
import { get_role } from "../libraries/guildOps";
import { is_authorised, update_music_message } from "../libraries/helpOps";
import { clear_music_vote, fetch_guild, insert_music_vote } from "../libraries/mongoOps";
import { pause, play, skip, stop } from "../libraries/musicOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function clear_user_reactions(
	messageReaction: MessageReaction, user: User
) {
	messageReaction.message.reactions.cache
		.forEach(reaction => reaction.users.remove(user.id));
};

function reaction_role_manager(
	guild_object: GuildPrtl, messageReaction: MessageReaction, user: User
): ReturnPormise {
	if (!messageReaction.message.guild) return { result: false, value: 'message has no guild' };

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
					catch (e) {
						result = false;
						value = `failed to assign you, to role ${role_map.role_id}`;
					}
					clear_user_reactions(messageReaction, user);
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
					catch (e) {
						result = false;
						value = `failed to strip role ${role_map.role_id}`;
					}
					clear_user_reactions(messageReaction, user);
					return true;
				}
			} // gave other emote
		}
		return false;
	});

	return { result: result, value: value };
};

async function reaction_music_manager(client: Client, guild_object: GuildPrtl, messageReaction: MessageReaction, user: User): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!messageReaction.message.guild) return resolve({ result: false, value: 'could not fetch message\'s guild' });
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
			clear_user_reactions(messageReaction, user);
			return resolve({ result: false, value: 'portal is not connected' });
		}

		const is_member_in_same_channel_as_portal = portal_voice_vonnection.channel.members
			.some(member => member.id === user.id);
		if (!is_member_in_same_channel_as_portal) {
			clear_user_reactions(messageReaction, user);
			return resolve({ result: false, value: 'you must be in the same channel with portal to control music' });
		}

		switch (messageReaction.emoji.name) {
			case '▶️': {
				clear_user_reactions(messageReaction, user);

				play(guild_object, client, messageReaction.message, messageReaction.message.guild)
					.then(r => { return resolve(r); })
					.catch(e => { return resolve({ result: false, value: e }); });
				break;
			}
			case '⏸': {
				clear_user_reactions(messageReaction, user);

				pause(guild_object)
					.then(r => { return resolve(r); })
					.catch(e => { return resolve({ result: false, value: e }); });
				break;
			}
			case '⏹': {
				clear_user_reactions(messageReaction, user);

				if (!guild_object.music_data.votes.includes(user.id))
					insert_music_vote(guild_object.id, user.id);
				// guild_object.music_data.votes.push(user.id); // update

				// HAS THE VOTE BEEN CASTED
				const votes = guild_object.music_data.votes.length;
				const users = portal_voice_vonnection?.channel?.members
					.filter(member => !member.user.bot).size;

				if (votes >= users / 2) {
					return stop(guild_object, messageReaction.message.guild)
						.then(r => { guild_object.music_data.votes = []; return resolve(r) })
						.catch(e => { return resolve({ result: false, value: e }) });
				}

				const guild = client.guilds.cache.find(g => g.id === guild_object.id);
				if (!guild) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to stop)` });
				const member = guild.members.cache.find(m => m.id === user.id);
				if (!member) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to stop)` });

				if ((member_object && member_object.dj) || is_authorised(guild_object, member)) {
					return stop(guild_object, messageReaction.message.guild)
						.then(r => { clear_music_vote(guild_object.id); return resolve(r) })
						.catch(e => { return resolve({ result: false, value: e }) });
				}

				return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to stop)` });
			}
			case '⏭': {
				clear_user_reactions(messageReaction, user);

				if (!guild_object.music_data.votes.includes(user.id))
					insert_music_vote(guild_object.id, user.id);
				// guild_object.music_data.votes.push(user.id);

				const votes = guild_object.music_data.votes.length;
				const users = portal_voice_vonnection?.channel?.members.filter(member => !member.user.bot).size;

				if (votes >= users / 2) {
					return skip(guild_object, client, messageReaction.message, messageReaction.message.guild)
						.then(r => { clear_music_vote(guild_object.id); return resolve(r) })
						.catch(e => { return resolve({ result: false, value: e }) });
				}

				const guild = client.guilds.cache.find(g => g.id === guild_object.id);
				if (!guild) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)` });
				const member = guild.members.cache.find(m => m.id === user.id);
				if (!member) return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)` });

				if ((member_object && member_object.dj) || is_authorised(guild_object, member)) {
					return skip(guild_object, client, messageReaction.message, messageReaction.message.guild)
						.then(r => { clear_music_vote(guild_object.id); return resolve(r) })
						.catch(e => { return resolve({ result: false, value: e }) });
				}

				return resolve({ result: false, value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)` });
			}
			case '📜': {
				clear_user_reactions(messageReaction, user);

				const current_music_queue = guild_object.music_queue;
				const music_queue = current_music_queue.length > 0
					? '\n' + current_music_queue.map((video, i) => `${i + 1}. **${video.title}`).join('**\n') + '**'
					: ' empty';

				return resolve({ result: true, value: `music queue: ${music_queue}` });
			}
			case '🧹': {
				clear_user_reactions(messageReaction, user);

				if (guild_object.music_queue.length > 1) {
					guild_object.music_queue.splice(1, guild_object.music_queue.length);
					const guild = client.guilds.cache.find(g => g.id === guild_object.id);
					if (!guild) return resolve({ result: false, value: 'could fetch guild from client' });
					update_music_message(guild, guild_object, guild_object.music_queue[0]);
				}

				return resolve({ result: true, value: 'music queue has been cleared' });
			}
			case '❌': {
				clear_user_reactions(messageReaction, user);

				// client_talk(client, guild_list, 'leave');
				stop(guild_object, messageReaction.message.guild)
					.then(r => {
						if (portal_voice_vonnection) {
							portal_voice_vonnection.disconnect();
							guild_object.music_queue = [];
						}
						return resolve({ result: true, value: 'leaving voice channel' });
					})
					.catch(e => { return resolve({ result: false, value: e }) });
			}
		}
	});
};

module.exports = async (
	args: { client: Client, messageReaction: MessageReaction, user: User }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.user.bot) {
			return resolve({ 
				result: true, 
				value: 'not handling bot reactions' });
		} else if (args.messageReaction?.message?.guild) {
			const current_guild = args.messageReaction.message.guild;
			fetch_guild(current_guild.id)
				.then(guild_object => {
					if (guild_object) {
						if (args.messageReaction.partial) {
							try {
								args.messageReaction.fetch();
							} catch (e) {
								return resolve({
									result: false,
									value: 'something went wrong when fetching the message: ',
								});
							}
						}

						if (current_guild) {
							fetch_guild(current_guild.id)
								.then(guild_object => {
									if (guild_object) {
										const return_value_role = reaction_role_manager(guild_object, args.messageReaction, args.user);
										if (return_value_role.result) return resolve(return_value_role);

										const return_value_music = reaction_music_manager(args.client, guild_object, args.messageReaction, args.user);
										return resolve(return_value_music);
									} else {
										return resolve({
											result: false,
											value: 'could not find guild in portal'
										});
									}
								})
								.catch(e => {
									return resolve({
										result: false,
										value: 'error when searching for guild'
									});
								});
						} else {
							return resolve({
								result: false,
								value: 'could not fetch guild of message'
							});
						}
					}
				});
		} else {
			return resolve({
				result: false,
				value: `could not fetch guild`
			});
		}
	});
};