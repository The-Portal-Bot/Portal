import { Client, Message, TextChannel } from "discord.js";
import { createMusicLyricsMessage, createMusicMessage, isMessageDeleted, markMessageAsDeleted } from "../libraries/help.library";
import { fetchGuild, removePoll, removeVendor } from "../libraries/mongo.library";

module.exports = async (
	args: { client: Client, message: Message }
): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (args.message.guild) {
			fetchGuild(args.message.guild.id)
				.then(pGuild => {
					if (!pGuild) {
						return reject('could not find guild');
					}

					const role_list = pGuild.roleList;
					const music_data = pGuild.musicData;

					if (music_data.messageId === args.message.id) {
						const music_channel = <TextChannel>args.message.guild?.channels.cache
							.find(channel => channel.id === pGuild.musicData.channelId);

						if (music_channel) {
							createMusicMessage(music_channel, pGuild)
								.then(() => {
									if (pGuild.musicData.messageLyricsId) {
										if (music_channel) {
											music_channel.messages
												.fetch(pGuild.musicData.messageLyricsId)
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
					} else if (music_data.messageLyricsId === args.message.id) {
						const music_channel = <TextChannel>args.message?.guild?.channels.cache
							.find(channel => channel.id === pGuild.musicData.channelId);

						if (music_channel && pGuild.musicData.messageId) {
							createMusicLyricsMessage(music_channel, pGuild, pGuild.musicData.messageId)
								.then(() => {
									return resolve('created lyrics message');
								})
								.catch(e => {
									return reject(`error creating lyrics message: ${e}`);
								});
						}
					} else if (pGuild.pollList.some(p => p.messageId === args.message.id)) {
						const poll = pGuild.pollList.find(p => p.messageId === args.message.id);

						if (poll) {
							removePoll(pGuild.id, args.message.id)
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
							if (role_giver.messageId === args.message.id) {
								removeVendor(pGuild.id, role_giver.messageId)
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