/* eslint-disable no-unused-vars */
const country_codes = require('../assets/jsons/country_codes_2.json');
const bad_words_by_country = require('../assets/jsons/bad_words_by_country.json');

const http_mngr = require('../functions/http_requests');
const help_mngr = require('../functions/help_manager');

const moment = require('moment');
const voca = require('voca');

const is_bad_word = function(sentence) {
	for (let i = 0; i < sentence.length; i++) {
		for (const country in bad_words_by_country) {
			for (let j = 0; j < bad_words_by_country[country].length; j++) {
				if (bad_words_by_country[country][j] === sentence[i]) {
					return { word: sentence[i], country: country };
				}
			}
		}
	}
	console.log('did not find any bad word');
	return false;
};

module.exports = async (args) => {
	return new Promise((resolve) => {
		const is_bad = is_bad_word(args);
		if (is_bad) {
			return resolve({
				result: false,
				value: `please do not swear **!${is_bad.word} (${is_bad.country	})**`,
			});
		}
	});
};
