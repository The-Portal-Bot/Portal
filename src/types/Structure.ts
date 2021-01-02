import { MessageEmbed } from 'discord.js';
import { create_rich_embed } from '../libraries/help_manager';
import { ObjectFunction } from './TypePortal';

export const structure_prefix: string = '{{';
const structures: ObjectFunction[] = [
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
			'> You cannot encapsulate if statements.',
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

export function get_structure_help(): MessageEmbed {
	const strc_array = [];
	for (let i = 0; i < structures.length; i++) {
		strc_array.push({
			emote: structures[i].name,
			role: '**desc**: *' + structures[i].description + '*' +
				'\n**args**: *' + structures[i].args + '*',
			inline: true,
		});
	}
	return create_rich_embed('Structures',
		'Prefix: ' + structure_prefix + '\nStructural functionality.' +
		'\n**!**: *mandatory*, **@**: *optional*',
		'#EEB902', strc_array,
		null,
		null,
		null,
		null,
		null);
};

export function get_structure_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < structures.length; i++) {
		const strc = structures[i];
		if (strc.name === candidate) {
			return create_rich_embed(
				strc.name,
				'Type: Structure' +
				'\nPrefix: ' + structure_prefix +
				'\n**!**: *mandatory*, **@**: *optional*',
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
