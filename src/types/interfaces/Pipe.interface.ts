/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MessageEmbed } from 'discord.js';
import voca from 'voca';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { create_rich_embed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from '../classes/TypesPrtl.interface';

const portal_url = 'https://portal-bot.xyz/docs';
const interpreter_url = '/interpreter/objects';
export const pipe_prefix = '|';

const pipes: InterfaceBlueprint[] = [
	{
		name: 'acronym',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? is_acronym(str) ? str : str.replace(/[-_,.:*=+]/g, ' ').split(' ').map(s => s[0]).join('')
				: (typeof str === 'object')
					? str.map(s => s.replace(/[-_,.:*=+]/g, ' ').split(' ').map(sm => is_acronym(sm) ? sm : sm[0]).join('')).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'vowels',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? get_vowels(str).join('')
				: (typeof str === 'object')
					? str.map(s => get_vowels(s).join('')).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'consonants',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? get_constants(str).join('')
				: (typeof str === 'object')
					? str.map(s => get_constants(s).join('')).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'camelCase',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.camelCase(str)
				: (typeof str === 'object')
					? str.map(s => voca.camelCase(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'capitalise',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.capitalize(str)
				: (typeof str === 'object')
					? str.map(s => voca.capitalize(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'decapitalise',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.decapitalize(str)
				: (typeof str === 'object')
					? str.map(s => voca.decapitalize(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'lowerCase',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.lowerCase(str)
				: (typeof str === 'object')
					? str.map(s => voca.lowerCase(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'upperCase',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.upperCase(str)
				: (typeof str === 'object')
					? str.map(s => voca.upperCase(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'populous_count',
		get: (str: string | string[]): number => {
			return (typeof str === 'string')
				? 1
				: (typeof str === 'object')
					? <number>most_frequent(str, true)
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'populous',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? str
				: (typeof str === 'object')
					? <string>most_frequent(str, false)
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'snakeCase',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.snakeCase(str)
				: (typeof str === 'object')
					? str.map(s => voca.snakeCase(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'souvlakiCase',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.kebabCase(str)
				: (typeof str === 'object')
					? str.map(s => voca.kebabCase(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'words',
		get: (str: string | string[]): number => {
			return (typeof str === 'string')
				? voca.words(str).length
				: (typeof str === 'object')
					? voca.words(str.join(' ')).length
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'titleCase',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? voca.titleCase(str)
				: (typeof str === 'object')
					? str.map(s => voca.titleCase(s)).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'length',
		get: (str: string | string[]): number => {
			return (typeof str === 'string')
				? str.length
				: (typeof str === 'object')
					? str.join(',').length
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
];

export function is_pipe(candidate: string): string {
	for (let i = 0; i < pipes.length; i++) {
		const sub_str = String(candidate)
			.substring(1, (String(pipes[i].name).length + 1));

		if (sub_str == pipes[i].name) {
			return pipes[i].name;
		}
	}

	return '';
}

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
		'[Pipes](' + portal_url + interpreter_url + '/pipes/description) ' +
		'are small programs you can pass text, variables or attributes, to manipulate their outcome\n' +
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

	for (let l = 0; l <= pipes.length / 25; l++) {
		pipe_array[l] = []
		for (let i = (24 * l); i < pipes.length && i < 24 * (l + 1); i++) {
			pipe_array[l].push({
				emote: `${i + 1}. ${pipes[i].name}`,
				role: `[description](${portal_url}${interpreter_url}` +
					`/pipes/detailed/${(pipes[i].name)})`,
				inline: true
			});
		}
	}

	return pipe_array.map((cmmd, index): MessageEmbed => {
		if (index === 0) {
			return create_rich_embed(
				'Pipes',
				'[Pipes](' + portal_url + interpreter_url + '/pipes/description) ' +
				'are small programs you can pass text, variables or attributes, to manipulate their outcome\n' +
				'Prefix: ' + pipe_prefix,
				'#6EEB83',
				pipe_array[0],
				null,
				null,
				null,
				null,
				null
			);
		} else {
			return create_rich_embed(
				null,
				null,
				'#6EEB83',
				pipe_array[index],
				null,
				null,
				null,
				null,
				null
			);
		}
	});
}

export function get_pipe_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < pipes.length; i++) {
		const pipe = pipes[i];
		if (pipe.name === candidate) {
			return create_rich_embed(
				pipe.name,
				null,
				'#6EEB83',
				[
					{ emote: `Type`, role: `Pipe`, inline: true },
					{ emote: `Prefix`, role: `${pipe_prefix}`, inline: true },
					{
						emote: `Description`, role: `[${candidate} doc](${portal_url}${interpreter_url}` +
							`/pipes/detailed/${candidate})`, inline: true
					}
				],
				null,
				null,
				null,
				null,
				null
			);
		}
	}

	return false;
}

export function get_pipe(str: string | string[], pipe: string): string | number {
	for (let l = 0; l < pipes.length; l++) {
		if (pipe === pipes[l].name) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
			return pipes[l].get(str);
		}
	}

	return -1;
}

function most_frequent(array: string[], return_number: boolean): string | number {
	if (array.length == 0) {
		return 'no statuses';
	}

	const modeMap: any = {};
	let maxEl: string = array[0]
	let maxCount = 1;

	for (let i = 0; i < array.length; i++) {
		const el = array[i];

		if (modeMap[el] == null) {
			modeMap[el] = 1;
		} else {
			modeMap[el]++;
		}

		if (modeMap[el] > maxCount) {
			maxEl = el;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			maxCount = modeMap[el];
		}
	}

	return return_number ? maxCount : maxEl;
}

function is_acronym(candidate: string): boolean {
	const word_exp = new RegExp(`\\b[A-Z]*[a-z]*[A-Z]s?\\d*[A-Z]*[\\-\\w+]\\b`);
	return word_exp.test(candidate);
}

function get_vowels(str: string): string[] {
	const new_str = str.toLowerCase().match(/[aeiouy]/gi);
	return new_str ? new_str : [];
}

function get_constants(str: string): string[] {
	const new_str = str.toLowerCase().match(/[bcdfghjklmnpqrstvwxz]/gi);
	return new_str ? new_str : [];
}