const voca = require('voca');

module.exports =
{
	prefix: '|',
	pipes: [
		{
			name: 'upperCase',
			description: 'returns an upperCase of the input',
			super_description: '**upperCase**, makes all characters upper-case.',
			args: 'none',
			get: (str, count) => { return voca.upperCase(str); }
		},
		{
			name: 'lowerCase',
			description: 'returns an lowerCase of the input',
			super_description: '**lowerCase**, makes all characters lower-case.',
			args: 'none',
			get: (str, count) => { return voca.lowerCase(str); }
		},
		{
			name: 'capitalize',
			description: 'returns an capitalize of the input',
			super_description: '**capitalize**, makes the first character upper-case.',
			args: 'none',
			get: (str, count) => { return voca.capitalize(str); }
		},
		{
			name: 'decapitalize',
			description: 'returns an decapitalize of the input',
			super_description: '**decapitalize**, makes the first character lower-case.',
			args: 'none',
			get: (str, count) => { return voca.decapitalize(str); }
		},
		{
			name: 'souvlakiCase',
			description: 'returns an souvlakiCase of the input',
			super_description: '**souvlakiCase**, connects all words with \'-\', like a greek souvlaki.',
			args: 'none',
			get: (str, count) => { return voca.souvlakiCase(str); }
		},
		{
			name: 'snakeCase',
			description: 'returns an snakeCase of the input',
			super_description: '**snakeCase**, connects all words with \'_\', like a snake.',
			args: 'none',
			get: (str, count) => { return voca.snakeCase(str); }
		},
		{
			name: 'titleCase',
			description: 'returns an titleCase of the input',
			super_description: '**titleCase**, makes every words first character upper-case.',
			args: 'none',
			get: (str, count) => { return voca.titleCase(str); }
		},
		{
			name: 'camelCase',
			description: 'returns an camelCase of the input',
			super_description: '**camelCase**, connects words and makes the first character upper-case.',
			args: 'none',
			get: (str, count) => { return voca.camelCase(str); }
		},
		{
			name: 'acronym',
			description: 'returns an acronym of the input',
			super_description: '**acronym**, keeps only first character of words, connects them and makes the first '+
				'character upper-case.',
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
			super_description: '**words#**, returns only the requested number of words of sentence.\n'+
				'example ./run $status_list|words1\n'+
				'If $status_list is *Rocket League* it will return Rocket.',
			args: 'number (0-9)\nex: status_list|words2',
			get: (str, count) => { return voca.words(str).slice(0, count); }
		},
		{
			name: 'populous_count',
			description: 'returns the count of most common element in list',
			super_description: '**populous_count**, returns the count of most common element in list.',
			args: 'none',
			get: (str, count) => {
				
			}
		},
		{
			name: 'populous',
			description: 'returns the name of the most common element in list',
			super_description: '**populous**, returns the name of the most common element in list.',
			args: 'none',
			get: (str, count) => {
				
			}
		},
		{
			name: 'summary_count',
			description: 'returns the count of members having a status',
			super_description: '**summary_count**, returns the count of members having a status',
			args: 'none',
			get: (str, count) => {
				return str.split(' ').length
			}
		}
	]
}