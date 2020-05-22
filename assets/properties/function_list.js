module.exports =
{
	prefix: "./",
	functions: [
		{
			name: "portal",
			description: "creates a voice channel and a category for it",
			args: "!channel_name @category_name"
		},
		{
			name: "regex_portal",
			description: "sets regex-guidelines for how to display portal's title",
			args: "!regex_command"
		},
		{
			name: "regex_voice",
			description: "sets regex-guidelines for how to display voice (current portal)",
			args: "!regex_command"
		},
		{
			name: "run",
			description: "returns the log of data given in log_string",
			args: "!exec_command"
		},
		{
			name: "set",
			description: "sets the value of attribute",
			args: "!attribute !value"
		},
		{
			name: "url",
			description: "creates a url only channel and a category for it",
			args: "!channel_name @category_name"
		},
		{
			name: "save",
			description: "saves current state of server",
			args: "none"
		},
		{
			name: "help",
			description: "returns a help-list of all commands and regex manipulation",
			args: "@specific_command or @vrbl/@func/@pipe/@attr"
		},
		{
			name: "ping",
			description: "returns round trip latency",
			args: "none"
		}
	]
}