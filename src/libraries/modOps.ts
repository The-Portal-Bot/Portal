/* eslint-disable no-unused-vars */
import profane_word_list from '../assets/jsons/profane_word_list.json';
import { Language } from '../types/interfaces/InterfacesPrtl';

const profane_words: Language = <Language>profane_word_list;

/**
   * Determine if a string contains profane language.
   * @param {string} string - String to evaluate for profanity.
   * 
   * https://github.com/web-mech/badwords
   */
export function isProfane(string: string): boolean {
	const str_array = [string];

	for (let i = 0; i < string.length; i++) {
		str_array.push(string.substr(0, i));
		str_array.push(string.substr(i, string.length - 1));
	}

	return Object.getOwnPropertyNames(profane_word_list).some((lang: string) => {
		const gr = profane_words.en.filter((word: string) => {
			return str_array.some(str => str === word);
		}).length > 0 || false;
		const en = profane_words.en.filter((word: string) => {
			const word_exp = new RegExp(`\\b(\\w*${word}\\w*)\\b`, 'gi');
			return word_exp.test(string);
		}).length > 0 || false;
		const de = profane_words.de.filter((word: string) => {
			const word_exp = new RegExp(`\\b(\\w*${word}\\w*)\\b`, 'gi');
			return word_exp.test(string);
		}).length > 0 || false;

		return gr || en || de;
	});
};