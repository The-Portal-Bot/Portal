import { MessageEmbed } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { create_rich_embed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from '../classes/TypesPrtl.interface';

const portal_url = 'https://portal-bot.xyz/docs';
const interpreter_url = '/interpreter/objects';
export const structure_prefix = '{{';

const structures: InterfaceBlueprint[] = [
	{
		name: 'if',
		get: null,
		set: null,
		auth: AuthEnum.none
	}
];

export function is_structure(candidate: string): string {
	for (let i = 0; i < structures.length; i++) {
		const sub_str = String(candidate)
			.substring(1, (String(structures[i].name).length + 1));

		if (sub_str == structures[i].name) {
			return structures[i].name;
		}
	}

	return '';
}

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
		'[Structures](' + portal_url + interpreter_url + '/structures/description) ' +
		'conditional flow manipulators (if this do that, or if that do this).\n' +
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

	for (let l = 0; l <= structures.length / 25; l++) {
		strc_array[l] = []
		for (let i = (24 * l); i < structures.length && i < 24 * (l + 1); i++) {
			strc_array[l].push({
				emote: `${i + 1}. ${structures[i].name}`,
				role: `[description](${portal_url}${interpreter_url}` +
					`/structures/detailed/${(structures[i].name)})`,
				inline: true
			});
		}
	}

	return strc_array.map((cmmd, index) => {
		if (index === 0) {
			return create_rich_embed(
				'Structures',
				'[Structures](' + portal_url + interpreter_url + '/structures/description) ' +
				'conditional flow manipulators (if this do that, or if that do this).\n' +
				'Prefix: ' + structure_prefix,
				'#EEB902',
				strc_array[0],
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
				'#EEB902',
				strc_array[index],
				null,
				null,
				null,
				null,
				null
			);
		}
	});
}

export function get_structure_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < structures.length; i++) {
		const strc = structures[i];
		if (strc.name === candidate) {
			return create_rich_embed(
				strc.name,
				null,
				'#EEB902',
				[
					{ emote: `Type`, role: `structures`, inline: true },
					{ emote: `Prefix`, role: `${structure_prefix}`, inline: true },
					{
						emote: `Description`, role: `[${candidate} doc](${portal_url}${interpreter_url}` +
							`/structures/detailed/${candidate})`, inline: true
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
