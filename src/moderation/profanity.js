/* eslint-disable no-unused-vars */
const profane_word_list = require('../../assets/jsons/profane_word_list.json');

/**
   * Determine if a string contains profane language.
   * @param {string} string - String to evaluate for profanity.
   * 
   * https://github.com/web-mech/badwords
   */
module.exports = function isProfane(string) {
	const str_array = [string];
	for (let i = 0; i < string.length; i++) {
		str_array.push(string.substr(0, i));
		str_array.push(string.substr(i, string.length - 1));
	}

	return Object.getOwnPropertyNames(profane_word_list).some(lang => {
		return profane_word_list[lang].filter((word) => {
			if (lang === 'en') {
				const regex_word = word.replace(/(\W)/g, '\\$1');
				const word_exp = new RegExp(`\\b(\\w*${word}\\w*)\\b`, 'gi');
				return word_exp.test(string);
			} else if (lang === 'el') {
				return str_array.some(str => str === word);
			}

		}).length > 0 || false;
	});
}