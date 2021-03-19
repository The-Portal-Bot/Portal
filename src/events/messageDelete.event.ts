import { Client, Message, TextChannel } from "discord.js";
import { create_lyrics_message, create_music_message, logger } from "../libraries/help.library";
import { fetch_guild, remove_poll, remove_role_assigner } from "../libraries/mongo.library";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

module.exports = async (
	args: { client: Client, message: Message }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.message.guild) {
			fetch_guild(args.message.guild.id)
				.then(guild_object => {
					if (guild_object) {
						const role_list = guild_object.role_list;
						const music_data = guild_object.music_data;

						if (music_data.message_id === args.message.id) {
							const music_channel = <TextChannel>args.message?.guild?.channels.cache
								.find(channel => channel.id === guild_object.music_data.channel_id);

							if (music_channel) {
								create_music_message(<TextChannel>music_channel, guild_object)
									.then(message_music_id => {
										logger.log({ level: 'info', type: 'none', message: `created music message ${message_music_id}` });
										if (guild_object.music_data.message_lyrics_id) {
											if (music_channel) {
												music_channel.messages
													.fetch(guild_object.music_data.message_lyrics_id)
													.then((message_lyrics: Message) => {
														if (message_lyrics.deletable) {
															message_lyrics.delete()
																.then(() => {
																	logger.log({ level: 'info', type: 'none', message: `deleted lyrics message` });
																	return resolve({
																		result: false,
																		value: `deleted lyrics message`,
																	});
																})
																.catch(e => {
																	logger.log({ level: 'error', type: 'none', message: new Error(`failed to delete lyrics message / ${e}`).message });
																	return resolve({
																		result: false,
																		value: `failed to delete lyrics message / ${e}`,
																	});
																});
														}
													})
													.catch(e => {
														logger.log({ level: 'error', type: 'none', message: new Error(`error creating lyrics message / ${e}`).message });
														return resolve({
															result: false,
															value: `error creating lyrics message / ${e}`,
														});
													});
											}
										}
									})
									.catch(e => {
										logger.log({ level: 'error', type: 'none', message: `failed to send music message / ${e}` });
										return resolve({
											result: false,
											value: `failed to send music message / ${e}`,
										});
									});
							} else {
								return resolve({
									result: false,
									value: 'could not find channel',
								});
							}
						} else if (music_data.message_lyrics_id === args.message.id) {
							const music_channel = <TextChannel>args.message?.guild?.channels.cache
								.find(channel => channel.id === guild_object.music_data.channel_id);

							if (music_channel && guild_object.music_data.message_id) {
								create_lyrics_message(music_channel, guild_object, guild_object.music_data.message_id)
									.then(message_lyrics_id => {
										logger.log({ level: 'info', type: 'none', message: `created lyrics message ${message_lyrics_id}` });
										return resolve({
											result: false,
											value: `created lyrics message`,
										});
									})
									.catch(e => {
										logger.log({ level: 'error', type: 'none', message: new Error(`error creating lyrics message / ${e}`).message });
										return resolve({
											result: false,
											value: `error creating lyrics message / ${e}`,
										});
									});
							}
						} else if (guild_object.poll_list.some(p => p.message_id === args.message.id)) {
							const poll = guild_object.poll_list.find(p => p.message_id === args.message.id);

							if (poll) {
								remove_poll(guild_object.id, args.message.id)
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
							role_list.find(role_giver => {
								if (role_giver.message_id === args.message.id) {
									remove_role_assigner(guild_object.id, role_giver.message_id)
										.then(r => {
											return resolve({
												result: r,
												value: `role message ${r
													? 'deleted successfully'
													: 'failed to be deleted'}`
											})
										})
										.catch(e => resolve({
											result: false,
											value: 'role message was failed to be deleted'
										}));
									return true;
								}
								return false;
							});
						}
					} else {
						return resolve({
							result: false,
							value: `could not fetch guild`
						});
					}
				});
		} else {
			return resolve({
				result: false,
				value: `message ${args.message} was deleted`
			});
		}
	});
};