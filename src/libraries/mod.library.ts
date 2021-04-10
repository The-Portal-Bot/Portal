/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BanOptions, Message } from 'discord.js';
import moment from "moment";
import config_spam from '../config.spam.json';
import config from '../config.json';
import { ProfanityLevelEnum } from '../data/enums/ProfanityLevel.enum';
import { ProfaneWords } from '../data/lists/profane_words.static';
import { GuildPrtl } from '../types/classes/GuildPrtl.class';
import { Language, SpamCache } from '../types/classes/TypesPrtl.interface';
import { get_role } from './guild.library';
import { logger, message_reply } from './help.library';
import { update_member } from './mongo.library';
import { ban, kick } from './user.library';

const profane_words: Language = <Language>ProfaneWords;

/**
   * Determine if a string contains profane words
   */
export function isProfane(
	canditate: string, profanity_level: number
): string[] {
	if (canditate.includes('role_assigner')) {
		return [];
	}

	const gr: string[] = profane_words.gr.filter((word: string) => {
		return canditate.toLowerCase() === word.toLowerCase();
	});

	const en = profane_words.en.filter((word: string) => {
		const word_exp = new RegExp((ProfanityLevelEnum.default === profanity_level)
			? `\\b(${word})\\b`
			: `\\b(\\w*${word}\\w*)\\b`, 'gi'
		);

		return word_exp.test(canditate);
	});

	const de = profane_words.de.filter((word: string) => {
		const word_exp = new RegExp((ProfanityLevelEnum.default === profanity_level)
			? `\\b(${word})\\b`
			: `\\b(\\w*${word}\\w*)\\b`, 'gi'
		);

		return word_exp.test(canditate);
	});

	return (gr.length > 0 || false) || (en.length > 0 || false) || (de.length > 0 || false)
		? gr.concat(en).concat(de)
		: [];
}

/**
   * Determine if a user is spamming
   */
export function message_spam_check(
	message: Message, guild_object: GuildPrtl, spam_cache: SpamCache[]
): void {
	const member_spam_cache = spam_cache
		.find(c => c.member_id === message.author.id);

	if (member_spam_cache) {
		if (member_spam_cache.timestamp) {
			const elapsed_time = moment
				.duration(
					moment().diff(
						moment(member_spam_cache.timestamp.getTime())
					)
				);

			if (elapsed_time.asSeconds() <= config_spam.message_interval / 1000) {
				if (member_spam_cache.last_message === message.content) {
					member_spam_cache.spam_fouls++;
					member_spam_cache.dupl_fouls++;
				} else {
					member_spam_cache.spam_fouls++;
					member_spam_cache.dupl_fouls = 0;
				}

				if (config_spam.dupl_after !== 0 && member_spam_cache.dupl_fouls >= config_spam.dupl_after) {
					message_reply(false, message, `please stop spamming the same message (this is a warning)`, false, true)
						.catch((e: any) => {
							logger.error(new Error(`failed to reply to message / ${e}`));
						});

					member_spam_cache.timestamp = new Date();
				} else if (config_spam.warn_after !== 0 && member_spam_cache.spam_fouls >= config_spam.warn_after) {
					message_reply(false, message, `please stop spamming (this is a warning)`, false, true)
						.catch((e: any) => {
							logger.error(new Error(`failed to reply to message / ${e}`));
						});

					member_spam_cache.timestamp = new Date();
				} else if (config_spam.mute_after !== 0 && member_spam_cache.spam_fouls >= config_spam.mute_after) {
					member_spam_cache.timestamp = null;
					member_spam_cache.spam_fouls = 0;

					if (config_spam.kick_after !== 0 && guild_object.member_list[0].penalties + 1 >= config_spam.kick_after) {
						if (message.member) {
							kick(message.member, 'kicked due to spamming')
								.then(r => {
									const reply_message = r
										? `kicked ${message.author} due to spamming`
										: `member ${message.author} cannot be kicked`;

									message_reply(false, message, reply_message, false, true)
										.catch((e: any) => {
											logger.error(new Error(`failed to reply to message / ${e}`));
										});
								})
								.catch(e => {
									logger.error(new Error(`failed to kick member / ${e}`));
								});
						} else {
							message_reply(false, message, `could not kick ${message.author}`, false, true)
								.catch((e: any) => {
									logger.error(new Error(`failed to reply to message / ${e}`));
								});
						}
					} else if (config_spam.ban_after !== 0 && guild_object.member_list[0].penalties + 1 >= config_spam.ban_after) {
						if (message.member) {
							const ban_options: BanOptions = {
								days: 0,
								reason: 'banned due to spamming'
							};

							ban(message.member, ban_options)
								.then(r => {
									const reply_message = r
										? `banned ${message.author} due to spamming`
										: `member ${message.author} cannot be banned`;

									message_reply(false, message, reply_message, false, true)
										.catch((e: any) => {
											logger.error(new Error(`failed to reply to message / ${e}`));
										});
								})
								.catch(e => {
									logger.error(new Error(`failed to ban member / ${e}`));
								});
						} else {
							message_reply(false, message, `could not kick ${message.author}`, false, true)
								.catch((e: any) => {
									logger.error(new Error(`failed to reply to message / ${e}`));
								});
						}
					} else {
						update_member(guild_object.id, message.id, 'penalties', guild_object.member_list[0].penalties + 1)
							.catch(e => {
								logger.error(new Error(`failed to update member / ${e}`));
							});

						if (guild_object.mute_role) {
							mute_user(message, guild_object.mute_role);
						}
					}
				}
			} else {
				member_spam_cache.timestamp = null;
				member_spam_cache.spam_fouls = 0;
				member_spam_cache.dupl_fouls = 0;
			}
		} else {
			member_spam_cache.member_id = message.author.id;
			member_spam_cache.last_message = message.content;
			member_spam_cache.timestamp = new Date();
			member_spam_cache.spam_fouls = 0;
			member_spam_cache.dupl_fouls = 0;
		}
	} else {
		spam_cache
			.push({
				member_id: message.author.id,
				last_message: message.content,
				timestamp: new Date(),
				spam_fouls: 1,
				dupl_fouls: 1
			});
	}
}

/**
   * Give member a role
   */
function mute_user(
	message: Message, mute_role_id: string
): void {
	const mute_role = get_role(message.guild, mute_role_id);
	const channel = message.channel;

	if (mute_role) {
		try {
			message.member?.roles
				.add(mute_role)
				.then(() => {
					channel
						.send(`user ${message.author}, has been muted for ${config_spam.mute_period} minutes`)
						.then(message => delete_message(message))
						.catch((e: any) => {
							logger.error(new Error(`failed to reply to message / ${e}`));
						});

					setTimeout(() => {
						const mute_role = get_role(message.guild, mute_role_id);

						if (mute_role) {
							try {
								message.member?.roles
									.remove(mute_role)
									.then(() => {
										channel
											.send(`user ${message.author}, has been unmuted`)
											.then(message => delete_message(message))
											.catch((e: any) => {
												logger.error(new Error(`failed to reply to message / ${e}`));
											});
									})
									.catch(e => {
										logger.error(new Error(`failed to give role to member / ${e}`));
									});
							}
							catch (e) {
								logger.error(new Error(`failed to give role to member / ${e}`));
							}
						}
					}, config_spam.mute_period * 60 * 1000);
				})
				.catch(e => {
					logger.error(new Error(`failed to give role to member / ${e}`));
				});
		}
		catch (e) {
			logger.error(new Error(`failed to give role to member / ${e}`));
		}
	}
}

/**
   * Delete message with delay
   */
function delete_message(message: Message): void {
	if (message.deletable) {
		message
			.delete({
				timeout: config.delete_delay * 1000
			})
			.catch(e => {
				logger.error(new Error(`failed to delete message / ${e}`));
			});
	}
}