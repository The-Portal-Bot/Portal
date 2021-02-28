import ProfaneWords from '../assets/jsons/ProfaneWords.json';
import { Language } from '../types/interfaces/InterfacesPrtl';

const profane_words: Language = <Language>ProfaneWords;

/**
   * Determine if a string contains profane language
   * @param {string} string - String to evaluate for profanity
   */
export function isProfane(string: string): string[] {
	if (string.includes('role_assigner')) {
		return [];
	}

	const gr = profane_words.gr.filter((word: string) => {
		return string.toLowerCase() === word.toLowerCase();
	});

	const en = profane_words.en.filter((word: string) => {
		const word_exp = new RegExp(`\\b(\\w*${word}\\w*)\\b`, 'gi');
		return word_exp.test(string);
	});

	const de = profane_words.de.filter((word: string) => {
		const word_exp = new RegExp(`\\b(\\w*${word}\\w*)\\b`, 'gi');
		return word_exp.test(string);
	});

	console.log('en :>> ', en);
	return (gr.length > 0 || false) || (en.length > 0 || false) || (de.length > 0 || false)
		? gr.concat(en).concat(de)
		: [];
};