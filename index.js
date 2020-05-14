const regex = require('./functions/regex_interpreter.js');
const editor = require('./functions/channel_manipulation.js');

// Load up the discord.js library
const Discord = require('discord.js');

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values.
const config = require('./config.json');
// config.token contains the bot's token
// config.prefix contains the message prefix.


// All data is stored from portal list to its voice channel list, which is encapsulated
let portal_list = new Array();
// LISTENERS

client.on('ready', () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
	// Example of changing the bot's playing game to something useful. `client.user` is what the
	// docs refer to as the 'ClientUser'.
	//client.user.setActivity(`Serving ${client.guilds.size} servers`);
	client.user.setActivity('./portal channel', { type: 'LISTENING' });
});

client.on('guildCreate', guild => {
	// This event triggers when the bot joins a guild.
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	// client.user.setActivity(`Serving ${client.guilds.size} servers`);
	client.user.setActivity(`[create-portal <categ.> <chan.>`);
});

client.on('guildDelete', guild => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
	client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
	regex.generate_channel_names(newPresence.guild, portal_list);
	//regex.generate_channel_names(newPresence.guild, voice_list, regex_string_id);

	for (i = 0; i < portal_list.length; i++) {
		console.log(i + ') Portal channel with id: ' + portal_list[i].id + ' has voice channels: [');
		for (j = 0; j < portal_list[i].voice_list.length; j++) {
			console.log('\t' + j + ') voice channel with id: ' + portal_list[i], portal_list[i].voice_list[j].id);
		}
		console.log(']\n')
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	let new_user_channel = newState.voiceChannel; console.log('new_user_channel: ' + new_user_channel);
	let old_user_channel = oldState.voiceChannel; console.log('old_user_channel: ' + old_user_channel);

	if (old_user_channel === undefined && new_user_channel !== undefined) // JOIN from undefined
	{
		console.log('undefined->existing')

		if (editor.included_in_portal_list(new_user_channel.id, portal_list)) {
			// user joined portal channel
			editor.create_voice_channel(newState, portal_list, newState.user.id);
			regex.generate_channel_names(newState.guild, portal_list);
		}
		else if (editor.included_in_voice_list(new_user_channel.id, portal_list)) {
			// user joined voice channel
			regex.generate_channel_names(newState.guild, portal_list);
		}
	}
	else if (new_user_channel === undefined && old_user_channel !== undefined) // LEAVE to undefined
	{
		console.log('existing->undefined')

		if (editor.included_in_portal_list(old_user_channel.id, portal_list)) {
			// user leaves portal channel
			// is handled before
		}
		else if (editor.included_in_voice_list(old_user_channel.id, portal_list)) {
			// user left voice channel
			if (old_user_channel.members.size === 0) {
				editor.delete_voice_channel(old_user_channel, portal_list);
			}
		}
	}
	// user was moved from channel to channel
	else if (new_user_channel !== undefined && old_user_channel !== undefined) {
		console.log('existing->existing')

		if (editor.included_in_portal_list(old_user_channel.id, portal_list)) {
			console.log('->source: portal_list');

			if (editor.included_in_portal_list(new_user_channel.id, portal_list)) {
				console.log('->dest: portal_list')
				// this should not happen
				console.log('this should not happen error: portal_channel->portal_channel')
			}
			else if (editor.included_in_voice_list(new_user_channel.id, portal_list)) {
				console.log('->dest: voice_list')
				// has been checked before
				console.log('has been checked before')
				regex.generate_channel_names(newState.guild, portal_list);
			}
			else {
				console.log('->dest: unknown')
				// leaves portal channel and joins another unknown
				regex.generate_channel_names(newState.guild, portal_list);
			}
		}
		else if (editor.included_in_voice_list(old_user_channel.id, portal_list)) {
			console.log('->source: voice_list');

			if (editor.included_in_portal_list(new_user_channel.id, portal_list)) {
				console.log('->dest: portal_list')
				// leaves created channel and joins portal
				if (old_user_channel.members.size === 0) {
					editor.delete_voice_channel(old_user_channel, portal_list);
				}
				// user joined portal channel
				editor.create_voice_channel(newState, portal_list, newState.user.id);
				regex.generate_channel_names(newState.guild, portal_list);
			}
			else if (editor.included_in_voice_list(new_user_channel.id, portal_list)) {
				console.log('->dest: voice_list')
				// leaves created channel and joins another created
				if (old_user_channel.members.size === 0) {
					editor.delete_voice_channel(old_user_channel, portal_list);
				}
				regex.generate_channel_names(newState.guild, portal_list);
			}
			else {
				console.log('->dest: unknown')
				// leaves created channel and joins another unknown
				if (old_user_channel.members.size === 0) {
					editor.delete_voice_channel(old_user_channel, portal_list);
				}
				regex.generate_channel_names(newState.guild, portal_list);
			}
		}
		else {
			console.log('->source: unknown voice');

			if (editor.included_in_portal_list(new_user_channel.id, portal_list)) {
				console.log('->dest: portal_list')
				// user joined portal channel
				editor.create_voice_channel(newState, portal_list, newState.user.id);
				regex.generate_channel_names(newState.guild, portal_list);
			}
			else if (editor.included_in_voice_list(new_user_channel.id, portal_list)) {
				console.log('->dest: voice_list')
				// leaves created channel and joins another created
				regex.generate_channel_names(newState.guild, portal_list);
			}
		}
	}
	else if (new_user_channel === undefined && old_user_channel === undefined) {
		console.log('undefined->undefined')
	}
	else {
		console.log('don\'t know how we got here')
	}

	console.log('PORTAL CHANNELS: ' + portal_list.length)
	console.log('')
})

client.on('message', async message => {
	// This event will run on every single message received, from any channel or DM.

	// It's good practice to ignore other bots. This also makes your bot ignore itself
	// and not get into a spam loop (we call that 'botception').
	if (message.author.bot) return;

	// Also good practice to ignore any message that does not start with our prefix,
	// which is set in the configuration file.
	if (message.content.indexOf(config.prefix) !== 0) return;

	// Here we separate our 'command' name, and our 'arguments' for the command.
	// e.g. if we have the message '+say Is this the real life?' , we'll get the following:
	// command = say
	// args = ['Is', 'this', 'the', 'real', 'life?']
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command === 'portal') {
		if (args.length === 2) {
			editor.create_portal_channel(message.guild, args[0], args[1], portal_list, message.member.id);
			message.react('✔️');
		}
		else if (args.length === 1) {
			editor.create_portal_channel(message.guild, args[0], null, portal_list, message.member.id);
			message.react('✔️');
		}
		else {
			message.react('❌');
			message.channel.send('**' + config.prefix + 'portal <channel_name> <category_name>**\n' +
				'*(channel_name: mandatory, category_name: optional)*')
		}
	}

	if (command === 'portal_regex') {
		if (message.member.voiceChannel === undefined) {
			message.channel.send("**You must be in portal's voice channel to change the portal regex**");
			message.react('❌');
			return;
		}

		if (args.length > 0) {
			//change portal regex
			for (i = 0; i < portal_list.length; i++) {
				for (j = 0; j < portal_list[i].voice_list.length; j++) {
					if (portal_list[i].voice_list[j].id === message.member.voiceChannel.id) {
						portal_list[i].regex_portal = args.join(' ');

						message.guild.channels.forEach((value) => {
							if (value.id === portal_list[i].id) {
								value.setName(
									regex.regex_interpreter(
										portal_list[i].regex_portal,
										portal_list[i].id,
										message.guild,
										portal_list
									)
								);
							}
						});

						message.react('✔️');
						return;
					}
				}
			}
			message.channel.send('You are not a portal controlled voice channel');
		}
		else {
			message.channel.send('You should enter a portal regex');
		}
	}

	if (command === 'voice_regex') {
		if (message.member.voiceChannel === undefined) {
			message.channel.send("**You must be in portal's voice channel to change the voice regex**");
			message.react('❌');
			return;
		}

		if (args.length > 0) {
			//change voice regex
			for (i = 0; i < portal_list.length; i++) {
				for (j = 0; j < portal_list[i].voice_list.length; j++) {
					if (portal_list[i].voice_list[j].id === message.member.voiceChannel.id) {
						portal_list[i].regex_voice = args.join(' ');
						message.member.voiceChannel.setName(
							regex.regex_interpreter(
								portal_list[i].regex_voice,
								portal_list[i].id,
								message.guild,
								portal_list
							)
						);
						message.react('✔️');
						return;
					}
				}
			}
			message.channel.send('You are not a portal controlled voice channel');
		}
		else {
			message.channel.send('You should enter a voice regex');
		}
	}

	//testing processes
	if (command === 'purge') {
		let current_guild = message.guild;

		message.guild.channels.forEach((value) => {
			if (value.deletable)
				value.delete()
					.then(g => console.log(`Deleted the guild ${g}`))
					.catch(console.error);
		})

		current_guild.createChannel('general voice', { type: 'voice' }, { bitrate: 64 })
			.then(
				current_guild.createChannel('general text', { type: 'text' })
					.then(value => {
						value.send('**PURGE DONE**')
					})
			)
	}

	if (command === 'ping') {
		// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
		// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
		const m = await message.channel.send('Ping?');
		m.edit('Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.\n',
			'API Latency is ${Math.round(client.ping)}ms');
	}

	if (command === 'help') {
		let func_name = [
			{ name: 'portal', value: 'creates a voice channel and a category for it', args: '!channel_name @category_name' },
			{ name: 'text', value: 'creates a text channel connected to the voice channel', args: 'none' },
			{ name: 'regex', value: 'sets regex-guidelines for how to name channels (current portal)', args: '!regex_command' },
			{ name: 'run', value: 'returns the log of data given in log_string', args: '!exec_command' },
			{ name: 'prefix', value: 'sets the new prefix for portal bot', args: '!prefix' },
			{ name: 'help', value: 'returns a help-list of all commands and regex manipulation', args: '@specific_command or @vrbl/@func/@pipe/@attr' },
			{ name: 'ping', value: 'returns round trip latency', args: 'none' }
		];

		let vrbl_name = [
			{ name: '#', value: 'number of channel in list', args: 'none' },
			{ name: '##', value: 'number of channel in list with \#', args: 'none' },
			{ name: 'date', value: 'full date: dd/mm/yyyy', args: 'none' },
			{ name: 'cday', value: 'gets the day', args: 'none' },
			{ name: 'mnth', value: 'gets the month', args: 'none' },
			{ name: 'year', value: 'gets the year', args: 'none' },
			{ name: 'time', value: 'full time: hh/mm/ss', args: 'none' },
			{ name: 'hour', value: 'gets the hour', args: 'none' },
			{ name: 'mint', value: 'gets the minute', args: 'none' },
			{ name: 'scnd', value: 'gets the second', args: 'none' },
			{ name: 'crtr', value: 'creator of the channel', args: 'none' },
			{ name: 'game_lst', value: 'list of currently played games', args: 'none' },
			{ name: 'game_cnt', value: 'number of games being played', args: 'none' },
			{ name: 'game_his', value: 'list of all games played from beginning', args: 'none' },
			{ name: 'mmbr_lst', value: 'returns the currently played games', args: 'none' },
			{ name: 'mmbr_cnt', value: 'number of members in channel', args: 'none' },
			{ name: 'mmbr_plg', value: 'number of members playing', args: 'none' },
			{ name: 'mmbr_his', value: 'returns the currently played games', args: 'none' },
			{ name: 'mmbr_lmt', value: 'sets the limit of users in channel', args: 'none' }
		];

		let pipe_name = [
			{ name: 'upper', value: 'makes input uppercase', args: 'none' },
			{ name: 'lower', value: 'makes input lowercase', args: 'none' },
			{ name: 'titl', value: 'makes input titlecase', args: 'none' },
			{ name: 'acrm', value: 'makes input string of acronyms', args: 'none' },
			{ name: 'word#', value: 'maximum number of words (# is number)', args: 'none' },
			{ name: 'ppls', value: 'gets more popular in array', args: 'none' },
			{ name: 'ppls_cnt', value: 'count of most popular in array', args: 'none' },
			{ name: 'smmr_cnt', value: 'count of all in array', args: 'none' }
		];

		let attr_name = [
			{ name: 'no_bots', value: 'no bots allowed', args: '!true/false' },
			{ name: 'mmbr_cap', value: 'maximum number of members allowed', args: '!number of maximum members' },
			{ name: 'time_to_live', value: 'time to live', args: '!number in seconds' },
			{ name: 'refresh_rate', value: 'how often titles are being refreshed', args: '!number in seconds' }
		];

		if (args.length === 0 || (args.length === 1 && (args[0] === 'func' ||
			args[0] === 'vrbl' || args[0] === 'pipe' || args[0] === 'attr'))) {
			let help_message_func = '';
			let help_message_pipe = '';
			let help_message_attr = '';
			let help_message_vrbl = '';

			if (args.length === 0 || args[0] === 'func') {
				// check if argument is function
				help_message_func +=
					'-\n`Functions (prefix ./)`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, func = func_name[i]; i < func_name.length; i++, func = func_name[i]) {
					help_message_func +=
						'> **' + func.name + '**\t - \t' +
						'*' + func.value + '*\t - \t' +
						'***' + func.args + '***\n'
				}
				message.author.send(help_message_func);
			}
			if (args.length === 0 || args[0] === 'vrbl') {
				// check if argument is variable
				help_message_vrbl +=
					'-\n`Variable (prefix $)`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, vrbl = vrbl_name[i]; i < vrbl_name.length; i++, vrbl = vrbl_name[i]) {
					help_message_vrbl +=
						'> **' + vrbl.name + '**\t - \t' +
						'*' + vrbl.value + '*\t - \t' +
						'***' + vrbl.args + '***\n'
				}
				message.author.send(help_message_vrbl);
			}
			if (args.length === 0 || args[0] === 'pipe') {
				// check if argument is pipe
				help_message_pipe +=
					'-\n`Pipe (prefix |)`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, pipe = pipe_name[i]; i < pipe_name.length; i++, pipe = pipe_name[i]) {
					help_message_pipe +=
						'> **' + pipe.name + '**\t - \t' +
						'*' + pipe.value + '*\t - \t' +
						'***' + pipe.args + '***\n'
				}
				message.author.send(help_message_pipe);
			}
			if (args.length === 0 || args[0] === 'attr') {
				// check if argument is attribute
				help_message_attr +=
					'-\n`Attribute (prefix @)`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, attr = attr_name[i]; i < attr_name.length; i++, attr = attr_name[i]) {
					help_message_attr +=
						'> **' + attr.name + '**\t - \t' +
						'*' + attr.value + '*\t - \t' +
						'***' + attr.args + '***\n'
				}
				message.author.send(help_message_attr);
			}

			message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
				'symbol: @ indicates beginning of mandatory argument (should not be included)*');
		}
		else if (args.length === 1) {
			// check if argument is function
			for (i = 0, func = func_name[i]; i < func_name.length; i++, func = func_name[i]) {
				if (func.name === args[0]) {
					message.author.send(
						'>>> Name: **' + func.name + '** ' +
						'\nType: **function**' +
						'\nDescription\t-\t*' + func.value + '*' +
						'\nArguments \t-\t*' + func.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms '+ message.author);
					return;
				}
			}
			// check if argument is pipe
			for (i = 0, pipe = pipe_name[i]; i < pipe_name.length; i++, pipe = pipe_name[i]) {
				if (pipe.name === args[0]) {
					message.author.send(
						'>>> Name: **' + pipe.name + '** ' +
						'\nType: **pipe**' +
						'\nDescription\t-\t*' + pipe.value + '*' +
						'\nArguments \t-\t*' + pipe.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms '+ message.author);
					return;
				}
			}
			// check if argument is attribute
			for (i = 0, attr = attr_name[i]; i < attr_name.length; i++, attr = attr_name[i]) {
				if (attr.name === args[0]) {
					message.author.send(
						'>>> Name: **' + attr.name + '** ' +
						'\nType: **attribute**' +
						'\nDescription\t-\t*' + attr.value + '*' +
						'\nArguments \t-\t*' + attr.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms '+ message.author);
					return;
				}
			}
			// check if argument is variable
			for (i = 0, vrbl = vrbl_name[i]; i < vrbl_name.length; i++, vrbl = vrbl_name[i]) {
				if (vrbl.name === args[0]) {
					message.author.send(
						'>>> Name: **' + vrbl.name + '** ' +
						'\nType: **variable**' +
						'\nDescription\t-\t*' + vrbl.value + '*' +
						'\nArguments \t-\t*' + vrbl.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms '+ message.author);
					return;
				}
			}
			message.author.send('**' + args[0] + '**, *does not exist in portal, you can always try **./help***');
		}
		message.channel.send('Check your dms '+ message.author);
		// Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
		//message.delete();
	}

	if (command === 'prefix') {

	}

	if (command === 'run') {
		if (message.member.voiceChannel === undefined) {
			message.channel.send("**You must be in portal's voice channel to execute commands**");
			message.react('❌');
			return;
		}

		message.channel.send('executing: ' + args.join(' '))
			.then(sentMessage => {
				sentMessage.edit(regex.regex_interpreter(
					args.join(' '),
					message.member.voiceChannel.id,
					message.member.guild,
					portal_list
				));
			})
		// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
		// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))
		message.react('✔️');
	}

	// set attributes
	if (command === 'set') {
		if (args.length === 1 && (args[0] === 'nbot' || args[0] === 'mmbr_cap'
			|| args[0] === 'time_tolv' || args[0] === 'titl_rfsh')) {
			for (i = 0; i < portal_list.length; i++) {
				for (j = 0; j < portal_list[i].voice_list.length; j++) {
					if (portal_list[i].voice_list[j] === message.member.voiceChannel.id) {
						// set variables
						message.react('✔️');
						return;
					}
				}
			}
		} else {
			message.channel.send("**Attributes that can be changed are: nbot, mmbr_cap, time_tolv, titl_rfsh**");
			message.react('❌');
			return;
		}

		message.channel.send("**You must be in portal's voice channel to set attributes**");
		message.react('❌');
		return;
	}

	if (command === 'url?') {
		var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

		if (!!pattern.test(args.join(' ')))
			message.react('✔️');
		else
			message.react('❌');
	}

});

client.login(config.token);