import { MessageEmbed } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { createEmded } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from '../classes/TypesPrtl.interface';

const portal_url = 'https://portal-bot.xyz/docs';
export const command_prefix = './';

const commands: InterfaceBlueprint[] = [
	{
		name: 'about',
		hover: 'about Portal',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'announce',
		hover: 'make an announcement',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'announcement',
		hover: 'create an announcement channel',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'bet',
		hover: 'get betting information',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'ban',
		hover: 'ban a member',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'corona',
		hover: 'get the latest covid19 data',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'crypto',
		hover: 'get the latest crypto currency data',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'delete',
		hover: 'bulk delete message',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'focus',
		hover: 'talk exclusively with a member',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'force',
		hover: 'force refresh your current channel',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'help',
		hover: 'get help about Portal',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'join',
		hover: 'make Portal join your current voice channel',
		auth: AuthEnum.voice,
		get: null,
		set: null
	},
	{
		name: 'joke',
		hover: 'get a joke',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'kick',
		hover: 'kick a member',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'leaderboard',
		hover: 'get current leaderboard',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'leave',
		hover: 'make Portal leave your current voice channel',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'level',
		hover: 'get your current level information',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'music',
		hover: 'create a music channel',
		auth: AuthEnum.voice,
		get: null,
		set: null
	},
	{
		name: 'news',
		hover: 'get the latest news',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'ignore',
		hover: 'ignore current channel',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'ping',
		hover: 'ping Portal',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'poll',
		hover: 'create a Poll',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'portal',
		hover: 'create a portal channel',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'ranks',
		hover: 'get current ranks',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'vendor',
		hover: 'create roll assigning message',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'roll',
		hover: 'roll a dice',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'run',
		hover: 'run text through Text Interpreter',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'set_ranks',
		hover: 'set new ranks',
		auth: AuthEnum.admin,
		get: null,
		set: null
	},
	{
		name: 'set',
		hover: 'update an attribute\'s value',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'state',
		hover: 'get current state of Portal visualised',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	// {
	// 	name: 'translate',
	//  hover: 'hover me | click me',
	// 	auth: AuthEnum.none,
	// 	get: null,
	// 	set: null
	// },
	{
		name: 'url',
		hover: 'create a url-only channel',
		auth: AuthEnum.voice,
		get: null,
		set: null
	},
	{
		name: 'weather',
		hover: 'get current weather forcast',
		auth: AuthEnum.none,
		get: null,
		set: null
	},
	{
		name: 'whoami',
		hover: 'get current information about you',
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

	return createEmded(
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
			cmmd_array[l]
				.push({
					emote: `${i + 1}. ${commands[i].name}`,
					role: `[hover or click](${portal_url}` +
						`/commands/detailed/${(commands[i].name)} "${commands[i].hover}")`,
					inline: true
				});
		}
	}

	return cmmd_array
		.map((cmmd, index) => {
			if (index === 0) {
				return createEmded(
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
				return createEmded(
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
		if (commands[i].name === candidate) {
			return createEmded(
				commands[i].name,
				null,
				'#9775A9',
				[
					{ emote: `Type`, role: `Command`, inline: true },
					{ emote: `Prefix`, role: `${command_prefix}`, inline: true },
					{
						emote: `Description`,
						role: `[hover or click](${portal_url}/commands/detailed/${candidate} "${commands[i].hover}")`,
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
