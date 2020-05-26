module.exports =
{
	prefix: './',
	functions: [
		{
			name: 'portal',
			description: 'creates a voice channel and a category for it',
			args: '!channel_name @category_name'
		},
		{
			name: 'run',
			description: 'returns the log of data given in log_string',
			args: '!exec_command'
		},
		{
			name: 'set',
			description: 'sets the value of attribute',
			args: '!attribute !value'
		},
		{
			name: 'role_giver',
			description: 'creates a role message',
			args: '!{role_name=:emote:, ...}'
		},
		{
			name: 'url',
			description: 'creates a url only channel and a category for it',
			args: '!channel_name @category_name'
		},
		{
			name: 'save',
			description: 'saves current state of server',
			args: 'none'
		},
		{
			name: 'help',
			description: 'returns a help-list of all commands and regex manipulation',
			args: '@specific_command or @vrbl/@func/@pipe/@attr'
		},
		{
			name: 'ping',
			description: 'returns round trip latency',
			args: 'none'
		}
	]
}