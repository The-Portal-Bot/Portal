import { MessageEmbed } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { create_rich_embed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from '../classes/TypesPrtl.interface';

const portal_url = 'https://portal-bot.xyz/docs';
export const command_prefix = './';

const commands: InterfaceBlueprint[] = [
	{
		name: 'about',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'announce',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'announcement',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'bet',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'ban',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'corona',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'crypto',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'delete',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'focus',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'force',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'help',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'join',
		auth: AuthEnum.voice,
		get: null,
		set: null
	},
	{
		name: 'joke',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'kick',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'leaderboard',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'leave',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'level',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'music',
		auth: AuthEnum.voice,
		get: null,
		set: null
	},
	{
		name: 'news',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'ignore',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'ping',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'poll',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'portal',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'ranks',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'role_assigner',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'roll',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'run',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'save',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'set_ranks',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'set',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'state',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	// {
	// 	name: 'translate',
	// 	description: 'returns given text in translated language',
	// 	super_description: '**translate**, returns given text in translated language, ' +
	// 		'will always attempt to translate even if language given does not match from argument',
	// 	example: './translate en,gr | What is the weather like, ./translate gr | What is the weather like',
	// 	args: '<!from>,<!to> | <!text>, <!to> | <!text>',
	// 	auth: AuthEnum.none,
	// 	get: null,
	// 	set: null
	// },
	{
		name: 'url',
		auth: AuthEnum.voice,
		get: null,
		set: null
	},
	{
		name: 'weather',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'whoami',
		auth: AuthEnum.none,
		get: null,
		set: null
	}
];

export function is_command(candidate: string): string {
	for (let i = 0; i < commands.length; i++) {
		const sub_str = String(candidate)
			.substring(1, (String(commands[i].name).length + 1));

		if (sub_str == commands[i].name) {
			return commands[i].name;
		}
	}

	return '';
}

export function get_command_guide(): MessageEmbed {
	const cmmd_array: Field[] = [
		{
			emote: '1. Go to any channel',
			role: '*you can write commands in any channel and Portal will see them*',
			inline: false
		},
		{
			emote: '2. `./help`',
			role: '*write your command, for example help*',
			inline: false
		},
		{
			emote: '3. Wait for portal response',
			role: '*portal will reply to almost all commands with an action or/and message*',
			inline: false
		}
	];

	return create_rich_embed(
		'Command Guide',
		'[Commands](' + portal_url + '/commands/description) ' +
		'are the way you communicate with Portal.\n' +
		'how to use commands',
		'#9775A9',
		cmmd_array,
		null,
		null,
		null,
		null,
		null
	);
}

export function get_command_help(): MessageEmbed[] {
	const cmmd_array: Field[][] = [];

	for (let l = 0; l <= commands.length / 25; l++) {
		cmmd_array[l] = []
		for (let i = (24 * l); i < commands.length && i < 24 * (l + 1); i++) {
			cmmd_array[l].push({
				emote: `${i + 1}. ${commands[i].name}`,
				role: `[description](${portal_url}` +
					`/commands/detailed/${(commands[i].name)})`,
				inline: true
			});
		}
	}

	return cmmd_array.map((cmmd, index) => {
		if (index === 0) {
			return create_rich_embed(
				'Commands',
				'[Commands](' + portal_url + '/commands/description) ' +
				'are the way you communicate with Portal.\n' +
				'Prefix: ' + command_prefix,
				'#9775A9',
				cmmd_array[0],
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
				'#9775A9',
				cmmd_array[index],
				null,
				null,
				null,
				null,
				null
			);
		}
	});
}

export function get_command_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < commands.length; i++) {
		const cmmd = commands[i];
		if (cmmd.name === candidate) {
			return create_rich_embed(
				cmmd.name,
				null,
				'#9775A9',
				[
					{ emote: `Type`, role: `Command`, inline: true },
					{ emote: `Prefix`, role: `${command_prefix}`, inline: true },
					{
						emote: `Description`,
						role: `[${candidate} doc](${portal_url}/commands/detailed/${candidate})`,
						inline: true
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
