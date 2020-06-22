const voca = require('voca');

const help_mngr = require('../functions/help_manager');
module.exports =
{
	is_pipe: function (arg) {
		for (let i = 0; i < this.pipes.length; i++)
			if (String(arg).substring(1, (String(this.pipes[i].name).length + 1)) == this.pipes[i].name)
				return this.pipes[i].name;
		return false;
	},
	get_help: function () {
		let pipe_array = [];
		for (let i = 0; i < this.pipes.length; i++) {
			pipe_array.push({
				emote: this.pipes[i].name,
				role: '**desc**: *' + this.pipes[i].description + '*' +
					'\n**args**: *' + this.pipes[i].args + '*',
				inline: true
			});
		}
		return help_mngr.create_rich_embed('Pipes',
			'Prefix: ' + this.prefix + '\nCommands to access portal bot.' +
			'\n**!**: *mandatory*, **@**: *optional*',
			'#6EEB83', pipe_array);
	},
	get_help_super: function (check) {
		for (let i = 0; i < this.pipes.length; i++) {
			let pipe = this.pipes[i];
			if (pipe.name === check) {
				return help_mngr.create_rich_embed(
					pipe.name,
					'Type: Pipe' +
					'\nPrefix: ' + this.prefix +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#6EEB83',
					[
						{ emote: 'Description', role: '*' + pipe.super_description + '*', inline: false },
						{ emote: 'Arguments', role: '*' + pipe.args + '*', inline: false },
						{ emote: 'Example', role: '*' + pipe.example + '*', inline: false }
					]
				);
			}
		}
		return false;
	},
	get: function (str, pipe) {
		for (let l = 0; l < this.pipes.length; l++) {
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
			example: '(variable, string)|upperCase',
			args: 'none',
			get: (str) => { return voca.upperCase(str); }
		},
		{
			name: 'lowerCase',
			description: 'returns an lowerCase of the input',
			super_description: '**lowerCase**, makes all characters lower-case.',
			example: '(variable, string)|lowerCase',
			args: 'none',
			get: (str) => { return voca.lowerCase(str); }
		},
		{
			name: 'capitalize',
			description: 'returns an capitalize of the input',
			super_description: '**capitalize**, makes the first character upper-case.',
			example: '(variable, string)|capitalize',
			args: 'none',
			get: (str) => { return voca.capitalize(str); }
		},
		{
			name: 'decapitalize',
			description: 'returns an decapitalize of the input',
			super_description: '**decapitalize**, makes the first character lower-case.',
			example: '(variable, string)|decapitalize',
			args: 'none',
			get: (str) => { return voca.decapitalize(str); }
		},
		{
			name: 'souvlakiCase',
			description: 'returns an souvlakiCase of the input',
			super_description: '**souvlakiCase**, connects all words with \'-\', like a greek souvlaki.',
			example: '(variable, string)|souvlakiCase',
			args: 'none',
			get: (str) => { return voca.kebabCase(str); }
		},
		{
			name: 'snakeCase',
			description: 'returns an snakeCase of the input',
			super_description: '**snakeCase**, connects all words with \'_\', like a snake.',
			example: '(variable, string)|snakeCase',
			args: 'none',
			get: (str) => { return voca.snakeCase(str); }
		},
		{
			name: 'titleCase',
			description: 'returns an titleCase of the input',
			super_description: '**titleCase**, makes every words first character upper-case.',
			example: '(variable, string)|titleCase',
			args: 'none',
			get: (str) => { return voca.titleCase(str); }
		},
		{
			name: 'camelCase',
			description: 'returns an camelCase of the input',
			super_description: '**camelCase**, connects words and makes the first character upper-case.',
			example: '(variable, string)|camelCase',
			args: 'none',
			get: (str) => { return voca.camelCase(str); }
		},
		{
			name: 'populous_count',
			description: 'returns the count of most common element in list',
			super_description: '**populous_count**, returns the count of most common element in list.',
			example: '(array)|populous_count',
			args: 'none',
			get: () => {
				return 'not yet implemented';
			}
		},
		{
			name: 'populous',
			description: 'returns the name of the most common element in list',
			super_description: '**populous**, returns the name of the most common element in list.',
			example: '(array)|populous',
			args: 'none',
			get: () => {
				return 'not yet implemented';
			}
		},
		{
			name: 'summary_count',
			description: 'returns the count of members having a status',
			super_description: '**summary_count**, returns the count of members having a status',
			example: '(array)|summary_count',
			args: 'none',
			get: (str) => {
				return voca.words(str).length;
			}
		}
	]
};
