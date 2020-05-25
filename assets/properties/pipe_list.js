const vocal = require('voca');

module.exports =
{
	prefix: '|',
	pipes: [
		{
			name: 'upperCase',
			description: 'returns an upperCase of the input',
			get: (str, count) => { return vocal.upperCase(str); }
		},
		{
			name: 'lowerCase',
			description: 'returns an lowerCase of the input',
			get: (str, count) => { return vocal.lowerCase(str); }
		},
		{
			name: 'capitalize',
			description: 'returns an capitalize of the input',
			get: (str, count) => { return vocal.capitalize(str); }
		},
		{
			name: 'decapitalize',
			description: 'returns an decapitalize of the input',
			get: (str, count) => { return vocal.decapitalize(str); }
		},
		{
			name: 'kebabCase',
			description: 'returns an kebabCase of the input',
			get: (str, count) => { return vocal.kebabCase(str); }
		},
		{
			name: 'snakeCase',
			description: 'returns an snakeCase of the input',
			get: (str, count) => { return vocal.snakeCase(str); }
		},
		{
			name: 'titleCase',
			description: 'returns an titleCase of the input',
			get: (str, count) => { return vocal.titleCase(str); }
		},
		{
			name: 'camelCase',
			description: 'returns an camelCase of the input',
			get: (str, count) => { return vocal.camelCase(str); }
		},
		{
			name: 'acronym',
			description: 'returns an acronym of the input',
			get: (str, count) => { 
				return vocal.chain(str).upperCase().words().value().map(word => {
					return word.charAt(0);
				}).join('');
			}
		},
		{
			name: 'word',
			description: 'returns word of the input',
			get: (str, count) => { return vocal.words(str).slice(0, count); }
		},
		{
			name: 'populous_count',
			description: 'returns the count of most common element in list',
			get: (str, count) => {
				let words = str.split(' '), mf = 1, m = 0, item = words[0];
				for (let i = 0; i < words.length; i++) {
					for (let j = i; j < words.length; j++) {
						if (words[i] == words[j]) { m++; }
						if (mf < m) { mf = m; item = words[i]; }
					}
					m = 0;
				}
				return mf;
			}
		},
		{
			name: 'populous',
			description: 'returns the name of the most common element in list',
			get: (str, count) => {
				let words = str.split(' '), mf = 1, m = 0, item = words[0];
				for (let i = 0; i < words.length; i++) {
					for (let j = i; j < words.length; j++) {
						if (words[i] == words[j]) { m++; }
						if (mf < m) { mf = m; item = words[i]; }
					}
					m = 0;
				}
				return item;
			}
		},
		{
			name: 'summary_count',
			description: 'returns the count of members having a status',
			get: (str, count) => {
				return str.split(' ').length
			}
		}
	]
}