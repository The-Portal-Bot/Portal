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

					const pRoles = pGuild.pRoles;
					const pMusicData = pGuild.musicData;

					if (pMusicData.messageId === args.message.id) {
						const musicChannel = <TextChannel>args.message.guild?.channels.cache
							.find(channel => channel.id === pGuild.musicData.channelId);

						if (musicChannel) {
							createMusicMessage(musicChannel, pGuild)
								.then(() => {
									if (pGuild.musicData.messageLyricsId) {
										if (musicChannel) {
											musicChannel.messages
												.fetch(pGuild.musicData.messageLyricsId)
												.then(async (messageLyrics: Message) => {
													if (isMessageDeleted(messageLyrics)) {
														const deletedMessage = await messageLyrics
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
					} else if (pMusicData.messageLyricsId === args.message.id) {
						const musicChannel = <TextChannel>args.message?.guild?.channels.cache
							.find(channel => channel.id === pGuild.musicData.channelId);

						if (musicChannel && pGuild.musicData.messageId) {
							createMusicLyricsMessage(musicChannel, pGuild, pGuild.musicData.messageId)
								.then(() => {
									return resolve('created lyrics message');
								})
								.catch(e => {
									return reject(`error creating lyrics message: ${e}`);
								});
						}
					} else if (pGuild.pPolls.some(p => p.messageId === args.message.id)) {
						const poll = pGuild.pPolls.find(p => p.messageId === args.message.id);

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
						pRoles.find(roleGiver => {
							if (roleGiver.messageId === args.message.id) {
								removeVendor(pGuild.id, roleGiver.messageId)
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