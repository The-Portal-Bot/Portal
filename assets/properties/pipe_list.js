const voca = require('voca');

module.exports =
{
	prefix: '|',
	pipes: [
		{
			name: 'upperCase',
			description: 'returns an upperCase of the input',
			args: 'none',
			get: (str, count) => { return voca.upperCase(str); }
		},
		{
			name: 'lowerCase',
			description: 'returns an lowerCase of the input',
			args: 'none',
			get: (str, count) => { return voca.lowerCase(str); }
		},
		{
			name: 'capitalize',
			description: 'returns an capitalize of the input',
			args: 'none',
			get: (str, count) => { return voca.capitalize(str); }
		},
		{
			name: 'decapitalize',
			description: 'returns an decapitalize of the input',
			args: 'none',
			get: (str, count) => { return voca.decapitalize(str); }
		},
		{
			name: 'kebabCase',
			description: 'returns an kebabCase of the input',
			args: 'none',
			get: (str, count) => { return voca.kebabCase(str); }
		},
		{
			name: 'snakeCase',
			description: 'returns an snakeCase of the input',
			args: 'none',
			get: (str, count) => { return voca.snakeCase(str); }
		},
		{
			name: 'titleCase',
			description: 'returns an titleCase of the input',
			args: 'none',
			get: (str, count) => { return voca.titleCase(str); }
		},
		{
			name: 'camelCase',
			description: 'returns an camelCase of the input',
			args: 'none',
			get: (str, count) => { return voca.camelCase(str); }
		},
		{
			name: 'acronym',
			description: 'returns an acronym of the input',
			args: 'none',
			get: (str, count) => { 
				return voca.chain(str).upperCase().words().value().map(word => {
					return word.charAt(0);
				}).join('');
			}
		},
		{
			name: 'words',
			description: 'returns n words of array',
			args: 'number (0-9)\nex: status_list|words2',
			get: (str, count) => { return voca.words(str).slice(0, count); }
		},
		{
			name: 'populous_count',
			description: 'returns the count of most common element in list',
			args: 'none',
			get: (str, count) => {
				
			}
		},
		{
			name: 'populous',
			description: 'returns the name of the most common element in list',
			args: 'none',
			get: (str, count) => {
				
			}
		},
		{
			name: 'summary_count',
			description: 'returns the count of members having a status',
			args: 'none',
			get: (str, count) => {
				return str.split(' ').length
			}
		}
	]
}