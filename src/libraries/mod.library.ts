import { BanOptions, Message } from 'discord.js';
import moment from "moment";
import config_spam from '../config.spam.json';
import { ProfanityLevelEnum } from '../data/enums/ProfanityLevel.enum';
import { ProfaneWords } from '../data/lists/profane_words.static';
import { PGuild } from '../types/classes/PGuild.class';
import { Language, SpamCache } from '../types/classes/PTypes.interface';
import { getRole } from './guild.library';
import { isMessageDeleted, isWhitelist, logger, markMessageAsDeleted, messageReply } from './help.library';
import { updateMember } from './mongo.library';
import { ban, kick } from './user.library';

const profane_words: Language = <Language>ProfaneWords;

/**
   * Determine if a string contains profane words
   */
export function isProfane(
    candidate: string, profanity_level: number
): string[] {
    const gr: string[] = profane_words.gr.filter((word: string) => {
        return candidate.toLowerCase() === word.toLowerCase();
    });

    const en = profane_words.en.filter((word: string) => {
        const word_exp = new RegExp((ProfanityLevelEnum.default === profanity_level)
            ? `\\b(${word})\\b`
            : `\\b(\\w*${word}\\w*)\\b`, 'gi'
        );

        return word_exp.test(candidate);
    });

    const de = profane_words.de.filter((word: string) => {
        const word_exp = new RegExp((ProfanityLevelEnum.default === profanity_level)
            ? `\\b(${word})\\b`
            : `\\b(\\w*${word}\\w*)\\b`, 'gi'
        );

        return word_exp.test(candidate);
    });

    return (gr.length > 0) && (en.length > 0) && (de.length > 0)
        ? gr.concat(en).concat(de)
        : [];
}

/**
   * Determine if a user is spamming
   */
export function messageSpamCheck(
    message: Message, pGuild: PGuild, spamCache: SpamCache[]
): void {
    if (isWhitelist(message.member)) {
        return;
    }

    const memberSpamCache = spamCache
        .find(c => c.memberId === message.author.id);

    if (!memberSpamCache) {
        spamCache
            .push({
                memberId: message.author.id,
                last_message: message.content,
                timestamp: new Date(),
                spam_fouls: 1,
                duplicate_fouls: 1
            });

        return;
    }

    if (!memberSpamCache.timestamp) {
        memberSpamCache.memberId = message.author.id;
        memberSpamCache.last_message = message.content;
        memberSpamCache.timestamp = new Date();
        memberSpamCache.spam_fouls = 0;
        memberSpamCache.duplicate_fouls = 0;

        return;
    }

    const elapsed_time = moment.duration(moment().diff(moment(memberSpamCache.timestamp.getTime())));

    if (elapsed_time.asSeconds() > config_spam.MESSAGE_INTERVAL / 1000) {
        memberSpamCache.timestamp = null;
        memberSpamCache.spam_fouls = 0;
        memberSpamCache.duplicate_fouls = 0;

        return;
    }

    if (memberSpamCache.last_message === message.content) {
        memberSpamCache.spam_fouls++;
        memberSpamCache.duplicate_fouls++;
    } else {
        memberSpamCache.spam_fouls++;
        memberSpamCache.duplicate_fouls = 0;
    }

    if (config_spam.DUPLICATE_AFTER !== 0 && memberSpamCache.duplicate_fouls === config_spam.DUPLICATE_AFTER) {
        messageReply(false, message, `warning: please stop spamming the same message`, false, true)
            .catch((e: any) => {
                logger.error(new Error(`failed to reply to message: ${e}`));
            });

        memberSpamCache.timestamp = new Date();
    } else if (config_spam.WARN_AFTER !== 0 && memberSpamCache.spam_fouls === config_spam.WARN_AFTER) {
        messageReply(false, message, `warning: please stop spamming messages`, false, true)
            .catch((e: any) => {
                logger.error(new Error(`failed to reply to message: ${e}`));
            });

        memberSpamCache.timestamp = new Date();
    }

    if (config_spam.MUTE_AFTER !== 0 && memberSpamCache.spam_fouls === config_spam.MUTE_AFTER) {
        memberSpamCache.timestamp = null;
        memberSpamCache.spam_fouls = 0;

        if (pGuild.pMembers[0].penalties) {
            pGuild.pMembers[0].penalties++;
        } else {
            pGuild.pMembers[0].penalties = 1;
        }

        if (pGuild.kickAfter && pGuild.kickAfter !== 0 && pGuild.pMembers[0].penalties === pGuild.kickAfter) {
            if (message.member) {
                kick(message.member, 'kicked due to spamming')
                    .then(r => {
                        const reply_message = r
                            ? `kicked ${message.author} due to spamming`
                            : `member ${message.author} cannot be kicked`;

                        messageReply(false, message, reply_message, false, true)
                            .catch((e: any) => {
                                logger.error(new Error(`failed to reply to message: ${e}`));
                            });
                    })
                    .catch(e => {
                        logger.error(new Error(`failed to kick member: ${e}`));
                    });
            } else {
                messageReply(false, message, `could not kick ${message.author}`, false, true)
                    .catch((e: any) => {
                        logger.error(new Error(`failed to reply to message: ${e}`));
                    });
            }
        } else if (pGuild.banAfter && pGuild.banAfter !== 0 && pGuild.pMembers[0].penalties === pGuild.banAfter) {
            if (message.member) {
                const ban_options: BanOptions = {
                    deleteMessageDays: 0,
                    reason: 'banned due to spamming'
                };

                ban(message.member, ban_options)
                    .then(r => {
                        const reply_message = r
                            ? `banned ${message.author} due to spamming`
                            : `member ${message.author} cannot be banned`;

                        messageReply(false, message, reply_message, false, true)
                            .catch((e: any) => {
                                logger.error(new Error(`failed to reply to message: ${e}`));
                            });
                    })
                    .catch(e => {
                        logger.error(new Error(`failed to ban member: ${e}`));
                    });
            } else {
                messageReply(false, message, `could not kick ${message.author}`, false, true)
                    .catch((e: any) => {
                        logger.error(new Error(`failed to reply to message: ${e}`));
                    });
            }
        } else {
            updateMember(pGuild.id, message.author.id, 'penalties', pGuild.pMembers[0].penalties)
                .catch(e => {
                    logger.error(new Error(`failed to update member: ${e}`));
                });

            if (pGuild.muteRole) {
                mute_user(message, pGuild.muteRole);
            }
        }
    }
}

/**
   * Give member a role
   */
function mute_user(
    message: Message, mute_role_id: string
): void {
    const mute_role = getRole(message.guild, mute_role_id);
    const channel = message.channel;

    if (mute_role) {
        try {
            message.member?.roles
                .add(mute_role)
                .then(() => {
                    channel
                        .send(`user ${message.author}, has been muted for ${config_spam.MUTE_PERIOD} minutes`)
                        .then(message => delete_message(message))
                        .catch((e: any) => {
                            logger.error(new Error(`failed to reply to message: ${e}`));
                        });

                    setTimeout(() => {
                        const mute_role = getRole(message.guild, mute_role_id);

                        if (mute_role) {
                            try {
                                message.member?.roles
                                    .remove(mute_role)
                                    .then(() => {
                                        channel
                                            .send(`user ${message.author}, has been unmuted`)
                                            .then(message => {
                                                if (message.deletable) {
                                                    delete_message(message);
                                                }
                                            })
                                            .catch((e: any) => {
                                                logger.error(new Error(`failed to reply to message: ${e}`));
                                            });
                                    })
                                    .catch(e => {
                                        logger.error(new Error(`failed to give role to member: ${e}`));
                                    });
                            }
                            catch (e) {
                                logger.error(new Error(`failed to give role to member: ${e}`));
                            }
                        }
                    }, config_spam.MUTE_PERIOD * 60 * 1000);
                })
                .catch(e => {
                    logger.error(new Error(`failed to give role to member: ${e}`));
                });
        }
        catch (e) {
            logger.error(new Error(`failed to give role to member: ${e}`));
        }
    }
}

/**
   * Delete message with delay
   */
function delete_message(message: Message): void {
    if (message.deletable) {
        const delay = (process.env.DELETE_DELAY as unknown as number) * 1000;
        setTimeout(async () => {
            if (isMessageDeleted(message)) {
                const deletedMessage = await message
                    .delete()
                    .catch((e: any) => {
                        return Promise.reject(`failed to delete message: ${e}`);
                    });

                if (deletedMessage) {
                    markMessageAsDeleted(deletedMessage);
                }
            }
        }, delay);
    }
}