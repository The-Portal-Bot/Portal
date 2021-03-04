import { Client, MessageReaction, User } from "discord.js";
import { get_role } from "../libraries/guildOps";
import { is_authorised, update_music_message } from "../libraries/helpOps";
import { client_talk } from "../libraries/localisationOps";
import { clear_music_vote, fetch_guild_reaction_data, insert_music_vote, remove_poll, update_guild } from "../libraries/mongoOps";
import { pause, play, skip } from "../libraries/musicOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";

function clear_user_reactions(
	messageReaction: MessageReaction, user: User
) {
	messageReaction.message.reactions.cache
		.forEach(reaction => reaction.users.remove(user.id));
};

async function reaction_role_manager(
	guild_object: GuildPrtl, messageReaction: MessageReaction, user: User
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!messageReaction.message.guild) return resolve({
			result: false,
			value: 'message has no guild'
		});

		const role_list_object = guild_object.role_list
			.find(r => r.message_id === messageReaction.message.id);

		if (!role_list_object) return resolve({
			result: false,
			value: 'message is not role assigner'
		});

		const current_member = messageReaction.message.guild.members.cache
			.find(member => member.id === user.id);
		if (!current_member) return resolve({
			result: false,
			value: 'could not fetch member'
		});

		role_list_object.role_emote_map.some(role_map => {
			if (messageReaction.message.guild) {
				if (role_map.give === messageReaction.emoji.name) { // give role
					const role_to_give = get_role(messageReaction?.message?.guild, role_map.role_id);
					if (role_to_give) {
						try {
							current_member.roles.add(role_to_give)
								.then(member => {
									if (!!member) {
										clear_user_reactions(messageReaction, user);

										resolve({
											result: true,
											value: `you have been assigned to ${role_map.role_id}`
										});
									} else {
										resolve({
											result: false,
											value: `portal role must be higher than given role, contact server admin`
										});
									}
								})
								.catch(e => {
									resolve({
										result: false,
										value: `portal role must be higher than given role, contact server admin`
									});
								});
						}
						catch (e) {
							resolve({
								result: false,
								value: `failed to assign you, to role ${role_map.role_id}`
							});
						}
					}
				} else if (role_map.strip === messageReaction.emoji.name) {
					const role_to_strip = get_role(messageReaction?.message?.guild, role_map.role_id);
					if (role_to_strip) {
						try {
							current_member.roles.remove(role_to_strip)
								.then(member => {
									if (!!member) {
										clear_user_reactions(messageReaction, user);

										resolve({
											result: true,
											value: `you have been removed from ${role_map.role_id}`
										});
									} else {
										resolve({
											result: false,
											value: `portal role must be higher than role to remove, contact server admin`
										});
									}
								})
								.catch(e => {
									resolve({
										result: false,
										value: `portal role must be higher than role to remove, contact server admin`
									});
								});
						}
						catch (e) {
							resolve({
								result: false,
								value: `failed to strip role ${role_map.role_id}`
							});
						}
					}
				}
			}
		});
	});
};

async function reaction_music_manager(
	client: Client, guild_object: GuildPrtl, messageReaction: MessageReaction, user: User
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		if (!messageReaction.message.guild) {
			return resolve({
				result: false,
				value: 'could not fetch message\'s guild'
			});
		}

		if (!guild_object.music_data) {
			return resolve({
				result: false,
				value: 'guild has no music channel'
			});
		}

		if (guild_object.music_data.message_id !== messageReaction.message.id) {
			return resolve({
				result: false,
				value: 'message is not music player'
			});
		}

		const member_object = guild_object.member_list
			.find(m => m.id === user.id);

		if (!guild_object.music_data.votes) {
			clear_music_vote(guild_object.id);
		}

		const portal_voice_connection = client.voice?.connections
			.find(c => c.channel.guild.id === messageReaction.message?.guild?.id);

		if (portal_voice_connection) {
			const is_member_in_same_channel_as_portal = portal_voice_connection.channel.members
				.some(member => member.id === user.id);

			if (!is_member_in_same_channel_as_portal) {
				clear_user_reactions(messageReaction, user);
				return resolve({
					result: false,
					value: 'you must be in the same channel with portal to control music'
				});
			}
		}

		switch (messageReaction.emoji.name) {
			case '▶️': {
				play(
					portal_voice_connection, user, client,
					messageReaction.message.guild, guild_object
				)
					.then(r => {
						clear_user_reactions(messageReaction, user);

						return resolve(r);
					})
					.catch(e => {
						clear_user_reactions(messageReaction, user);
						
						return resolve({
							result: false,
							value: e
						});
					});

				break;
			}
			case '⏸': {
				pause(portal_voice_connection, messageReaction.message.guild, guild_object)
					.then(r => {
						clear_user_reactions(messageReaction, user);

						return resolve(r);
					})
					.catch(e => {
						clear_user_reactions(messageReaction, user);

						return resolve({
							result: false,
							value: e
						});
					});

				break;
			}
			// case '⏹': {
			// 	if (!portal_voice_connection) {
			// 		clear_user_reactions(messageReaction, user);
			// 		return resolve({
			// 			result: false,
			// 			value: 'can only stop when with portal'
			// 		})
			// 	}

			// 	if (!guild_object.music_data.votes) {
			// 		clear_user_reactions(messageReaction, user);
			// 		return resolve({
			// 			result: false,
			// 			value: 'could not get music votes'
			// 		})
			// 	}

			// 	if (!guild_object.music_data.votes.includes(user.id)) {
			// 		guild_object.music_data.votes.push(user.id);
			// 		insert_music_vote(guild_object.id, user.id);
			// 	}

			// 	const votes = guild_object.music_data.votes.length;
			// 	const users = portal_voice_connection.channel.members
			// 		.filter(member => !member.user.bot).size;

			// 	if (votes >= users / 2) {
			// 		stop(portal_voice_connection, messageReaction.message.guild, guild_object)
			// 			.then(r => {
			// 				clear_music_vote(guild_object.id);
			// 				return resolve(r);
			// 			})
			// 			.catch(e => {
			// 				clear_user_reactions(messageReaction, user);
			// 				return resolve({
			// 					result: false,
			// 					value: e
			// 				});
			// 			});
			// 	} else {
			// 		const guild = client.guilds.cache.find(g => g.id === guild_object.id);
			// 		if (!guild) {
			// 			clear_user_reactions(messageReaction, user);
			// 			return resolve({
			// 				result: false,
			// 				value: `could not fetch guild`
			// 			});
			// 		}

			// 		const member = guild.members.cache.find(m => m.id === user.id);
			// 		if (!member) {
			// 			clear_user_reactions(messageReaction, user);
			// 			return resolve({
			// 				result: false,
			// 				value: `could not fetch member`
			// 			});
			// 		}

			// 		if ((member_object && member_object.dj) || is_authorised(guild_object, member)) {
			// 			stop(portal_voice_connection, messageReaction.message.guild, guild_object)
			// 				.then(r => {
			// 					clear_music_vote(guild_object.id);
			// 					return resolve(r);
			// 				})
			// 				.catch(e => {
			// 					clear_user_reactions(messageReaction, user);
			// 					return resolve({
			// 						result: false,
			// 						value: e
			// 					});
			// 				});
			// 		}

			// 		clear_user_reactions(messageReaction, user);
			// 		return resolve({
			// 			result: false,
			// 			value: `${votes}/${users / 2} (dj/majority/admin/owner needed to stop)`
			// 		});
			// 	}

			//  break;
			// }
			case '⏭': {
				if (!portal_voice_connection) {
					clear_user_reactions(messageReaction, user);
					return resolve({
						result: false,
						value: 'can only stop when with portal'
					})
				}

				if (!guild_object.music_data.votes) {
					clear_user_reactions(messageReaction, user);
					return resolve({
						result: false,
						value: 'could not get music votes'
					})
				}

				if (!guild_object.music_data.votes.includes(user.id)) {
					guild_object.music_data.votes.push(user.id);
					insert_music_vote(guild_object.id, user.id);
				}

				const votes = guild_object.music_data.votes.length;
				const users = portal_voice_connection?.channel?.members
					.filter(member => !member.user.bot).size;

				if (votes >= users / 2) {
					skip(
						portal_voice_connection, user, client,
						messageReaction.message.guild, guild_object
					)
						.then(r => {
							clear_music_vote(guild_object.id);
							return resolve(r)
						})
						.catch(e => {
							return resolve({
								result: false,
								value: e
							})
						});
					clear_user_reactions(messageReaction, user);
				} else {
					const guild = client.guilds.cache.find(g => g.id === guild_object.id);
					if (!guild) {
						clear_user_reactions(messageReaction, user);
						return resolve({
							result: false,
							value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)`
						});
					}

					const member = guild.members.cache.find(m => m.id === user.id);
					if (!member) {
						clear_user_reactions(messageReaction, user);
						return resolve({
							result: false,
							value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)`
						});
					}

					if ((member_object && member_object.dj) || is_authorised(guild_object.member_list, guild_object.auth_role, member)) {
						skip(portal_voice_connection, user, client,
							messageReaction.message.guild, guild_object)
							.then(r => {
								clear_music_vote(guild_object.id);
								return resolve(r);
							})
							.catch(e => {
								return resolve({
									result: false,
									value: e
								})
							});
						clear_user_reactions(messageReaction, user);
					}
					else {
						clear_user_reactions(messageReaction, user);
						return resolve({
							result: false,
							value: `${votes}/${users / 2} (dj/majority/admin/owner needed to skip)`
						});
					}
				}

				break;
			}
			// case '📜': {
			// 	clear_user_reactions(messageReaction, user);

			// 	const current_music_queue = guild_object.music_queue;
			// 	const music_queue = current_music_queue.length > 0
			// 		? '\n' + current_music_queue.map((video, i) => `${i + 1}. **${video.title}`).join('**\n') + '**'
			// 		: ' empty';

			// 	return resolve({
			// 		result: true,
			// 		value: `music queue: ${music_queue}`
			// 	});
			// }
			case '🧹': {
				if (guild_object.music_queue.length > 1) {
					guild_object.music_queue.splice(1, guild_object.music_queue.length);
					update_guild(guild_object.id, 'music_queue', guild_object.music_queue);

					const guild = client.guilds.cache
						.find(g => g.id === guild_object.id);

					if (!guild) {
						clear_user_reactions(messageReaction, user);
						return resolve({
							result: false,
							value: 'could fetch guild from client'
						});
					}

					update_music_message(
						guild,
						guild_object,
						guild_object.music_queue[0],
						'queue cleared'
					);
				}

				clear_user_reactions(messageReaction, user);
				return resolve({
					result: true,
					value: 'music queue has been cleared'
				});

				break;
			}
			case '🚪': {
				pause(portal_voice_connection, messageReaction.message.guild, guild_object)
					.then(r => {
						if (portal_voice_connection) {
							guild_object.music_queue = [];
							update_guild(guild_object.id, 'music_queue', guild_object.music_queue);
							client_talk(client, guild_object, 'leave');
							setTimeout(
								function () {
									// portal_voice_connection.dispatcher.destroy();
									portal_voice_connection.disconnect();
								},
								4000
							);
						}

						clear_user_reactions(messageReaction, user);
						return resolve({
							result: true,
							value: 'leaving voice channel'
						});
					})
					.catch(e => {
						clear_user_reactions(messageReaction, user);
						return resolve({
							result: false,
							value: e
						})
					});

				break;
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
				result: false,
				value: 'not handling bot reactions'
			});
		}
		else if (args.messageReaction?.message?.guild) {
			const current_guild = args.messageReaction.message.guild;
			fetch_guild_reaction_data(current_guild.id, args.user.id)
				.then(guild_object => {
					if (guild_object) {
						if (args.messageReaction.partial) {
							try {
								args.messageReaction.fetch();
							} catch (e) {
								return resolve({
									result: false,
									value: 'something went wrong when fetching the message'
								});
							}
						}

						if (guild_object.role_list.some(r => r.message_id === args.messageReaction.message.id)) {
							reaction_role_manager(guild_object, args.messageReaction, args.user)
								.then(r => {
									return resolve(r);
								})
								.catch(e => {
									return resolve(e);
								});
						} else if (guild_object.music_data.message_id === args.messageReaction.message.id) {
							reaction_music_manager(args.client, guild_object, args.messageReaction, args.user)
								.then(r => {
									return resolve(r);
								})
								.catch(e => {
									return resolve(e);
								});
						} else if (args.messageReaction.emoji.name === '🏁' &&
							guild_object.poll_list.some(p => p.message_id === args.messageReaction.message.id)) {
							const poll = guild_object.poll_list.find(p =>
								p.message_id === args.messageReaction.message.id);

							if (poll && args.user.id === poll.member_id) {
								const winner = args.messageReaction.message.reactions.cache
									.filter(r => r.emoji.name !== '🏁')
									.reduce((ac: MessageReaction, r: MessageReaction) => {
										if ((ac.count ? ac.count : 0) > (r.count ? r.count : 0)) {
											return ac;
										}
										return r;
									});

								args.messageReaction.message.reply(
									`Poll winner is option ${winner.emoji} with ${winner.count} votes`
								);

								remove_poll(current_guild.id, args.messageReaction.message.id)
									.then(r => {
										return resolve({
											result: r,
											value: r
												? 'successfully removed poll'
												: 'failed to remove poll'
										});
									})
									.catch(e => {
										return resolve({
											result: false,
											value: e
										});
									});
							}
						} else {
							return resolve({
								result: false,
								value: 'message is neither role assigning or music'
							});
						}
					}
					else {
						return resolve({
							result: false,
							value: 'something went wrong with guild object'
						});
					}
				})
				.catch(e => {
					return resolve({
						result: false,
						value: 'failed to fetch message reaction'
					});
				});
		} else {
			return resolve({
				result: false,
				value: `could not fetch guild`
			});
		}
	});
};