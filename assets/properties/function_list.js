module.exports =
{
	is_function: function (arg) {
		for (i = 0; i < this.functions.length; i++)
			if (String(arg).substring(1, (String(this.functions[i].name).length + 1)) == this.functions[i].name)
				return this.functions[i].name;
		return false;
	},
	get_help: function () {
		let func_array = [];
		for (i = 0; i < this.functions.length; i++) {
			func_array.push({
				emote: this.functions[i].name,
				role: '**desc**: *' + this.functions[i].description + '*' +
					'\n**args**: *' + this.functions[i].args + '*',
				inline: true
			});
		}
		return create_rich_embed('Functions',
			'Prefix: ' + this.prefix + '\nCommands to access portal bot.' +
			'\n**!**: *mandatory*, **@**: *optional*',
			'#FF7F00', func_array);
	},
	get_help_super: function (check) {
		for (i = 0; i < this.functions.length; i++) {
			let func = this.functions[i]
			if (func.name === check) {
				return create_rich_embed(
					func.name,
					'Type: Function' +
					'\nPrefix: ' + this.prefix +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF7F00',
					[
						{ emote: 'Description', role: '*' + func.super_description + '*', inline: false },
						{ emote: 'Arguments', role: '*' + func.args + '*', inline: false }
					]
				)
			}
		}
		return false;
	},
	prefix: './',
	functions: [
		{
			name: 'portal',
			description: 'creates a voice channel and a category for it',
			super_description: '**portal**, creates, portal channels. ' +
				'Portal channels are a portal to an infinite amount of voice channels, by entering ' +
				'a voice channel you are redirected to a newly created voice channel that you are ' +
				'the owner of. When everyone leaves the channel will be destroyed.\n' +
				'example: ./portal fps_portal Games\nThis line will create a portal channel with the ' +
				'name fps_portal, a category named GAMES and put the fps_portal channel in GAMES category.',
			args: '!channel_name @category_name'
		},
		{
			name: 'run',
			description: 'returns the log of data given in log_string',
			super_description: '**run**, gives you the opportunity to run regexes in any text channel. ' +
				'You can get properties about the channel you are in.\n' +
				'example: ./run games: $status_list\nThis will print out games: CS:GO\nif CS:GO is being played.' +
				'If regex is empty string it will return a dot (.)',
			args: '!exec_command'
		},
		{
			name: 'set',
			description: 'sets the value of attribute',
			super_description: '**set**, sets attributes of the current voice channel if you are the owner ' +
				'or the portal channel if you are the owner of that.\n' +
				'example: ./set member_limit 4\nThis will limit current channels member count to four users.',
			args: '!attribute !value'
		},
		{
			name: 'role_giver',
			description: 'creates a role message',
			super_description: '**role_giver**, creates a message that distributes roles.' +
				'Roles can be given or striped by reacting to the message.\n' +
				'example ./role_giver [\n' +
				'\t{ "emote_give": ":heart:", "emote_strip": ":poop:", "role": "moba" },\n' +
				'\t{ "emote_give": ":rofl:", "emote_strip": ":dog:", "role": "fps" }\n' +
				']\nThis will create a message giving/striping moba role with :heart:/:poop: and fps role with :rofl:/:dog:.',
			args: '![{ "emote_give": ":heart:", "emote_strip": ":poop:", "role": "moba" }]'
		},
		{
			name: 'url',
			description: 'creates a url only channel and a category for it',
			super_description: '**url**, creates a channel that only allows urls to be messaged.',
			args: '!channel_name @category_name'
		},
		{
			name: 'save',
			description: 'saves current state of server',
			super_description: '**save**, saves the current state of portal', // should not be spammed
			args: 'none'
		},
		{
			name: 'help',
			description: 'returns a help-list of all commands and regex manipulation',
			super_description: '**help**, sends personal messages to the one who requests them.\n' +
				'You can run ./help func, ./help vrbl, ./help attr, ./help pipe, to get only the category you choose.\n' +
				'You can run ./help specific_property, like portal or set, etc, in order to get a more descriptive '+
				'definition of the property chosen',
			args: '@specific_command or @vrbl/@func/@pipe/@attr'
		},
		{
			name: 'ping',
			description: 'returns round trip latency',
			super_description: '**ping**, returns the latency of portal bot.',
			args: 'none'
		}
	]
}
