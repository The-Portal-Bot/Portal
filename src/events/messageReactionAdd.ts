import { GuildEmoji, ReactionEmoji } from "discord.js";
import { Client, Collection, MessageReaction, User } from "discord.js";
import { get_role } from "../libraries/guildOps";
import { create_rich_embed, is_authorised, is_dj, update_music_message } from "../libraries/helpOps";
import { clear_music_vote, fetch_guild_reaction_data, insert_music_vote, remove_poll, update_guild } from "../libraries/mongoOps";
import { pause, play, skip, volume_down, volume_up } from "../libraries/musicOps";
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
): Promise<{ promise: ReturnPormise, animated: boolean }> {
	return new Promise((resolve) => {
		if (!messageReaction.message.guild) {
			return resolve({
				promise: {
					result: false,
					value: 'could not fetch message\'s guild'
				},
				animated: false
			});
		}

		if (!guild_object.music_data) {
			return resolve({
				promise: {
					result: false,
					value: 'guild has no music channel'
				},
				animated: false
			});
		}

		if (guild_object.music_data.message_id !== messageReaction.message.id) {
			return resolve({
				promise: {
					result: false,
					value: 'message is not music player'
				},
				animated: false
			});
		}

		const member_object = guild_object.member_list
			.find(m => m.id === user.id);

		const portal_voice_connection = client.voice?.connections
			.find(c => c.channel.guild.id === messageReaction.message?.guild?.id);

		if (portal_voice_connection) {
			if (!portal_voice_connection.channel.members.has(user.id)) {
				return resolve({
					promise: {
						result: false,
						value: 'you must be in the same channel as Portal'
					},
					animated: false
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
						clear_music_vote(guild_object.id);

						return resolve({ promise: r, animated: false });
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							promise: {
								result: false,
								value: `error while playing (${e})`
							},
							animated: true
						});
					});

				break;
			}
			case '⏸': {
				pause(portal_voice_connection)
					.then(r => {
						clear_music_vote(guild_object.id);

						return resolve({ promise: r, animated: false });
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							promise: {
								result: false,
								value: `error while pausing (${e})`
							},
							animated: false
						});
					});

				break;
			}
			case '⏭': {
				if (!portal_voice_connection) {
					return resolve({
						promise: {
							result: false,
							value: 'nothing to skip, player is idle'
						},
						animated: false
					})
				}

				if (!guild_object.music_data.votes) {
					return resolve({
						promise: {
							result: false,
							value: 'could not fetch music votes'
						},
						animated: false
					})
				}

				const guild = client.guilds.cache
					.find(g => g.id === guild_object.id);

				if (!guild) {
					return resolve({
						promise: {
							result: false,
							value: `could not fetch guild`
						},
						animated: false
					});
				}

				const member = guild.members.cache
					.find(m => m.id === user.id);

				if (!member) {
					return resolve({
						promise: {
							result: false,
							value: `could not fetch memeber`
						},
						animated: false
					});
				}

				let reason = 'none';

				if (!is_dj(member)) {
					if (!is_authorised(member)) {
						if (!guild_object.music_data.votes.includes(user.id)) {
							guild_object.music_data.votes.push(user.id);
							insert_music_vote(guild_object.id, user.id);
						}

						const votes = guild_object.music_data.votes.length;
						const users = portal_voice_connection?.channel?.members
							.filter(member => !member.user.bot).size;

						if (!(votes < users / 2)) {
							return resolve({
								promise: {
									result: false,
									value: `${votes}/${Math.round(users / 2)} votes required`
								},
								animated: false
							});
						} else {
							reason = 'vote'
						}
					} else {
						reason = 'admin'
					}
				} else {
					reason = 'DJ'
				}

				skip(
					portal_voice_connection, user, client,
					messageReaction.message.guild, guild_object
				)
					.then(r => {
						clear_music_vote(guild_object.id);
						guild_object.music_queue.shift();
						return resolve({
							promise: {
								result: r.result,
								value: r.value + ` (by ${reason})`
							},
							animated: r.result
						});
					})
					.catch(e => {
						return resolve({
							promise: {
								result: false,
								value: `error while skipping (${e})`
							},
							animated: false
						})
					});

				break;
			}
			case '➖': {
				volume_down(portal_voice_connection)
					.then(r => {
						clear_music_vote(guild_object.id);

						return resolve({ promise: r, animated: r.result });
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							promise: {
								result: false,
								value: `error while decreasing volume (${e})`
							},
							animated: false
						});
					});

				break;
			}
			case '➕': {
				volume_up(portal_voice_connection)
					.then(r => {
						clear_music_vote(guild_object.id);

						return resolve({ promise: r, animated: r.result });
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							promise: {
								result: false,
								value: `error while increasing volume (${e})`
							},
							animated: false
						});
					});

				break;
			}
			case '🧹': {
				if (guild_object.music_queue.length > 1) {
					guild_object.music_queue.splice(1, guild_object.music_queue.length);
					update_guild(guild_object.id, 'music_queue', guild_object.music_queue);

					const guild = client.guilds.cache
						.find(g => g.id === guild_object.id);

					if (!guild) {
						clear_music_vote(guild_object.id);

						return resolve({
							promise: {
								result: false,
								value: 'could fetch guild from client'
							},
							animated: false
						});
					}
				}

				clear_music_vote(guild_object.id);

				return resolve({
					promise: {
						result: true,
						value: 'queue has been cleared'
					},
					animated: false
				});

				break;
			}
			case '🚪': {
				pause(portal_voice_connection)
					.then(r => {
						if (portal_voice_connection) {
							guild_object.music_queue = [];
							update_guild(guild_object.id, 'music_queue', guild_object.music_queue);
							portal_voice_connection.disconnect();
						}

						clear_music_vote(guild_object.id);

						return resolve({
							promise: {
								result: true,
								value: 'Portal has been disconnected'
							},
							animated: false
						});
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							promise: {
								result: false,
								value: `Portal failed to get disconnected (${e})`
							},
							animated: false
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
									clear_user_reactions(args.messageReaction, args.user);

									return resolve(r);
								})
								.catch(e => {
									clear_user_reactions(args.messageReaction, args.user);

									return resolve(e);
								});
						} else if (guild_object.music_data.message_id === args.messageReaction.message.id) {
							reaction_music_manager(args.client, guild_object, args.messageReaction, args.user)
								.then(r => {
									if (args.messageReaction.message.guild) {
										update_music_message(
											args.messageReaction.message.guild,
											guild_object,
											guild_object.music_queue.length > 0
												? guild_object.music_queue[0]
												: undefined,
											r.promise.value,
											r.animated
										);
									}

									clear_user_reactions(args.messageReaction, args.user);

									return resolve(r.promise);
								})
								.catch(e => {
									if (args.messageReaction.message.guild) {
										update_music_message(
											args.messageReaction.message.guild,
											guild_object,
											guild_object.music_queue.length > 0
												? guild_object.music_queue[0]
												: undefined,
											`error while handling music reaction (${e})`
										);
									}

									clear_user_reactions(args.messageReaction, args.user);

									return resolve(e);
								});
						} else if (args.messageReaction.emoji.name === '🏁' &&
							guild_object.poll_list.some(p => p.message_id === args.messageReaction.message.id)) {
							const poll = guild_object.poll_list.find(p =>
								p.message_id === args.messageReaction.message.id);

							if (poll && args.user.id === poll.member_id) {
								const winner: MessageReaction[] = [];
								let count: number = 0;

								args.messageReaction.message.reactions.cache
									.filter(r => r.emoji.name !== '🏁' && r.count !== 1)
									.sort((a, b) => (b.count ? b.count : 0) - (a.count ? a.count : 0))
									.forEach((value: MessageReaction, key: string, map: Map<string, MessageReaction>) => {
										if (winner.length === 0) {
											count = value.count ? value.count : 0;
											winner.push(value);
										} else {
											if ((winner[0] ? winner[0].count : 0) === (value ? value.count : 0)) {
												winner.push(value);
											}
										}
									});

								const message = winner.length > 0
									? `Poll outcome ${winner.length > 1 ? 'are options' : 'is option'} ` +
									`${winner.map(r => r.emoji).join(', ')} ` +
									`with ${(count) - 1} ${(count - 1 > 1 ? 'votes' : 'vote')}`
									: `Noboody voted`;

								args.messageReaction.message.channel.send(
									create_rich_embed(
										null,
										null,
										'#ffa500',
										null,
										null,
										null,
										false,
										null,
										null,
										undefined,
										{
											name: message,
											icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/firework.gif'
										}
									));

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
											value: `error while removing poll (${e})`
										});
									});
							}
						} else {
							return resolve({
								result: false,
								value: 'message is not controlled by Portal'
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
						value: `failed to fetch message reaction (${e})`
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