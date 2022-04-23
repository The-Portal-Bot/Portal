import { Client, Message, TextChannel } from "discord.js";
import { createMusicLyricsMessage, createMusicMessage, isMessageDeleted, markMessageAsDeleted } from "../libraries/help.library";
import { fetch_guild, remove_poll, remove_vendor } from "../libraries/mongo.library";

module.exports = async (
	args: { client: Client, message: Message }
): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (args.message.guild) {
			fetch_guild(args.message.guild.id)
				.then(guild_object => {
					if (!guild_object) {
						return reject('could not find guild');
					}

					const role_list = guild_object.role_list;
					const music_data = guild_object.music_data;

					if (music_data.message_id === args.message.id) {
						const music_channel = <TextChannel>args.message.guild?.channels.cache
							.find(channel => channel.id === guild_object.music_data.channel_id);

						if (music_channel) {
							createMusicMessage(music_channel, guild_object)
								.then(() => {
									if (guild_object.music_data.message_lyrics_id) {
										if (music_channel) {
											music_channel.messages
												.fetch(guild_object.music_data.message_lyrics_id)
												.then(async (message_lyrics: Message) => {
													if (isMessageDeleted(message_lyrics)) {
														const deletedMessage = await message_lyrics
															.delete()
															.catch((e: any) => {
																return reject(`failed to delete message: ${e}`);
															});

														if (deletedMessage) {
															markMessageAsDeleted(deletedMessage);
															return resolve(`deleted lyrics message`);
														}
													}
												})
												.catch(e => {
													return reject(`error creating lyrics message: ${e}`);
												});
										}
									}
								})
								.catch(e => {
									return reject(`failed to send music message: ${e}`);
								});
						} else {
							return reject('could not find channel');
						}
					} else if (music_data.message_lyrics_id === args.message.id) {
						const music_channel = <TextChannel>args.message?.guild?.channels.cache
							.find(channel => channel.id === guild_object.music_data.channel_id);

						if (music_channel && guild_object.music_data.message_id) {
							createMusicLyricsMessage(music_channel, guild_object, guild_object.music_data.message_id)
								.then(() => {
									return resolve('created lyrics message');
								})
								.catch(e => {
									return reject(`error creating lyrics message: ${e}`);
								});
						}
					} else if (guild_object.poll_list.some(p => p.message_id === args.message.id)) {
						const poll = guild_object.poll_list.find(p => p.message_id === args.message.id);

						if (poll) {
							remove_poll(guild_object.id, args.message.id)
								.then(r => {
									if (r) {
										return resolve('successfully removed poll');
									} else {
										return reject('failed to remove poll');
									}
								})
								.catch(e => {
									return reject(`failed to remove poll: ${e}`);
								});
						}
					} else {
						role_list.find(role_giver => {
							if (role_giver.message_id === args.message.id) {
								remove_vendor(guild_object.id, role_giver.message_id)
									.then(r => {
										if (r) {
											return resolve('successfully deleted role message');
										} else {
											return reject('failed to delete role message');
										}
									})
									.catch(e => {
										return reject(`failed to delete role message: ${e}`);
									});
							}
						});
					}

				})
				.catch(e => {
					return reject(`failed to fetch guild: ${e}`);
				});
		} else {
			return reject(`message's guild could not be fetched`);
		}
	});
};