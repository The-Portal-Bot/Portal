import { MessageEmbed } from 'discord.js';
import voca from 'voca';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { create_rich_embed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from './InterfacesPrtl.interface';

export const pipe_prefix: string = '|';
const pipes: InterfaceBlueprint[] = [
	{
		name: 'camelCase',
		description: 'returns an camelCase of the input',
		super_description: '**camelCase**, connects words and makes the first character upper-case',
		example: '(variable, string)|camelCase',
		args: 'none',
		get: (str: string) => { return voca.camelCase(str); },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'capitalise',
		description: 'returns an capitalise of the input',
		super_description: '**capitalise**, makes the first character upper-case',
		example: '(variable, string)|capitalise',
		args: 'none',
		get: (str: string) => { return voca.capitalize(str); },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'decapitalise',
		description: 'returns an decapitalise of the input',
		super_description: '**decapitalise**, makes the first character lower-case',
		example: '(variable, string)|decapitalise',
		args: 'none',
		get: (str: string) => { return voca.decapitalize(str); },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'lowerCase',
		description: 'returns an lowerCase of the input',
		super_description: '**lowerCase**, makes all characters lower-case',
		example: '(variable, string)|lowerCase',
		args: 'none',
		get: (str: string) => { return voca.lowerCase(str); },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'upperCase',
		description: 'returns an upperCase of the input',
		super_description: '**upperCase**, makes all characters upper-case',
		example: '(variable, string)|upperCase',
		args: 'none',
		get: (str: string) => { return voca.upperCase(str); },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'populous',
		description: 'returns the name of the most common element in list',
		super_description: '**populous**, returns the name of the most common element in list',
		example: '(array)|populous',
		args: 'none',
		get: () => { return 'not yet implemented'; },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'populous_count',
		description: 'returns the count of most common element in list',
		super_description: '**populous_count**, returns the count of most common element in list',
		example: '(array)|populous_count',
		args: 'none',
		get: () => { return 'not yet implemented'; },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'snakeCase',
		description: 'returns an snakeCase of the input',
		super_description: '**snakeCase**, connects all words with \'_\', like a snake',
		example: '(variable, string)|snakeCase',
		args: 'none',
		get: (str: string) => { return voca.snakeCase(str); },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'souvlakiCase',
		description: 'returns an souvlakiCase of the input',
		super_description: '**souvlakiCase**, connects all words with \'-\', like a greek souvlaki',
		example: '(variable, string)|souvlakiCase',
		args: 'none',
		get: (str: string) => { return voca.kebabCase(str); },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'summary_count',
		description: 'returns the count of members having a status',
		super_description: '**summary_count**, returns the count of members having a status',
		example: '(array)|summary_count',
		args: 'none',
		get: (str: string) => { return voca.words(str).length; },
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'titleCase',
		description: 'returns an titleCase of the input',
		super_description: '**titleCase**, makes every words first character upper-case',
		example: '(variable, string)|titleCase',
		args: 'none',
		get: (str: string) => { return voca.titleCase(str); },
		set: null,
		auth: AuthEnum.none
	},
];

export function is_pipe(candidate: string): string {
	for (let i = 0; i < pipes.length; i++) {
		if (String(candidate).substring(1, (String(pipes[i].name).length + 1)) == pipes[i].name) { return pipes[i].name; }
	}
	return '';
};

export function get_pipe_guide(): MessageEmbed {
	const pipe_array: Field[] = [
		{
			emote: 'Used in Regex Interpreter',
			role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
			inline: true
		},
		{
			emote: 'Pipes are inextricably linked with text',
			role: '*pipes can used on plain text or even variables and attributes*',
			inline: true
		},
		{
			emote: '1.\tIn any text channel execute command `./run`',
			role: './run just like channel name generation uses the text interpreter',
			inline: false
		},
		{
			emote: '2.\t`./run My locale in caps is = &g.locale | upperCase`',
			role: './run executes the given text and replies with the processed output',
			inline: false
		},
		{
			emote: '3.\tAwait a reply from portal which will be gr, de or en',
			role: '*The replied string will look like this: `My locale in caps is = GR`*',
			inline: false
		}
	];

	return create_rich_embed(
		'Pipe Guide',
		'go to https://portal-bot.xyz/docs/interpreter/objects/pipes/description\n\n' +
		'How to use pipes with the Text Interpreter',
		'#6EEB83',
		pipe_array,
		null,
		null,
		null,
		null,
		null
	);
}

export function get_pipe_help(): MessageEmbed[] {
	const pipe_array: Field[][] = [];

	for (let l = 0; l <= pipes.length / 24; l++) {
		pipe_array[l] = []
		for (let i = (24 * l); i < pipes.length && i < 24 * (l + 1); i++) {
			pipe_array[l].push({
				emote: `${i + 1}. ${pipes[i].name}`,
				role: '**desc**: *' + pipes[i].description + '*' +
					'\n**args**: *' + pipes[i].args + '*',
				inline: true
			});
		}
	}

	return pipe_array.map((cmmd, index) => {
		if (index === 0) {
			return create_rich_embed(
				'Pipes',
				'go to https://portal-bot.xyz/docs/interpreter/objects/pipes/description\n\n' +
				'Prefix: ' + pipe_prefix + '\n' +
				'Mini functions you can pass text or Variables to manipulate their outcome\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#6EEB83', pipe_array[0], null, null, null, null, null
			)
		} else {
			return create_rich_embed(
				null, null, '#6EEB83', pipe_array[index], null, null, null, null, null
			)
		}
	});
};

export function get_pipe_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < pipes.length; i++) {
		const pipe = pipes[i];
		if (pipe.name === candidate) {
			return create_rich_embed(
				pipe.name,
				'Type: Pipe' +
				'\nPrefix: ' + pipe_prefix + '\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
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
