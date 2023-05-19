import { EmbedBuilder } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { createEmbed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from '../classes/PTypes.interface';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';
export const STRUCTURE_PREFIX = '{{';

const structures: InterfaceBlueprint[] = [
	{
		name: 'if',
		hover: 'if statement flow control',
		get: null,
		set: null,
		auth: AuthEnum.none
	}
];

export function isStructure(candidate: string): string {
	for (let i = 0; i < structures.length; i++) {
		const subString = String(candidate)
			.substring(1, (String(structures[i].name).length + 1));

		if (subString == structures[i].name) {
			return structures[i].name;
		}
	}

	return '';
}

export function getStructureGuide(): EmbedBuilder {
	const structArray: Field[] = [
		{
			emote: 'Used in Regex Interpreter',
			role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
			inline: true
		},
		{
			emote: 'structures are flow manipulators',
			role: '*you can change the outcome of the regex corresponding with live data*',
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

	return createEmbed(
		'Structure Guide',
		'[Structures](' + PORTAL_URL + INTERPRETER_URL + '/structures/description) ' +
		'conditional flow manipulators (if this do that, or if that do this).\n' +
		'How to use structures with the Text Interpreter',
		'#EEB902',
		structArray,
		null,
		null,
		null,
		null,
		null
	);
}

export function getStructureHelp(): EmbedBuilder[] {
	const structArray: Field[][] = [];

	for (let l = 0; l <= structures.length / 25; l++) {
		structArray[l] = []
		for (let i = (24 * l); i < structures.length && i < 24 * (l + 1); i++) {
			structArray[l].push({
				emote: `${i + 1}. ${structures[i].name}`,
				role: `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
					`/structures/detailed/${(structures[i].name)} "${(structures[i].hover)}")`,
				inline: true
			});
		}
	}

	return structArray.map((command, index) => {
		if (index === 0) {
			return createEmbed(
				'Structures',
				'[Structures](' + PORTAL_URL + INTERPRETER_URL + '/structures/description) ' +
				'conditional flow manipulators (if this do that, or if that do this).\n' +
				'Prefix: ' + STRUCTURE_PREFIX,
				'#EEB902',
				structArray[0],
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
				'#EEB902',
				structArray[index],
				null,
				null,
				null,
				null,
				null
			);
		}
	});
}

export function getStructureHelpSuper(candidate: string): EmbedBuilder | boolean {
	for (let i = 0; i < structures.length; i++) {
		if (structures[i].name === candidate) {
			return createEmbed(
				structures[i].name,
				null,
				'#EEB902',
				[
					{ emote: `Type`, role: `structures`, inline: true },
					{ emote: `Prefix`, role: `${STRUCTURE_PREFIX}`, inline: true },
					{
						emote: `Description`, role: `[hover or click](${PORTAL_URL}${INTERPRETER_URL}` +
							`/structures/detailed/${candidate} "${(structures[i].name)}")`, inline: true
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
