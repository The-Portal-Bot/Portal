const help_mngr = require('../functions/help_manager');

module.exports =
{
	is_command: function(arg) {
		for (let i = 0; i < this.commands.length; i++) {
			if (String(arg).substring(1, (String(this.commands[i].name).length + 1)) == this.commands[i].name) {return this.commands[i].name;}
		}
		return false;
	},
	get_help: function() {
		const func_array = [];
		for (let i = 0; i < this.commands.length; i++) {
			func_array.push({
				emote: this.commands[i].name,
				role: '**desc**: *' + this.commands[i].description + '*' +
					'\n**args**: *' + this.commands[i].args + '*',
				inline: true,
			});
		}
		return help_mngr.create_rich_embed('Commands',
			'Prefix: ' + this.prefix + '\nCommands to access portal bot.' +
			'\n**!**: *mandatory*, **@**: *optional*',
			'#9775A9', func_array);
	},
	get_help_super: function(check) {
		for (let i = 0; i < this.commands.length; i++) {
			const cmmd = this.commands[i];
			if (cmmd.name === check) {
				return help_mngr.create_rich_embed(
					cmmd.name,
					'Type: Command' +
					'\nPrefix: ' + this.prefix +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#9775A9',
					[
						{ emote: 'Description', role: '*' + cmmd.super_description + '*', inline: false },
						{ emote: 'Arguments', role: '*' + cmmd.args + '*', inline: false },
						{ emote: 'Example', role: '```' + cmmd.example + '```', inline: false },
					],
				);
			}
		}
		return false;
	},
	prefix: './',
	commands: [
		{
			name: 'about',
			description: 'returns a message with information about Portal Bot.',
			super_description: '**about**, returns a message with information about Portal Bot.' +
				'Links for features and premium upgrade path is also given.',
			example: './about',
			args: 'none',
		},
		{
			name: 'announce',
			description: 'makes an announcement via portal bot to the announcement channel or creates a new channel' +
				' if arguments are given.',
			super_description: '**announce**, announce makes an announcement via portal bot to the announcement' +
				' channel, ./announce hello im jhon | i want to play games, Here what goes until the "|" is the' +
				' title and the the rest it the body your message.',
			example: './announce body | title',
			args: '<@title> | <@description>',
		},
		{
			name: 'announcement',
			description: 'sets the text channel you wrote the command in as the announcement channel or creates a' +
				' new channel if arguments are given.',
			super_description: '**announcement**, sets the text channel you wrote the command in as the announcement' +
				'channel, which means that every time someone times an announcement is displayed there. If channel is' +
				' given as argument, a new channel is created and set as announcements channel.',
			example: './announcement announcement_name | announcement_category, ./announcement announcement_name, ./announcement',
			args: '<@channel_name> | <@category_name>',
		},
		{
			name: 'auth_role_add',
			description: 'auth_role_add will add a role to the autorized list of roles that can access certain commands.',
			super_description: '**auth_role_add**, auth_role_add will add a role to the autorized list of roles that ' +
				' can access certain commands. Selected roles will be granted higher access to more powerful Portal ' +
				' commands that can manipulate the flow of the server.',
			example: './auth_role_rem one_role',
			args: '<@role_name>',
		},
		{
			name: 'auth_role_rem',
			description: 'auth_role_rem will remove a role to the autorized list of roles that can access certain commands.',
			super_description: '**auth_role_rem**, auth_role_rem will remove a role to the autorized list of roles that ' +
				' can access certain commands. Selected roles will be stripped of the higher access to more powerful Portal ' +
				' commands that can manipulate the flow of the server.',
			example: './auth_role_rem one_role',
			args: '<@role_name>',
		},
		{
			name: 'corona',
			description: 'corona replys with todays latest figures on the novel corona virus.',
			super_description: '**corona**, replys with todays latest figures on the novel corona virus. ' +
				'You can give input lower or upper case ex: gr or GR if none is given global stats are displayed.',
			example: './corona code, ./corona country, ./corona',
			args: '<@country code>, <@country country>',
		},
		{
			name: 'focus',
			description: 'focus creates a channel with the people you selected and auto deletes on set time.',
			super_description: '**focus**, solves the problem that people have when in a channel with ' +
				'a lot of people, but want to talk to another person and can over the other voices. ' +
				'With focus when both users have requested a focus on a person, they will be automatically moved ' +
				'moved to a new channel where they can speak for the average of the times they requested and when ' +
				'time elapses they will be moved back to the channel they where before focus (2min default time).',
			example: './focus user_name',
			args: '<!username> | <@time_to_focus>',
		},
		{
			name: 'force',
			description: 'creates a new channel and moves all users to new channel.',
			super_description: '**force**, creates a new channel and moves all users to new channel,' +
				' in order to get a new channel name if cooldown is still in effect.',
			example: './force',
			args: 'none',
		},
		{
			name: 'help',
			description: 'returns a help-list of all commands and regex manipulation.',
			super_description: '**help**, sends personal messages to the one who requests them.\n You can run' +
				'./help commands, ./help variables, ./help pipes, ./help attributes, ./help structures, to ' +
				'get only the category you choose.\n You can run ./help specific_property, like portal or set, etc.' +
				'In order to get a more descriptive definition of the property chosen',
			example: './help, ./help attr, ./help portal',
			args: '@specific_command OR @vrbl/@cmmd/@pipe/@attr',
		},
		{
			name: 'join',
			description: 'joins the caller\'s voice channel.',
			super_description: '**join**, joins the caller\'s voice channel. Makes announcements about people that' +
				' left and people that joined, and talks loudly every response',
			example: './join',
			args: 'none',
		},
		{
			name: 'leave',
			description: 'leaves the voice channel portal is currently in.',
			super_description: '**leave**, leaves the voice channel portal is currently in.',
			example: './leave',
			args: 'none',
		},
		{
			name: 'level',
			description: 'returns your level card.',
			super_description: '**level**, returns your level card with all member stats.',
			example: './level',
			args: 'none',
		},
		{
			name: 'music',
			description: 'sets the text channel you wrote the command in as the music channel or creates a new channel' +
				' if arguments are given.',
			super_description: '**music**, sets the text channel you wrote the command in as the music channel or' +
				' creates a new channel if arguments are given. In the music channel there is a music player and' +
				' nothing else. Users can request songs write there and play/pause/stop/skip the current song.',
			example: './music music_name | music_category, ./music music_name, ./music',
			args: '<@channel_name> | <@category_name>',
		},
		{
			name: 'ping',
			description: 'returns round trip latency.',
			super_description: '**ping**, returns the latency of portal bot.',
			example: './ping',
			args: 'none',
		},
		{
			name: 'portal',
			description: 'creates a voice channel and a category for it.',
			super_description: '**portal**, creates, portal channels. ' +
				'Portal channels are a portal to an infinite amount of voice channels, by entering ' +
				'a voice channel you are redirected to a newly created voice channel that you are ' +
				'the owner of. When everyone leaves the channel will be destroyed.\n',
			example: './portal portal_name | portal_category, ./portal portal_name',
			args: '<!channel_name> | <@category_name>',
		},
		{
			name: 'ranks',
			description: 'returns your Ranking system of current server.',
			super_description: '**ranks**, returns your Ranking system of current server (if one is set).',
			example: './ranks',
			args: 'none',
		},
		{
			name: 'role',
			description: 'creates a role message.',
			super_description: '**role**, creates a message that distributes roles.' +
				'Roles can be given or striped by reacting to the message.\n' +
				'(Please make sure you have no space infront or behind *role name* or *emotes*)',
			example: 'json\n./role ' +
				'[\n\t{ "give": ":heart:", "strip": ":poop:", "role": "moba" },\n' +
				'\t{ "give": ":rofl:", "strip": ":dog:", "role": "fps" }\n]\n' +
				'\n>This will create a message giving/striping moba role with :heart:/:poop: and fps role with :rofl:/:dog:.',
			args: '```json\nJSON array of objects:\n{ "give": ":heart:", "strip": ":poop:", "role": "moba" }```',
		},
		{
			name: 'run',
			description: 'returns the log of data given in log_string.',
			super_description: '**run**, gives you the opportunity to run regexes in any text channel. ' +
				'You can get properties about the channel you are in.\n' +
				'If regex is empty string it will return a dot (.)',
			example: './run $member_count &locale\nthis will return 4 and gr if member count and locale are that',
			args: '<!exec_command>',
		},
		{
			name: 'save',
			description: 'saves current state of server.',
			super_description: '**save**, saves the current state of portal', // should not be spammed
			example: './save',
			args: 'none',
		},
		{
			name: 'set',
			description: 'sets the value of attribute.',
			super_description: '**set**, sets attributes of the current voice channel if you are the owner ' +
				'or the portal channel if you are the owner of that.\n',
			example: './set locale gr',
			args: '<!attribute> <!value>',
		},
		{
			name: 'set_ranks',
			description: 'creates your ranking system.',
			super_description: '**ranks**, creates your ranking system by which roles are distributed by reachig.' +
				'certain levels that have been defined.',
			example: 'json\n./role ' +
				'[\n\t{ "level": "2", "role": "Alpha" },\n' +
				'\t{ "level": "5", "role": "Beta" }\n]\n',
			args: '```json\nJSON array of objects:\n{ "level": "2", "role": "Alpha" }```',
		},
		{
			name: 'setup',
			description: 'creates a portal, spotify, url-only and announcement channel automatically.',
			super_description: '**setup**, will autogenerate a portal, spotify, url-only and announcement channels ' +
				'at once, removing the hustle of setting up the server.\n',
			example: './setup',
			args: 'none',
		},
		{
			name: 'spotify',
			description: 'sets the text channel you wrote the command in as the Spotify channel or creates a new channel' +
				' if arguments are given.',
			super_description: '**spotify**, sets the text channel you wrote the command in as the Spotify channel, ' +
				'which means that every time someone listens to a song on Spotify it will be displayed. If channel is given as ' +
				'argument, a new channel is created and set as Spotify channel.',
			example: './spotify spotify_name | spotify_category, ./spotify spotify_name, ./spotify',
			args: '<@channel_name> | <@category_name>',
		},
		{
			name: 'url',
			ddescription: 'sets the text channel you wrote the command in as the url channel or creates a new channel' +
				' if arguments are given.',
			super_description: '**url**, sets the text channel you wrote the command in as the url channel, ' +
				'which means that every time someone listens to a song on url it will be displayed. If channel is given as ' +
				'argument, a new channel is created and set as url channel.',
			example: './url url_name | url_category, ./url url_name, ./url',
			args: '<@channel_name> | <@category_name>',
		},
	],
};
