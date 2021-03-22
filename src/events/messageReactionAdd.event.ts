import { Client, MessageReaction, User } from "discord.js";
import { get_role } from "../libraries/guild.library";
import { create_rich_embed, is_authorised, is_dj, logger, update_music_lyrics_message, update_music_message } from "../libraries/help.library";
import { clear_music_vote, fetch_guild_reaction_data, insert_music_vote, remove_poll, set_music_data, update_guild } from "../libraries/mongo.library";
import { get_lyrics, pause, play, skip, volume_down, volume_up } from "../libraries/music.library";
import { GuildPrtl } from "../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

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
		if (!messageReaction.message.guild) {
			return resolve({
				result: false,
				value: 'message has no guild'
			});
		}

		const role_list_object = guild_object.role_list
			.find(r => r.message_id === messageReaction.message.id);

		if (!role_list_object) {
			return resolve({
				result: false,
				value: 'message is not role assigner'
			});
		}

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
											value: `Portal's role must be higher than role you ` +
												`want to get, contact server admin`
										});
									}
								})
								.catch(e => {
									logger.log({
										level: 'error', type: 'none', message: new Error(`Portal's role must be higher than role you ` +
											`want to get, contact server admin / ${e}`).message
									});
									resolve({
										result: false,
										value: `Portal's role must be higher than role you ` +
											`want to get, contact server admin`
									});
								});
						}
						catch (e) {
							logger.log({ level: 'error', type: 'none', message: new Error(`failed to assign role ${role_map.role_id} / ${e}`).message });
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
											value: `Portal's role must be higher than role you ` +
												`want to be removed from, contact server admin`
										});
									}
								})
								.catch(e => {
									logger.log({
										level: 'error', type: 'none', message: new Error(`Portal's role must be higher than role you ` +
											`want to be removed from, contact server admin / ${e}`).message
									});
									resolve({
										result: false,
										value: `Portal's role must be higher than role you ` +
											`want to be removed from, contact server admin`
									});
								});
						}
						catch (e) {
							logger.log({ level: 'error', type: 'none', message: new Error(`failed to strip role ${role_map.role_id} / ${e}`).message });
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

		const portal_voice_connection = client.voice?.connections
			.find(c => c.channel.guild.id === messageReaction.message?.guild?.id);

		if (portal_voice_connection) {
			if (!portal_voice_connection.channel.members.has(user.id)) {
				return resolve({
					result: false,
					value: 'you must be in the same channel as Portal'
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

						return resolve(r);
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							result: false,
							value: `error while playing / ${e}`
						});
					});

				break;
			}
			case '⏸': {
				pause(portal_voice_connection)
					.then(r => {
						clear_music_vote(guild_object.id);

						return resolve(r);
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							result: false,
							value: `error while pausing / ${e}`
						});
					});

				break;
			}
			case '⏭': {
				if (!portal_voice_connection) {
					update_music_lyrics_message(messageReaction.message.guild, guild_object, '');

					return resolve({
						result: false,
						value: 'nothing to skip, player is idle'
					})
				}

				if (!guild_object.music_data.votes) {
					return resolve({
						result: false,
						value: 'could not fetch music votes'
					})
				}

				const guild = messageReaction.message.guild;
				// const guild = client.guilds.cache
				// 	.find(g => g.id === guild_object.id);

				if (!guild) {
					return resolve({
						result: false,
						value: `could not fetch guild`
					});
				}

				const member = guild.members.cache
					.find(m => m.id === user.id);

				if (!member) {
					return resolve({
						result: false,
						value: `could not fetch memeber`
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
								result: false,
								value: `${votes}/${Math.round(users / 2)} votes required`
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

				if (!guild_object.music_data.pinned) {
					skip(
						portal_voice_connection, user, client,
						messageReaction.message.guild, guild_object
					)
						.then(r => {
							clear_music_vote(guild_object.id);
							guild_object.music_queue.shift();
							return resolve({
								result: r.result,
								value: r.value + ` (by ${reason})`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `error while skipping / ${e}`
							})
						});
				} else {
					guild_object.music_data.pinned = false;
					set_music_data(guild_object.id, guild_object.music_data)
						.then(r => {
							if (!r) {
								return resolve({
									result: false,
									value: guild_object.music_data.pinned
										? 'failed to pin song'
										: 'failed to unpin song'
								});
							} else {
								skip(
									portal_voice_connection, user, client,
									guild, guild_object
								)
									.then(r => {
										clear_music_vote(guild_object.id);
										guild_object.music_queue.shift();
										return resolve({
											result: r.result,
											value: r.value + ` (by ${reason})`
										});
									})
									.catch(e => {
										return resolve({
											result: false,
											value: `error while skipping / ${e}`
										})
									});
							}
						})
						.catch(e => {
							guild_object.music_data.pinned = !guild_object.music_data.pinned;

							return resolve({
								result: false,
								value: !guild_object.music_data.pinned
									? `error occurred while pinning song / ${e}`
									: `error occurred while unpinning song / ${e}`
							});
						});
				}


				break;
			}
			// case '➖': {
			// 	volume_down(portal_voice_connection)
			// 		.then(r => {
			// 			clear_music_vote(guild_object.id);

			// 			return resolve(r);
			// 		})
			// 		.catch(e => {
			// 			clear_music_vote(guild_object.id);

			// 			return resolve({
			// 				result: false,
			// 				value: `error while decreasing volume / ${e}`
			// 			});
			// 		});

			// 	break;
			// }
			// case '➕': {
			// 	volume_up(portal_voice_connection)
			// 		.then(r => {
			// 			clear_music_vote(guild_object.id);

			// 			return resolve(r);
			// 		})
			// 		.catch(e => {
			// 			clear_music_vote(guild_object.id);

			// 			return resolve({
			// 				result: false,
			// 				value: `error while increasing volume / ${e}`
			// 			});
			// 		});

			// 	break;
			// }
			case '📌': {
				guild_object.music_data.pinned = !guild_object.music_data.pinned;

				set_music_data(guild_object.id, guild_object.music_data)
					.then(r => {
						if (!r) {
							guild_object.music_data.pinned = !guild_object.music_data.pinned;
						}

						return resolve({
							result: r,
							value: r
								? guild_object.music_data.pinned
									? 'pinned song'
									: 'unpinned song'
								: !guild_object.music_data.pinned
									? 'failed to pin song'
									: 'failed to unpin song'
						});
					})
					.catch(e => {
						guild_object.music_data.pinned = !guild_object.music_data.pinned;

						return resolve({
							result: false,
							value: !guild_object.music_data.pinned
								? `error occurred while pinning song / ${e}`
								: `error occurred while unpinning song / ${e}`
						});
					});

				break;
			}
			case '📄': {
				get_lyrics(messageReaction.message.guild, guild_object)
					.then(r => {
						return resolve(r);
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `error occurred while fetching lyrics / ${e}`
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
							result: false,
							value: 'could fetch guild from client'
						});
					}
				}

				clear_music_vote(guild_object.id);

				return resolve({
					result: true,
					value: 'queue has been cleared'
				});

				break;
			}
			case '🚪': {
				pause(portal_voice_connection)
					.then(r => {
						if (portal_voice_connection) {
							guild_object.music_queue = [];
							update_guild(guild_object.id, 'music_queue', guild_object.music_queue);
							if (messageReaction.message.guild) {
								update_music_lyrics_message(messageReaction.message.guild, guild_object, '');
							}
							clear_music_vote(guild_object.id);
							portal_voice_connection.disconnect();

							return resolve({
								result: true,
								value: 'Portal has been disconnected'
							});
						} else {
							return resolve({
								result: false,
								value: 'Portal is not connected to a voice channel'
							});
						}
					})
					.catch(e => {
						clear_music_vote(guild_object.id);

						return resolve({
							result: false,
							value: `Portal failed to get disconnected / ${e}`
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
				value: '' // 'not handling bot reactions'
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
									args.messageReaction.message.channel
										.send(`${args.user}, ${r.value}`)
										.then(sent_message => {
											sent_message.delete({ timeout: 7500 });
										})
										.catch(e => {
											logger.log({
												level: 'error', type: 'none', message: new Error(`failed to delete message / ${e}`).message
											});
										});
									return resolve(r);
								})
								.catch(e => {
									clear_user_reactions(args.messageReaction, args.user);
									args.messageReaction.message.channel
										.send(`${args.user}, ${e}`)
										.then(sent_message => {
											sent_message.delete({ timeout: 7500 });
										})
										.catch(e => {
											logger.log({
												level: 'error', type: 'none', message: new Error(`failed to delete message / ${e}`).message
											});
										});
									return resolve(e);
								});
						} else if (guild_object.music_data.message_id === args.messageReaction.message.id) {
							reaction_music_manager(args.client, guild_object, args.messageReaction, args.user)
								.then(r => {
									if (args.messageReaction.message.guild) {
										const portal_voice_connection = args.client.voice?.connections
											.find(c => c.channel.guild.id === args.messageReaction.message.guild?.id);

										const animate = portal_voice_connection?.dispatcher
											? !portal_voice_connection?.dispatcher.paused
											: false;

										update_music_message(
											args.messageReaction.message.guild,
											guild_object,
											guild_object.music_queue.length > 0
												? guild_object.music_queue[0]
												: undefined,
											r.value,
											animate
										);
									}

									clear_user_reactions(args.messageReaction, args.user);

									return resolve(r);
								})
								.catch(e => {
									if (args.messageReaction.message.guild) {
										update_music_message(
											args.messageReaction.message.guild,
											guild_object,
											guild_object.music_queue.length > 0
												? guild_object.music_queue[0]
												: undefined,
											`error while handling music reaction / ${e}`
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
											value: `error while removing poll / ${e}`
										});
									});
							}
						} else {
							return resolve({
								result: true,
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
						value: `failed to fetch message reaction / ${e}`
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