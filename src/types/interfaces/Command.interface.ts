import { MessageEmbed } from 'discord.js';
import { create_rich_embed } from '../../libraries/help.library';
import { Field, InterfaceBlueprint } from './InterfacesPrtl.interface';

export const command_prefix: string = './';
const commands: InterfaceBlueprint[] = [
	{
		name: 'about',
		description: 'returns a message with information about Portal Bot',
		super_description: '**about**, returns a message with information about Portal Bot' +
			'Links for features and premium upgrade path is also given',
		example: './about',
		args: 'none',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'announce',
		description: 'makes an announcement via portal bot to the announcement channel or creates a new channel' +
			' if arguments are given',
		super_description: '**announce**, announce makes an announcement via portal bot to the announcement' +
			' channel, ./announce hello im jhon | i want to play games, Here what goes until the "|" is the' +
			' title and the the rest it the body your message',
		example: './announce body | title',
		args: '<@title> | <@description>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'announcement',
		description: 'sets the text channel you wrote the command in as the announcement channel or creates a' +
			' new channel if arguments are given',
		super_description: '**announcement**, sets the text channel you wrote the command in as the announcement' +
			'channel, which means that every time someone times an announcement is displayed there. If channel is' +
			' given as argument, a new channel is created and set as announcements channel',
		example: './announcement announcement_name | announcement_category, ./announcement announcement_name, ./announcement',
		args: '<@channel_name> | <@category_name>',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'bet',
		description: 'bet replys with todays latest requested betting report',
		super_description: '**bet**, replys with todays latest requested betting report. ' +
			'You have to specify both provide and game you wan to get the stats from',
		example: './bet opap tzoker',
		args: '<!provider> <!game>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'corona',
		description: 'corona replys with todays latest figures on the novel corona virus',
		super_description: '**corona**, replys with todays latest figures on the novel corona virus. ' +
			'You can give input lower or upper case ex: gr or GR if none is given global stats are displayed',
		example: './corona gr',
		args: '<!country code> or <!country name>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'crypto',
		description: 'crypto replys with todays latest prices of crypto currencies',
		super_description: '**crypto**, replys with todays latest prices of crypto currencies',
		example: './crypto bitcoin | usd',
		args: '<!crypto currency> | <!authority currency>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'delete',
		description: 'delete will remove number of messages given',
		super_description: '**delete**, elete will remove number of messages given, keep in mind that you basically delete\n' +
			'n+1 messages because portal deletes the command delete you send and n more messages',
		example: './delete 5',
		args: '<!number of messages>',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'focus',
		description: 'focus creates a channel with the people you selected and auto deletes on set time',
		super_description: '**focus**, solves the problem that people have when in a channel with ' +
			'a lot of people, but want to talk to another person and can over the other voices. ' +
			'With focus when both users have requested a focus on a person, they will be automatically moved ' +
			'moved to a new channel where they can speak for the average of the times they requested and when ' +
			'time elapses they will be moved back to the channel they where before focus (2min default time)',
		example: './focus user_name',
		args: '<!username> | <@time_to_focus>',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'force',
		description: 'creates a new channel and moves all users to new channel',
		super_description: '**force**, creates a new channel and moves all users to new channel,' +
			' in order to get a new channel name if cooldown is still in effect',
		example: './force',
		args: 'none',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'help',
		description: 'returns a help-list of everything Portal can do',
		super_description: '**help**, a help-list of everything Portal can do.\n You can run' +
			'./help commands, ./help variables, ./help pipes, ./help attributes, ./help structures, to ' +
			'get only the category you choose.\n You can run ./help specific_property, like portal or set, etc' +
			'In order to get a more descriptive definition of the property chosen',
		example: './help, ./help attr, ./help portal',
		args: '@specific_command OR @vrbl/@cmmd/@pipe/@attr',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'join',
		description: 'joins the caller\'s voice channel',
		super_description: '**join**, joins the caller\'s voice channel. Makes announcements about people that' +
			' left and people that joined, and talks loudly every response',
		example: './join',
		args: 'none',
		auth: 'voice',
		get: null,
		set: null
	},
	{
		name: 'joke',
		description: 'returns a joke',
		super_description: '**joke**, returns a joke. You can specify the category of joke by' +
			' using arguments: dad, chuck, blonde, knock-knock, animal or jod' +
			' By default it is about you',
		example: './joke',
		args: '<@category>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'leaderboard',
		description: 'returns the leaderboard',
		super_description: '**leaderboard**, returns the leaderboard',
		example: './leaderboard 5',
		args: '<@number_of_ranks>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'leave',
		description: 'leaves the voice channel portal is currently in',
		super_description: '**leave**, leaves the voice channel portal is currently in',
		example: './leave',
		args: 'none',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'level',
		description: 'returns your level card',
		super_description: '**level**, returns your level card with all member stats',
		example: './level',
		args: 'none',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'music',
		description: 'sets the text channel you wrote the command in as the music channel or creates a new channel' +
			' if arguments are given',
		super_description: '**music**, sets the text channel you wrote the command in as the music channel or' +
			' creates a new channel if arguments are given. In the music channel there is a music player and' +
			' nothing else. Users can request songs write there and play/pause/stop/skip the current song',
		example: './music music_name | music_category, ./music music_name, ./music',
		args: '<@channel_name> | <@category_name>',
		auth: 'voice',
		get: null,
		set: null
	},
	{
		name: 'news',
		description: 'news replys with todays latest news',
		super_description: '**news**, replys with todays latest news. ' +
			'for the category you requested.\nCategories: arts, automobiles, books, ' +
			'business, fashion, food, health, home, insider, magazine, movies, ' +
			'nyregion, obituaries, opinion, politics, realestate, science, sports, ' +
			'sundayreview, technology, theater, t-magazine, travel, upshot, us, world',
		example: './news world',
		args: '<!category>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'ignore',
		description: 'ignores the current voice channel, Portal will not reply to them' +
			' if arguments are given',
		super_description: '**ignore**, sets the text channel you wrote the command in a ignore channel.' +
			' Portal will not respond to anything that is written in it.',
		example: './ignore`',
		args: '<@member_id>',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'ping',
		description: 'returns round trip latency',
		super_description: '**ping**, returns the latency of portal bot',
		example: './ping',
		args: 'none',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'poll',
		description: 'creates a poll',
		super_description: '**poll**, creates poll, with up to 4 options and 5 minutes in duration',
		example: 'json\n./poll How much should I pay for a new phone ? | ' +
			'[\n\t"<299$",' +
			'\n\t">299$"' +
			']',
		args: '[JSON type]```json\n[ ... ]```',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'portal',
		description: 'creates a voice channel and a category for it',
		super_description: '**portal**, creates, portal channels. ' +
			'Portal channels are a portal to an infinite amount of voice channels, by entering ' +
			'a voice channel you are redirected to a newly created voice channel that you are ' +
			'the owner of. When everyone leaves the channel will be destroyed.\n',
		example: './portal portal_name | portal_category, ./portal portal_name',
		args: '<!channel_name> | <@category_name>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'ranks',
		description: 'returns your Ranking system of current server',
		super_description: '**ranks**, returns your Ranking system of current server (if one is set)',
		example: './ranks',
		args: 'none',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'role_assigner',
		description: 'creates a role giving message',
		super_description: '**role_assigner**, creates a message that distributes roles.\n' +
			'Roles can be given or striped by reacting to the message',
		example: 'json\n./role_assigner ' +
			'[\n\t{\n\t\t"give": ":thumbsup:",\n\t\t"strip": ":thumbsdown:",\n\t\t"role_id": "moba"\n\t},' +
			'\n\t{\n\t\t"give": ":rofl:",\n\t\t"strip": ":dog:",\n\t\t"role_id": "fps"\n\t}\n]\n' +
			'\n// will create a message giving/stripping\n// moba role with :thumbsup:/:thumbsdown:\n// fps role with :rofl:/:dog:',
		args: '[JSON type]```json\n[\n\t{\n\t\t"give": ":thumbsup:",\n\t\t"strip": ":thumbsdown:",\n\t\t"role_id": "moba"\n\t}\n]```',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'roll',
		description: 'rolls requested dice',
		super_description: '**roll**, rolls requested dice you can also combine rolls' +
			'Rolls are following the same philosophy as roll20 does',
		example: './roll 3d12+5',
		args: '<!roll configuration>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'run',
		description: 'returns the log of data given in log_string',
		super_description: '**run**, gives you the opportunity to run regexes in any text channel. ' +
			'You can get properties about the channel you are in.\n' +
			'If regex is empty string it will return a dot (.)',
		example: './run $member_count &g.locale\n\nwill return 4 and gr if member count and locale are that',
		args: '<!exec_command>',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'save',
		description: 'saves current state of server',
		super_description: '**save**, saves the current state of portal', // should not be spammed
		example: './save',
		args: 'none',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'set_ranks',
		description: 'creates your ranking system',
		super_description: '**ranks**, creates your ranking system, by which roles are given when ' +
			'they reach a certain level. It is a one time process and every time it is updated it ' +
			'it replaces the previous ranking system',
		example: 'json\n./set_ranks ' +
			'[\n\t{\n\t\t"level": "2",\n\t\t"role": "Alpha"\n\t},' +
			'\n\t{\n\t\t"level": "5",\n\t\t"role": "Beta"\n\t}\n]\n',
		args: '[JSON type]```json\n[\n\t{\n\t\t"level": "2", \n\t\t"role": "Alpha"\n\t}\n]```',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'set',
		description: 'sets the value of attribute',
		super_description: '**set**, sets attributes of the current voice channel if you are the owner ' +
			'or the portal channel if you are the owner of that.\n',
		example: './set locale gr',
		args: '<!attribute> <!value>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'setup',
		description: 'creates a portal, url-only and announcement channel automatically',
		super_description: '**setup**, will autogenerate a portal, url-only and announcement channels ' +
			'at once, removing the hustle of setting up the server.\n',
		example: './setup',
		args: 'none',
		auth: 'admin',
		get: null,
		set: null
	},
	{
		name: 'state',
		description: 'returns a visualisation of Portal\'s current state',
		super_description: '**state**, returns a visualisation of Portal\'s current state, ' +
			'which means all portal channels with their controlled voice channels ' +
			'announcement, ignored and url channels',
		example: './state',
		args: 'none',
		auth: 'none',
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
	// 	auth: 'none',
	// 	get: null,
	// 	set: null
	// },
	{
		name: 'url',
		description: 'sets the text channel you wrote the command in as the url channel or creates a new channel' +
			' if arguments are given',
		super_description: '**url**, sets the text channel you wrote the command in as the url channel, ' +
			'which means that every time someone listens to a song on url it will be displayed. If channel is given as ' +
			'argument, a new channel is created and set as url channel',
		example: './url url_name | url_category, ./url url_name, ./url',
		args: '<@channel_name> | <@category_name>',
		auth: 'voice',
		get: null,
		set: null
	},
	{
		name: 'weather',
		description: 'returns current live weather stats for given location',
		super_description: '**weather**, returns current live weather stats for given location, ' +
			'location can be specified in detail, but most always be a location',
		example: './weather Athens, Greece, ./weather athens',
		args: '<!location_name>',
		auth: 'none',
		get: null,
		set: null
	},
	{
		name: 'whoami',
		description: 'returns information about you',
		super_description: '**whoami**, returns information about you',
		example: './whoami',
		args: 'none',
		auth: 'none',
		get: null,
		set: null
	}
];

export function is_command(candidate: string): string {
	for (let i = 0; i < commands.length; i++) {
		if (String(candidate).substring(1, (String(commands[i].name).length + 1)) == commands[i].name) { return commands[i].name; }
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
		'go to https://portal-bot.xyz/docs/commands\n\n' +
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

	for (let l = 0; l <= commands.length / 24; l++) {
		cmmd_array[l] = []
		for (let i = (24 * l); i < commands.length && i < 24 * (l + 1); i++) {
			cmmd_array[l].push({
				emote: `${i + 1}. ${commands[i].name}`,
				role: '**desc**: *' + commands[i].description + '*' +
					'\n**args**: *' + commands[i].args + '*',
				inline: true
			});
		}
	}

	return cmmd_array.map((cmmd, index) => {
		if (index === 0) {
			return create_rich_embed(
				'Commands',
				'go to https://portal-bot.xyz/docs/commands\n\n' +
				'Prefix: *' + command_prefix + '*\n' +
				'**The way to communicate with Portal.**\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#9775A9', cmmd_array[0], null, null, null, null, null
			);
		} else {
			return create_rich_embed(
				null, null, '#9775A9', cmmd_array[index], null, null, null, null, null
			);
		}
	});
};

export function get_command_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < commands.length; i++) {
		const cmmd = commands[i];
		if (cmmd.name === candidate) {
			return create_rich_embed(
				cmmd.name,
				'Type: Command' +
				'\nPrefix: ' + command_prefix + '\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#9775A9',
				[
					{ emote: 'Description', role: '*' + cmmd.super_description + '*', inline: false },
					{ emote: 'Arguments', role: '*' + cmmd.args + '*', inline: false },
					{ emote: 'Example', role: '```' + cmmd.example + '```', inline: false },
					{ emote: 'Clearance', role: '' + cmmd.auth + '', inline: false }
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
};

