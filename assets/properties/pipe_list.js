const voca = require('voca');

module.exports =
{
	get: function (str, pipe) {
		for (l = 0; l < this.pipes.length; l++) {
			if (pipe === this.pipes[l].name) {
				return this.pipes[l].get(str);
			}
		}
		return -1;
	},
	prefix: '|',
	pipes: [
		{
			name: 'upperCase',
			description: 'returns an upperCase of the input',
			super_description: '**upperCase**, makes all characters upper-case.',
			args: 'none',
			get: (str) => { return voca.upperCase(str); }
		},
		{
			name: 'lowerCase',
			description: 'returns an lowerCase of the input',
			super_description: '**lowerCase**, makes all characters lower-case.',
			args: 'none',
			get: (str) => { return voca.lowerCase(str); }
		},
		{
			name: 'capitalize',
			description: 'returns an capitalize of the input',
			super_description: '**capitalize**, makes the first character upper-case.',
			args: 'none',
			get: (str) => { return voca.capitalize(str); }
		},
		{
			name: 'decapitalize',
			description: 'returns an decapitalize of the input',
			super_description: '**decapitalize**, makes the first character lower-case.',
			args: 'none',
			get: (str) => { return voca.decapitalize(str); }
		},
		{
			name: 'souvlakiCase',
			description: 'returns an souvlakiCase of the input',
			super_description: '**souvlakiCase**, connects all words with \'-\', like a greek souvlaki.',
			args: 'none',
			get: (str) => { return voca.kebabCase(str); }
		},
		{
			name: 'snakeCase',
			description: 'returns an snakeCase of the input',
			super_description: '**snakeCase**, connects all words with \'_\', like a snake.',
			args: 'none',
			get: (str) => { return voca.snakeCase(str); }
		},
		{
			name: 'titleCase',
			description: 'returns an titleCase of the input',
			super_description: '**titleCase**, makes every words first character upper-case.',
			args: 'none',
			get: (str) => { return voca.titleCase(str); }
		},
		{
			name: 'camelCase',
			description: 'returns an camelCase of the input',
			super_description: '**camelCase**, connects words and makes the first character upper-case.',
			args: 'none',
			get: (str) => { return voca.camelCase(str); }
		},
		{
			name: 'populous_count',
			description: 'returns the count of most common element in list',
			super_description: '**populous_count**, returns the count of most common element in list.',
			args: 'none',
			get: (str) => {
				return 'not yet implemented'
			}
		},
		{
			name: 'populous',
			description: 'returns the name of the most common element in list',
			super_description: '**populous**, returns the name of the most common element in list.',
			args: 'none',
			get: (str) => {
				return 'not yet implemented'
			}
		},
		{
			name: 'summary_count',
			description: 'returns the count of members having a status',
			super_description: '**summary_count**, returns the count of members having a status',
			args: 'none',
			get: (str) => {
				return voca.words(str).length;
			}
		}
	]
}
