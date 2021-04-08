/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Message } from 'discord.js';
import { ProfanityLevelEnum } from '../data/enums/ProfanityLevel.enum';
import { ProfaneWords } from '../data/lists/profane_words.static';
import { Language, SpamCache } from '../types/classes/TypesPrtl.interface';

const profane_words: Language = <Language>ProfaneWords;

/**
   * Determine if a string contains profane language
   * @param {string} string - String to evaluate for profanity
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
   * @param {string} string - String to evaluate for profanity
   */
export function messageSpamCheck(
	message: Message, spam_cache: SpamCache[]
): void {
	// export interface SpamCache {
	// 	member_id: string;
	// 	timestamp: string;
	// 	spam_number: number;
	// }
	// const member_spam_cache = spam_cache.find(c => c.member_id === message.id);

	// if (member_spam_cache) {
	// 	if (momentmember_spam_cache.timestamp)
	// } else {
	// 	spam_cache.push({
	// 		member_id: message.id,
	// 		timestamp: new Date(),
	// 		spam_number: 1
	// 	});
	// }
}