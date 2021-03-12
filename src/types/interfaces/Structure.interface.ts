import { MessageEmbed } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
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
		auth: AuthEnum.none
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
			emote: '1.\tIn any text channel execute command `./run`',
			role: './run just like channel name generation uses the text interpreter',
			inline: false
		},
		{
			emote: '2.\t`./run Is it 2020 ? {{ "if": "$year", "is": "===", "with": "2020", "yes": "yes it is", "no": "no it is not" }}!`',
			role: './run executes the given text and replies with the processed output',
			inline: false
		},
		{
			emote: '3.\tAwait a reply from portal which will be `Is it 2020 ? yes it is!`',
			role: '*note that year is variable as it is preceded by &*',
			inline: false
		}
	];

	return create_rich_embed(
		'Structure Guide',
		'go to https://portal-bot.xyz/docs/interpreter/objects/structures/description\n\n' +
		'How to use structures with the Text Interpreter',
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
				'go to https://portal-bot.xyz/docs/interpreter/objects/structures/description\n\n' +
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
