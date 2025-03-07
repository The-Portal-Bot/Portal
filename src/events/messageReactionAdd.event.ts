// import { entersState, getVoiceConnection, VoiceConnectionStatus } from "npm:@discordjs/voice";
// import { Client, MessageReaction, Role, User } from "npm:discord.js";
// import { getRole } from "../libraries/guild.library";
// import { createEmbed, isUserAuthorised, isUserDj, logger, updateMusicLyricsMessage, updateMusicMessage } from "../libraries/help.library";
// import { clearMusicVote, fetchGuildReactionData, insertMusicVote, removePoll, setMusicData, updateGuild } from "../libraries/mongo.library";
// // import { export_txt, get_lyrics, pause, play, skip } from "../libraries/music.library";
// import { PGuild } from "../types/classes/PGuild.class";

import logger from "../utilities/log.utility.ts";

// import { Client, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

// function clear_user_reactions(
//     messageReaction: MessageReaction, user: User
// ): Promise<string> {
//     return new Promise((resolve, reject) => {
//         messageReaction.message.reactions.cache
//             .forEach(reaction => {
//                 reaction.users
//                     .remove(user.id)
//                     .catch(e => {
//                         return reject(`failed to create dm channel: ${e}`);
//                     });
//             });
//     });
// }

// async function reaction_role_manager(
//     pGuild: GuildPrtl, messageReaction: MessageReaction, user: User
// ): Promise<string> {
//     return new Promise((resolve, reject) => {
//         if (!messageReaction.message.guild) {
//             return resolve('message has no guild');
//         }

//         const role_list_object = pGuild.role_list
//             .find(r => r.messageId === messageReaction.message.id);

//         if (!role_list_object) {
//             return resolve('message is not role adder');
//         }

//         const current_member = messageReaction.message.guild.members.cache
//             .find(member => member.id === user.id);

//         if (!current_member) {
//             return reject('could not fetch member');
//         }

//         role_list_object.role_emote_map
//             .some(role_map => {
//                 if (messageReaction.message.guild) {
//                     if (role_map.emote === messageReaction.emoji.name) { // give role
//                         const role_array: Role[] = [];
//                         role_map.role.map(role => {
//                             const r = get_role(messageReaction.message.guild, role);
//                             if (r) {
//                                 role_array.push(r);
//                             }
//                         });

//                         if (role_array) {
//                             const has_at_least_one_role = current_member.roles.cache
//                                 .some(member_role => role_array
//                                     .some(role => role && member_role.id === role.id));

//                             if (has_at_least_one_role) {
//                                 try {
//                                     current_member.roles
//                                         .remove(role_array)
//                                         .then(member => {
//                                             if (member) {
//                                                 return resolve(`you have been removed ` +
//                                                     `from ${role_map.role}`);
//                                             } else {
//                                                 return reject(`Portal's role must be higher ` +
//                                                     `than role you want to get, contact server admin`);
//                                             }
//                                         })
//                                         .catch(e => {
//                                             return reject(`Portal's role must be higher than ` +
//                                                 `role you want to get, contact server admin: ${e}`);
//                                         });
//                                 }
//                                 catch (e) {
//                                     return reject(`failed to remove role ${role_map.role}`);
//                                 }
//                             } else {
//                                 try {
//                                     current_member.roles
//                                         .add(role_array)
//                                         .then(member => {
//                                             if (member) {
//                                                 return resolve(`you have been added ` +
//                                                     `to ${role_map.role}`);
//                                             } else {
//                                                 return reject(`Portal's role must be higher ` +
//                                                     `than role you want to get, contact server admin`);
//                                             }
//                                         })
//                                         .catch(e => {
//                                             return reject(`Portal's role must be higher than ` +
//                                                 `role you want to get, contact server admin: ${e}`);
//                                         });
//                                 }
//                                 catch (e) {
//                                     return reject(`failed to add role ${role_map.role}`);
//                                 }
//                             }
//                         }
//                     }
//                 }
//             });
//     });
// }

// async function reaction_music_manager(
//     client: Client, pGuild: GuildPrtl, messageReaction: MessageReaction, user: User
// ): Promise<string> {
//     if (!messageReaction.message.guild) {
//         return `could not fetch message's guild`;
//     }

//     if (!pGuild.music_data) {
//         return 'guild has no music channel';
//     }

//     if (pGuild.music_data.messageId !== messageReaction.message.id) {
//         return 'message is not music player';
//     }

//     const portal_voice_connection = await getVoiceConnection(messageReaction.message.guild.id);

//     if (!portal_voice_connection) {
//         return 'portal is not connected to voice channel';
//     }

//     try {
//         await entersState(portal_voice_connection, VoiceConnectionStatus.Ready, 30e3);
//     } catch (error) {
//         portal_voice_connection.destroy();
//         return Promise.reject(error);
//     }

//     if (portal_voice_connection) {
//         if (!portal_voice_connection.channel.members.has(user.id)) {
//             return 'you must be in the same channel as Portal';
//         }
//     }

//     switch (messageReaction.emoji.name) {
//         case '▶️': {
//             play(
//                 portal_voice_connection, user, client,
//                 messageReaction.message.guild, pGuild
//             )
//                 .then(r => {
//                     clear_music_vote(pGuild.id)
//                         .catch(e => logger.error(e));

//                     return r;
//                 })
//                 .catch(e => {
//                     clear_music_vote(pGuild.id)
//                         .catch(e => logger.error(e));

//                     return Promise.reject(`failed to play video: ${e}`);
//                 });

//             break;
//         }
//         case '⏸': {
//             pause(portal_voice_connection)
//                 .then(r => {
//                     clear_music_vote(pGuild.id)
//                         .catch(e => logger.error(e));

//                     return r;
//                 })
//                 .catch(e => {
//                     clear_music_vote(pGuild.id)
//                         .catch(e => logger.error(e));

//                     return Promise.reject(`failed to pause video: ${e}`);
//                 });

//             break;
//         }
//         case '⏭': {
//             if (!portal_voice_connection) {
//                 update_music_lyrics_message(messageReaction.message.guild, pGuild, '')
//                     .catch(e => logger.error(e));

//                 return 'nothing to skip, player is idle';
//             }

//             if (!pGuild.music_data.votes) {
//                 return 'could not fetch music votes';
//             }

//             const guild = messageReaction.message.guild;
//             // const guild = client.guilds.cache
//             //     .find(g => g.id === pGuild.id);

//             if (!guild) {
//                 return Promise.reject(`could not fetch guild`);
//             }

//             const member = guild.members.cache
//                 .find(m => m.id === user.id);

//             if (!member) {
//                 return Promise.reject(`could not fetch memeber`);
//             }

//             let reason = 'none';

//             if (!is_dj(member)) {
//                 if (!is_authorised(member)) {
//                     if (!pGuild.music_data.votes.includes(user.id)) {
//                         pGuild.music_data.votes.push(user.id);
//                         insert_music_vote(pGuild.id, user.id).catch(e => logger.error(e));
//                     }

//                     const votes = pGuild.music_data.votes.length;
//                     const users = portal_voice_connection?.channel?.members
//                         .filter(member => !member.user.bot).size;

//                     if (!(votes < users / 2)) {
//                         return `${votes}/${Math.round(users / 2)} votes required`;
//                     } else {
//                         reason = 'vote'
//                     }
//                 } else {
//                     reason = 'admin'
//                 }
//             } else {
//                 reason = 'DJ'
//             }

//             if (!pGuild.music_data.pinned) {
//                 skip(
//                     portal_voice_connection, user, client,
//                     messageReaction.message.guild, pGuild
//                 )
//                     .then(r => {
//                         clear_music_vote(pGuild.id)
//                             .catch(e => logger.error(e));
//                         pGuild.music_queue.shift();

//                         return `${r} (by ${reason})`;
//                     })
//                     .catch(e => {
//                         return Promise.reject(`error while skipping: ${e}`);
//                     });
//             } else {
//                 pGuild.music_data.pinned = false;
//                 set_music_data(pGuild.id, pGuild.music_data)
//                     .then(r => {
//                         if (!r) {
//                             return Promise.reject(pGuild.music_data.pinned
//                                 ? 'failed to pin song'
//                                 : 'failed to unpin song');
//                         } else {
//                             skip(
//                                 portal_voice_connection, user, client,
//                                 guild, pGuild
//                             )
//                                 .then(r => {
//                                     clear_music_vote(pGuild.id)
//                                         .catch(e => logger.error(e));
//                                     pGuild.music_queue.shift();

//                                     return `${r} (by ${reason})`;
//                                 })
//                                 .catch(e => {
//                                     return Promise.reject(`error while skipping: ${e}`);
//                                 });
//                         }
//                     })
//                     .catch(e => {
//                         pGuild.music_data.pinned = !pGuild.music_data.pinned;

//                         return Promise.reject(!pGuild.music_data.pinned
//                             ? `error occurred while pinning song: ${e}`
//                             : `error occurred while unpinning song: ${e}`);
//                     });
//             }

//             break;
//         }
//         // case '➖': {
//         //     volume_down(portal_voice_connection)
//         //         .then(r => {
//         //             clear_music_vote(pGuild.id)
//         //.catch(e => logger.error(e));

//         //             return resolve(r);
//         //         })
//         //         .catch(e => {
//         //             clear_music_vote(pGuild.id)
//         // .catch(e => logger.error(e));

//         //             return resolve({
//         //                 result: false,
//         //                 value: `error while decreasing volume: ${e}`
//         //             });
//         //         });

//         //     break;
//         // }
//         // case '➕': {
//         //     volume_up(portal_voice_connection)
//         //         .then(r => {
//         //             clear_music_vote(pGuild.id)
//         // .catch(e => logger.error(e));

//         //             return resolve(r);
//         //         })
//         //         // .catch(e => {
//         //             clear_music_vote(pGuild.id)
//         // .catch(e => logger.error(e));

//         //             return resolve({
//         //                 result: false,
//         //                 value: `error while increasing volume: ${e}`
//         //             });
//         //         });

//         //     break;
//         // }
//         case '📌': {
//             pGuild.music_data.pinned = !pGuild.music_data.pinned;

//             set_music_data(pGuild.id, pGuild.music_data)
//                 .then(r => {
//                     if (!r) {
//                         pGuild.music_data.pinned = !pGuild.music_data.pinned;
//                     }

//                     if (r) {
//                         return resolve(pGuild.music_data.pinned
//                             ? 'pinned song'
//                             : 'unpinned song');
//                     } else {
//                         return reject(!pGuild.music_data.pinned
//                             ? 'failed to pin song'
//                             : 'failed to unpin song');
//                     }
//                 })
//                 .catch(e => {
//                     pGuild.music_data.pinned = !pGuild.music_data.pinned;

//                     const reply_message = !pGuild.music_data.pinned
//                         ? `error occurred while pinning song`
//                         : `error occurred while unpinning song`;

//                     return reject(`${reply_message}: ${e}`);
//                 });

//             break;
//         }
//         case '📄': {
//             get_lyrics(messageReaction.message.guild, pGuild)
//                 .then(r => {
//                     return resolve(r);
//                 })
//                 .catch(e => {
//                     return reject(`error occurred while fetching lyrics: ${e}`);
//                 });

//             break;
//         }
//         case '⬇️': {
//             export_txt(pGuild)
//                 .then(r => {
//                     if (r) {
//                         user.createDM()
//                             .then(dm => {
//                                 dm
//                                     .send(r)
//                                     .catch(e => {
//                                         return reject(`failed to send a message: ${e}`);
//                                     });
//                                 return resolve(`sent '${user.presence.member?.displayName}' a list of the queue`);
//                             })
//                             .catch(e => {
//                                 return reject(`failed to create dm channel: ${e}`);
//                             });
//                     } else {
//                         return resolve(`queue is empty`);
//                     }
//                 })
//                 .catch(e => {
//                     return reject(`failed to create music queue txt: ${e}`);
//                 });

//             break;
//         }
//         case '🧹': {
//             if (pGuild.music_queue.length > 1) {
//                 pGuild.music_queue.splice(1, pGuild.music_queue.length);
//                 update_guild(pGuild.id, 'music_queue', pGuild.music_queue)
//                     .catch(e => {
//                         return reject(`failed to update guild: ${e}`);
//                     });

//                 const guild = client.guilds.cache
//                     .find(g => g.id === pGuild.id);

//                 if (!guild) {
//                     clear_music_vote(pGuild.id)
//                         .catch(e => logger.error(e));

//                     return reject('could fetch guild from client');
//                 }
//             }

//             clear_music_vote(pGuild.id)
//                 .catch(e => logger.error(e));
//             return resolve('queue has been cleared');

//             break;
//         }
//         case '🚪': {
//             pause(portal_voice_connection)
//                 .then(() => {
//                     if (portal_voice_connection) {
//                         pGuild.music_queue = [];
//                         update_guild(pGuild.id, 'music_queue', pGuild.music_queue)
//                             .catch(e => {
//                                 return reject(`failed to update guild: ${e}`);
//                             });

//                         if (messageReaction.message.guild) {
//                             update_music_lyrics_message(messageReaction.message.guild, pGuild, '')
//                                 .catch(e => {
//                                     return reject(`failed to update music lyric message: ${e}`);
//                                 });
//                         }

//                         clear_music_vote(pGuild.id)
//                             .catch(e => logger.error(e));
//                         portal_voice_connection.disconnect();

//                         return resolve('Portal has been disconnected');
//                     } else {
//                         return resolve('Portal is not connected to a voice channel');
//                     }
//                 })
//                 .catch(e => {
//                     clear_music_vote(pGuild.id)
//                         .catch(e => logger.error(e));

//                     return reject(`Portal failed to get disconnected: ${e}`);
//                 });

//             break;
//         }
//     }
// }

export function messageReactionAdd(
  // @ts-expect-error: description
  client: Client,
  // @ts-expect-error: description
  messageReaction: MessageReaction | PartialMessageReactionClient,
  // @ts-expect-error: description
  user: User | PartialUserClient,
): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info(`${client} ${messageReaction} ${user}`);
    if (Date.now() > 0) {
      return resolve();
    }
    return reject("under construction");

    // if (user.bot) {
    //     return resolve(''); // 'not handling bot reactions'
    // } else if (messageReaction.message?.guild) {
    //     const current_guild = messageReaction.message.guild;
    //     fetch_guild_reaction_data(current_guild.id, user.id)
    //         .then(pGuild => {
    //             if (pGuild) {
    //                 if (messageReaction.partial) {
    //                     try {
    //                         messageReaction
    //                             .fetch()
    //                             .catch(e => {
    //                                 return reject(`something went wrong when fetching the message: ${e}`);
    //                             });
    //                     } catch (e) {
    //                         return reject(`something went wrong when fetching the message: ${e}`);
    //                     }
    //                 }

    //                 if (pGuild.role_list.some(r => r.messageId === messageReaction.message.id)) {
    //                     reaction_role_manager(pGuild, messageReaction, user)
    //                         .then(r => {
    //                             clear_user_reactions(messageReaction, user)
    //                                 .catch((e) => {
    //                                     return reject(`failed to clear messages: ${e}`);
    //                                 });
    //                             messageReaction.message.channel
    //                                 .send(`${user}, ${r}`)
    //                                 .then(sent_message => {
    //                                     setTimeout(() =>
    //                                         sent_message
    //                                             .delete()
    //                                             .catch(e => {
    //                                                 return Promise.reject(`failed to delete message: ${e}`);
    //                                             }),
    //                                         7500
    //                                     );
    //                                     return resolve('');
    //                                 })
    //                                 .catch(e => {
    //                                     return reject(`failed to send message: ${e}`);
    //                                 });
    //                         })
    //                         .catch(e => {
    //                             clear_user_reactions(messageReaction, user)
    //                                 .catch((e) => {
    //                                     return reject(`failed to clear messages: ${e}`);
    //                                 });
    //                             messageReaction.message.channel
    //                                 .send(`${user}, ${e}`)
    //                                 .then(sent_message => {
    //                                     setTimeout(() =>
    //                                         sent_message
    //                                             .delete()
    //                                             .catch(e => {
    //                                                 return Promise.reject(`failed to delete message: ${e}`);
    //                                             }),
    //                                         7500
    //                                     );
    //                                     return resolve('');
    //                                 })
    //                                 .catch(e => {
    //                                     return reject(`failed to send message: ${e}`);
    //                                 });
    //                         });
    //                 } else if (pGuild.music_data.messageId === messageReaction.message.id) {
    //                     reaction_music_manager(client, pGuild, messageReaction, user)
    //                         .then(r => {
    //                             if (messageReaction.message.guild) {
    //                                 const portal_voice_connection = client.voice?.connections
    //                                     .find(c => c.channel.guild.id === messageReaction.message.guild?.id);

    //                                 const animate = portal_voice_connection?.dispatcher
    //                                     ? !portal_voice_connection?.dispatcher.paused
    //                                     : false;

    //                                 update_music_message(
    //                                     messageReaction.message.guild,
    //                                     pGuild,
    //                                     pGuild.music_queue.length > 0
    //                                         ? pGuild.music_queue[0]
    //                                         : undefined,
    //                                     r,
    //                                     animate
    //                                 )
    //                                     .catch(e => {
    //                                         return reject(`failed to update music message: ${e}`);
    //                                     });
    //                             }

    //                             clear_user_reactions(messageReaction, user)
    //                                 .catch((e) => {
    //                                     return reject(`failed to clear messages: ${e}`);
    //                                 });

    //                             return resolve(r);
    //                         })
    //                         .catch(e => {
    //                             if (messageReaction.message.guild) {
    //                                 update_music_message(
    //                                     messageReaction.message.guild,
    //                                     pGuild,
    //                                     pGuild.music_queue.length > 0
    //                                         ? pGuild.music_queue[0]
    //                                         : undefined,
    //                                     `error while handling music reaction: ${e}`
    //                                 )
    //                                     .catch(e => {
    //                                         return reject(`failed to update music message: ${e}`);
    //                                     });
    //                             }

    //                             clear_user_reactions(messageReaction, user)
    //                                 .catch((e) => {
    //                                     return reject(`failed to clear messages: ${e}`);
    //                                 });

    //                             return reject(e);
    //                         });
    //                 } else if (messageReaction.emoji.name === '🏁' &&
    //                     pGuild.poll_list.some(p => p.messageId === messageReaction.message.id)) {
    //                     const poll = pGuild.poll_list.find(p =>
    //                         p.messageId === messageReaction.message.id);

    //                     if (poll && user.id === poll.memberId) {
    //                         const winner: MessageReaction[] = [];
    //                         let count = 0;

    //                         messageReaction.message.reactions.cache
    //                             .filter(r => r.emoji.name !== '🏁' && r.count !== 1)
    //                             .sort((a, b) => (b.count ? b.count : 0) - (a.count ? a.count : 0))
    //                             .forEach((value: MessageReaction) => { // , key: string, map: Map<string, MessageReaction>) => {
    //                                 if (winner.length === 0) {
    //                                     count = value.count ? value.count : 0;
    //                                     winner.push(value);
    //                                 } else {
    //                                     if ((winner[0] ? winner[0].count : 0) === (value ? value.count : 0)) {
    //                                         winner.push(value);
    //                                     }
    //                                 }
    //                             });

    //                         const message = winner.length > 0
    //                             ? `Poll outcome ${winner.length > 1 ? 'are options' : 'is option'} ` +
    //                             `${winner.map(r => r.emoji).join(', ')} ` +
    //                             `with ${(count) - 1} ${(count - 1 > 1 ? 'votes' : 'vote')}`
    //                             : `Noboody voted`;

    //                         messageReaction.message.channel
    //                             .send({
    //                                 embeds: [
    //                                     create_rich_embed(
    //                                         null,
    //                                         null,
    //                                         '#9900ff',
    //                                         null,
    //                                         null,
    //                                         null,
    //                                         false,
    //                                         null,
    //                                         null,
    //                                         undefined,
    //                                         {
    //                                             name: message,
    //                                             icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/firework.gif'
    //                                         }
    //                                     )
    //                                 ]
    //                             })
    //                             .catch(e => {
    //                                 return reject(`failed to send message: ${e}`);
    //                             });

    //                         remove_poll(current_guild.id, messageReaction.message.id)
    //                             .then(r => {
    //                                 if (r) {
    //                                     return resolve('successfully removed poll');
    //                                 } else {
    //                                     return reject('failed to remove poll');
    //                                 }
    //                             })
    //                             .catch(e => {
    //                                 return reject(`error while removing poll: ${e}`);
    //                             });
    //                     }
    //                 } else {
    //                     return resolve('message is not controlled by Portal');
    //                 }
    //             }
    //             else {
    //                 return reject('something went wrong with guild object');
    //             }
    //         })
    //         .catch(e => {
    //             return reject(`failed to fetch message reaction: ${e}`);
    //         });
    // } else {
    //     return reject(`could not fetch guild`);
    // }
  });
}
