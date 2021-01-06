import { MessageEmbed } from 'discord.js';
import voca from 'voca';
import { create_rich_embed } from '../../libraries/helpOps';
import { InterfaceBlueprint } from './InterfacesPrtl';

export const pipe_prefix: string = '|';
const pipes: InterfaceBlueprint[] = [
	{
		name: 'camelCase',
		description: 'returns an camelCase of the input',
		super_description: '**camelCase**, connects words and makes the first character upper-case.',
		example: '(variable, string)|camelCase',
		args: 'none',
		get: (str: string) => { return voca.camelCase(str); },
		set: null,
		auth: 'none'
	},
	{
		name: 'capitalize',
		description: 'returns an capitalize of the input',
		super_description: '**capitalize**, makes the first character upper-case.',
		example: '(variable, string)|capitalize',
		args: 'none',
		get: (str: string) => { return voca.capitalize(str); },
		set: null,
		auth: 'none'
	},
	{
		name: 'decapitalize',
		description: 'returns an decapitalize of the input',
		super_description: '**decapitalize**, makes the first character lower-case.',
		example: '(variable, string)|decapitalize',
		args: 'none',
		get: (str: string) => { return voca.decapitalize(str); },
		set: null,
		auth: 'none'
	},
	{
		name: 'lowerCase',
		description: 'returns an lowerCase of the input',
		super_description: '**lowerCase**, makes all characters lower-case.',
		example: '(variable, string)|lowerCase',
		args: 'none',
		get: (str: string) => { return voca.lowerCase(str); },
		set: null,
		auth: 'none'
	},
	{
		name: 'upperCase',
		description: 'returns an upperCase of the input',
		super_description: '**upperCase**, makes all characters upper-case.',
		example: '(variable, string)|upperCase',
		args: 'none',
		get: (str: string) => { return voca.upperCase(str); },
		set: null,
		auth: 'none'
	},
	{
		name: 'populous',
		description: 'returns the name of the most common element in list',
		super_description: '**populous**, returns the name of the most common element in list.',
		example: '(array)|populous',
		args: 'none',
		get: () => { return 'not yet implemented'; },
		set: null,
		auth: 'none'
	},
	{
		name: 'populous_count',
		description: 'returns the count of most common element in list',
		super_description: '**populous_count**, returns the count of most common element in list.',
		example: '(array)|populous_count',
		args: 'none',
		get: () => { return 'not yet implemented'; },
		set: null,
		auth: 'none'
	},
	{
		name: 'snakeCase',
		description: 'returns an snakeCase of the input',
		super_description: '**snakeCase**, connects all words with \'_\', like a snake.',
		example: '(variable, string)|snakeCase',
		args: 'none',
		get: (str: string) => { return voca.snakeCase(str); },
		set: null,
		auth: 'none'
	},
	{
		name: 'souvlakiCase',
		description: 'returns an souvlakiCase of the input',
		super_description: '**souvlakiCase**, connects all words with \'-\', like a greek souvlaki.',
		example: '(variable, string)|souvlakiCase',
		args: 'none',
		get: (str: string) => { return voca.kebabCase(str); },
		set: null,
		auth: 'none'
	},
	{
		name: 'summary_count',
		description: 'returns the count of members having a status',
		super_description: '**summary_count**, returns the count of members having a status',
		example: '(array)|summary_count',
		args: 'none',
		get: (str: string) => { return voca.words(str).length; },
		set: null,
		auth: 'none'
	},
	{
		name: 'titleCase',
		description: 'returns an titleCase of the input',
		super_description: '**titleCase**, makes every words first character upper-case.',
		example: '(variable, string)|titleCase',
		args: 'none',
		get: (str: string) => { return voca.titleCase(str); },
		set: null,
		auth: 'none'
	},
];

export function is_pipe(candidate: string): string {
	for (let i = 0; i < pipes.length; i++) {
		if (String(candidate).substring(1, (String(pipes[i].name).length + 1)) == pipes[i].name) { return pipes[i].name; }
	}
	return '';
};

export function get_pipe_help(): MessageEmbed {
	const pipe_array = [];
	for (let i = 0; i < pipes.length; i++) {
		pipe_array.push({
			emote: pipes[i].name,
			role: '**desc**: *' + pipes[i].description + '*' +
				'\n**args**: *' + pipes[i].args + '*',
			inline: true,
		});
	}
	return create_rich_embed('Pipes',
		'Prefix: ' + pipe_prefix + '\nData manipulating pipes.' +
		'\n**!**: *mandatory*, **@**: *optional*',
		'#6EEB83', pipe_array,
		null,
		null,
		null,
		null,
		null);
};

export function get_pipe_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < pipes.length; i++) {
		const pipe = pipes[i];
		if (pipe.name === candidate) {
			return create_rich_embed(
				pipe.name,
				'Type: Pipe' +
				'\nPrefix: ' + pipe_prefix +
				'\n**!**: *mandatory*, **@**: *optional*',
				'#6EEB83',
				[
					{ emote: 'Description', role: '*' + pipe.super_description + '*', inline: false },
					{ emote: 'Arguments', role: '*' + pipe.args + '*', inline: false },
					{ emote: 'Example', role: '*' + pipe.example + '*', inline: false }
				],
				null,
				null,
				null,
				null,
				null);
		}
	}
	return false;
};

export function get_pipe(str: string, pipe: string) {
	for (let l = 0; l < pipes.length; l++) {
		if (pipe === pipes[l].name) {
			return pipes[l].get(str);
		}
	}
	return -1;
};