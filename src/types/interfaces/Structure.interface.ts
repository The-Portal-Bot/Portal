import { MessageEmbed } from 'discord.js';
import { create_rich_embed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from './InterfacesPrtl.interface';

export const structure_prefix: string = '{{';
const structures: InterfaceBlueprint[] = [
	{
		name: 'if',
		description: 'if statement with two outcomes: ```json\n{{\n\t"if": "John", "is": "===", "with": "John",\n\t' +
			'"yes": "same name", "no": "not the same name"\n}}```',
		super_description: '**if**, gets two arguments, an operator and two outcomes and returns ' +
			'outcome a if statement is true and second if not.\n' +
			'example: ./run ```json\n{{\n\t"if": "John", "is": "===", "with": "John",\n\t' +
			'"yes": "same name", "no": "not the same name"\n}}```\n will return *same name* as ' +
			'it is the same name.\nOperator is can take values: ==, ===, !=, !==, >, <, >=, <=.\n' +
			'> You can read the statement as: if John is equal with John ? yes, same name or no, not same name.\n' +
			'> You cannot encapsulate if statements',
		example: '{{\n\t"if": "John", "is": "===", "with": "John",\n\t' +
			'"yes": "same name", "no": "not the same name"\n}}',
		args: 'JSON with: if, is, with, yes, no',
		get: null,
		set: null,
		auth: 'none'
	}
];

export function is_structure(candidate: string): string {
	for (let i = 0; i < structures.length; i++) {
		if (String(candidate).substring(1, (String(structures[i].name).length + 1)) == structures[i].name) {
			return structures[i].name;
		}
	}
	return '';
};

export function get_structure_guide(): MessageEmbed {
	const strc_array: Field[] = [
		{
			emote: 'Used in Regex Interpreter',
			role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
			inline: true
		},
		{
			emote: 'structures are flow manipulators',
			role: '*you can change the outcome of the regex coresponding with live data*',
			inline: true
		},
		{
			emote: '1. Go to any channel',
			role: '*you can run commands ./run OR ./set in any channel and Portal will see them*',
			inline: false
		},
		{
			emote: '2-1-a. `./run {{ "if": "year", "is": "===", "with": "year", "yes": "same text", "no": "not same text" }}`',
			role: '*run command, processes given text and returns processed text (note it is JSON format)*',
			inline: false
		},
		{
			emote: '2-2-a. Wait for portal response which will be `same text` as `year` is the same with `year`',
			role: '*it will reply with your string until it edits it with processed info*',
			inline: false
		},
		{
			emote: '2-1-b. `./run {{ "if": "$year", "is": "===", "with": "2020", "yes": "bad year", "no": "maybe not that bad" }}`',
			role: '*note that year is variable as it is preceded by &*',
			inline: false
		},
		{
			emote: '2-2-b. Wait for portal response which will be `maybe not that bad` as `$year` is now greater than 2020',
			role: '*it will reply with your string until it edits it with processed info*',
			inline: false
		},
		{
			emote: '3-1. `./set regex_voice {{ "if": "$year", "is": "===", "with": "2020", "yes": "bad year", "no": "maybe not that bad" }}` (note that when setting you do not need prefix &)',
			role: '*set command, updates the data of an attribute in this case **regex_voice** to ***{{ "if": "$year", "is": "===", "with": "2020", "yes": "bad year", "no": "maybe not that bad" }}***',
			inline: false
		},
		{
			emote: '3-2. Wait for portal response which will be inform you if it was executed without issues',
			role: '*portal will either confirm update or inform you of the error it faced*',
			inline: false
		}
	];

	return create_rich_embed(
		'Structure Guide',
		'go to https://portal-bot.xyz/docs/regex/interpreter/structures\n\n' +
		'how to use structures with regex interpreter',
		'#EEB902',
		strc_array,
		null,
		null,
		null,
		null,
		null
	);
}

export function get_structure_help(): MessageEmbed[] {
	const strc_array: Field[][] = [];

	for (let l = 0; l <= structures.length / 24; l++) {
		strc_array[l] = []
		for (let i = (24 * l); i < structures.length && i < 24 * (l + 1); i++) {
			strc_array[l].push({
				emote: `${i + 1}. ${structures[i].name}`,
				role: '**desc**: *' + structures[i].description + '*' +
					'\n**args**: *' + structures[i].args + '*',
				inline: true
			});
		}
	}

	return strc_array.map((cmmd, index) => {
		if (index === 0) {
			return create_rich_embed(
				'Structures',
				'go to https://portal-bot.xyz/docs/regex/interpreter/structures\n\n' +
				'Prefix: ' + structure_prefix + '\n' +
				'Conditional flow manipulators\n' +
				'(if this do that, or if that do this).\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#EEB902', strc_array[0], null, null, null, null, null
			)
		} else {
			return create_rich_embed(
				null, null, '#EEB902', strc_array[index], null, null, null, null, null
			)
		}
	});
};

export function get_structure_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < structures.length; i++) {
		const strc = structures[i];
		if (strc.name === candidate) {
			return create_rich_embed(
				strc.name,
				'Type: Structure' +
				'\nPrefix: ' + structure_prefix + '\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#EEB902',
				[
					{ emote: 'Description', role: '*' + strc.super_description + '*', inline: false },
					{ emote: 'Arguments', role: '*' + strc.args + '*', inline: false },
					{ emote: 'Example', role: '*' + strc.example + '*', inline: false },
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
