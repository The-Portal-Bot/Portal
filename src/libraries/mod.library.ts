/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ProfaneWords } from '../data/lists/profane_words.static';
import { ProfanityLevelEnum } from '../data/enums/ProfanityLevel.enum';
import { Language } from '../types/classes/TypesPrtl.interface';

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