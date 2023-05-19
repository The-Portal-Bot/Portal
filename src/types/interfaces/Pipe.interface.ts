import voca from 'voca';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { createEmbed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from '../classes/PTypes.interface';
import { EmbedBuilder } from 'discord.js';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';
export const PIPE_PREFIX = '|';

const pipes: InterfaceBlueprint[] = [
	{
		name: 'acronym',
		hover: 'make acronym',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? isAcronym(str) ? str : str.replace(/[-_,.:*=+]/g, ' ').split(' ').map(s => s[0]).join('')
				: (typeof str === 'object')
					? str.map(s => s.replace(/[-_,.:*=+]/g, ' ').split(' ').map(sm => isAcronym(sm) ? sm : sm[0]).join('')).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'vowels',
		hover: 'keep only vowels',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? getVowels(str).join('')
				: (typeof str === 'object')
					? str.map(s => getVowels(s).join('')).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'consonants',
		hover: 'keep only consonants',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? getConstants(str).join('')
				: (typeof str === 'object')
					? str.map(s => getConstants(s).join('')).join(',')
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'camelCase',
		hover: 'make to camel Case',
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
		hover: 'make first characters upper case',
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
		hover: 'make first characters lower case',
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
		hover: 'make all characters lower case',
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
		hover: 'make all characters upper case',
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
		hover: 'frequency of most popular item',
		get: (str: string | string[]): number => {
			return (typeof str === 'string')
				? 1
				: (typeof str === 'object')
					? <number>mostFrequent(str, true)
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'populous',
		hover: 'most popular item',
		get: (str: string | string[]): string => {
			return (typeof str === 'string')
				? str
				: (typeof str === 'object')
					? <string>mostFrequent(str, false)
					: str;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'snakeCase',
		hover: 'replace space with _',
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
		hover: 'replace space with -',
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
		hover: 'get the number of words',
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
		hover: 'make the first letter upper case and rest lower',
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
		hover: 'get length',
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

export function isPipe(candidate: string): string {
	for (let i = 0; i < pipes.length; i++) {
		const subString = String(candidate)
			.substring(1, (String(pipes[i].name).length + 1));

		if (subString == pipes[i].name) {
			return pipes[i].name;
		}
	}

	return '';
}

export function getPipeGuide(): EmbedBuilder {
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

	return createEmbed(
		'Pipe Guide',
		'[Pipes](' + PORTAL_URL + INTERPRETER_URL + '/pipes/description) ' +
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

export function getPipeHelp(): EmbedBuilder[] {
	const pipeArray: Field[][] = [];

	for (let l = 0; l <= pipes.length / 25; l++) {
		pipeArray[l] = []
		for (let i = (24 * l); i < pipes.length && i < 24 * (l + 1); i++) {
			pipeArray[l].push({
				emote: `${i + 1}. ${pipes[i].name}`,
				role: `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
					`/pipes/detailed/${(pipes[i].name)} "${(pipes[i].hover)}")`,
				inline: true
			});
		}
	}

	return pipeArray.map((command, index): EmbedBuilder => {
		if (index === 0) {
			return createEmbed(
				'Pipes',
				'[Pipes](' + PORTAL_URL + INTERPRETER_URL + '/pipes/description) ' +
				'are small programs you can pass text, variables or attributes, to manipulate their outcome\n' +
				'Prefix: ' + PIPE_PREFIX,
				'#6EEB83',
				pipeArray[0],
				null,
				null,
				null,
				null,
				null
			);
		} else {
			return createEmbed(
				null,
				null,
				'#6EEB83',
				pipeArray[index],
				null,
				null,
				null,
				null,
				null
			);
		}
	});
}

export function getPipeHelpSuper(candidate: string): EmbedBuilder | boolean {
	for (let i = 0; i < pipes.length; i++) {
		if (pipes[i].name === candidate) {
			return createEmbed(
				pipes[i].name,
				null,
				'#6EEB83',
				[
					{ emote: `Type`, role: `Pipe`, inline: true },
					{ emote: `Prefix`, role: `${PIPE_PREFIX}`, inline: true },
					{
						emote: `Description`, role: `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
							`/pipes/detailed/${candidate} "${(pipes[i].hover)}")`, inline: true
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

export function getPipe(str: string | string[], pipe: string): string | number {
	for (let l = 0; l < pipes.length; l++) {
		if (pipe === pipes[l].name) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
			return pipes[l].get(str);
		}
	}

	return -1;
}

function mostFrequent(array: string[], return_number: boolean): string | number {
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

function isAcronym(candidate: string): boolean {
	const word_exp = new RegExp(`\\b[A-Z]*[a-z]*[A-Z]s?\\d*[A-Z]*[\\-\\w+]\\b`);
	return word_exp.test(candidate);
}

function getVowels(str: string): string[] {
	const new_str = str.toLowerCase().match(/[aeiouy]/gi);
	return new_str ? new_str : [];
}

function getConstants(str: string): string[] {
	const new_str = str.toLowerCase().match(/[bcdfghjklmnpqrstvwxz]/gi);
	return new_str ? new_str : [];
}