// Libraries
const fs = require('file-system');
const guild_json_path = "./server_storage/guild_list.json";

const regx = require('./functions/regex_interpreter');
const edtr = require('./functions/channel_manipulation');
const mngr = require('./functions/channel_manager');
const gmng = require('./functions/guild_state_manager');

// List of all managed channels in servers
// let guilds = require('./server_storage/guild_list.json');
let guild_json = fs.readFileSync(guild_json_path);
let portal_guilds = JSON.parse(guild_json);
// Load up the discord.js library
const Discord = require('discord.js');

// This is the client the Portal Bot. Some people call it 'bot', some people call it 'self',
// client.user is actually the presence of portal bot in the server
const client = new Discord.Client();

// config.token contains the bot's token
// config.prefix contains the message prefix.
const config = require('./config.json');









console.log('INIT guild[' + '705112209985896529' + ']');
for (i = 0; i < portal_guilds['705112209985896529']['portal_list'].length; i++) {
	console.log('  -> portal_' + i + ') ' +
		'[\'portal_list\'][' + i + '].id: ' +
		portal_guilds['705112209985896529']['portal_list'][i].id +
		'.voice_list.length: ' +
		portal_guilds['705112209985896529']['portal_list'][i].voice_list.length);
	for (j = 0; j < portal_guilds['705112209985896529']['portal_list'][i].voice_list.length; j++) {
		console.log('   -> voice_' + j + ') voice_list[' + j + '].id: ' +
			portal_guilds['705112209985896529']['portal_list'][i].voice_list[j].id);
	}
}
console.log('\n');












update_guild_json = function (force) {
	console.log('updating guild json');

	portal_guilds_json = JSON.stringify(portal_guilds);
	if(force)
		fs.writeFileSync(guild_json_path, portal_guilds_json);
	else
		fs.writeFile(guild_json_path, portal_guilds_json);
	// setTimeout(() => {
	// 	fs.writeFile(guild_json_path, portal_guilds_json);
	// }, 1000);
}

message_reply = function (status, msg, str) {
	msg.channel.send(str);
	if (status) msg.react('✔️');
	else msg.react('❌');
}

is_url = function (message) {
	var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

	if (!pattern.test(message.content))
		message.delete();
}



















//#endregion Listeners
client.on('ready', () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log('Bot has started, with ' + client.users.size +
		' users, in ' + client.channels.size +
		' channels of ' + client.guilds.size + ' guilds.');
	// Changing Portal bots status
	client.user.setActivity('./help', { type: 'LISTENING' });
});

client.on('guildCreate', guild => {
	// This event triggers when the bot joins a guild.

	// Inserting guild to portal's guild list if it does not exist
	if (!gmng.included_in_guild_list(guild.id, portal_guilds))
		gmng.insert_guild(guild.id, portal_guilds, guild_json_path);
	update_guild_json(true);

	console.log('New guild joined: ' + guild.name
		+ ' (id: + ' + guild.id
		+ ').\nThis guild has + '
		+ guild.memberCount + ' members!');
	// Changing Portal bots status 
	client.user.setActivity('./portal channel', { type: 'LISTENING' });
});

client.on('guildDelete', guild => {
	// this event triggers when the bot is removed from a guild.
	gmng.delete_guild(guild.id, portal_guilds);
	update_guild_json(true);

	console.log('I have been removed from: ${guild.name} (id: ${guild.id})');
	client.user.setActivity('Serving ${client.guilds.size} servers');
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
	// This event triggers when the status of a guild member has changed

	if (!gmng.included_in_guild_list(newPresence.guild.id, portal_guilds)) {
		// den mporo na katalavo giati to kanei, sumbainei otan molis anoikso to server valo 
		// na paizei mousikh sto spotify
		console.log(newPresence.guild.id + ' PRESENCE SOURCE MUST BE INVESTIGATED');
		return;
	}

	mngr.generate_channel_names(newPresence.guild, 
		portal_guilds[newPresence.guild.id]['portal_list']);

	console.log('guild[' + newPresence.guild.id + ']');
	for (i = 0; i < portal_guilds[newPresence.guild.id]['portal_list'].length; i++) {
		console.log('  -> portal_' + i + ') ' +
			'[\'portal_list\'][' + i + '].id: ' +
			portal_guilds[newPresence.guild.id]['portal_list'][i].id +
			'.voice_list.length: ' +
			portal_guilds[newPresence.guild.id]['portal_list'][i].voice_list.length);
		for (j = 0; j < portal_guilds[newPresence.guild.id]['portal_list'][i].voice_list.length; j++) {
			console.log('   -> voice_' + j + ') voice_list[' + j + '].id: ' +
				portal_guilds[newPresence.guild.id]['portal_list'][i].voice_list[j].id);
		}
	}
	console.log('\n');

	return;
});

client.on('voiceStateUpdate', (oldState, newState) => {
	// This event triggers when a member joins or leaves a voice channel
	let new_user_channel = newState.voiceChannel;
	let old_user_channel = oldState.voiceChannel;

	console.log('from: ' + old_user_channel + ' to ' + new_user_channel);

	if (old_user_channel === undefined && new_user_channel !== undefined) { // Joined from undefined
		console.log('undefined->existing');

		if (edtr.included_in_portal_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // user joined portal channel
			edtr.create_voice_channel(newState, portal_guilds[newState.guild.id]['portal_list'], newState.user.id);
			mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
		} else if (edtr.included_in_voice_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // user joined voice channel
			mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
		}
	} else if (new_user_channel === undefined && old_user_channel !== undefined) { // Left to undefined
		console.log('existing->undefined');

		if (edtr.included_in_portal_list(old_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // user left portal channel this part is handled before
		} else if (edtr.included_in_voice_list(old_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // user left voice channel
			if (old_user_channel.members.size === 0) {
				edtr.delete_voice_channel(old_user_channel, portal_guilds[newState.guild.id]['portal_list']);
			}
		}
	} else if (new_user_channel !== undefined && old_user_channel !== undefined) { // Moved from channel to channel
		console.log('existing->existing');

		if (edtr.included_in_portal_list(old_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) {
			console.log('->source: portal_list');
			console.log("outside portal_list.length:" + portal_guilds[newState.guild.id]['portal_list'].length);
			if (edtr.included_in_portal_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // this should not happen
				console.log('->dest: portal_list');
				console.log('this should not happen error: portal_channel->portal_channel');
			} else if (edtr.included_in_voice_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // has been checked before
				console.log('->dest: voice_list');
				console.log('has been checked before');
				mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
			} else { // Left portal channel and joined another unknown
				console.log('->dest: unknown');
				mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
			}
		} else if (edtr.included_in_voice_list(old_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) {
			console.log('->source: voice_list');

			if (edtr.included_in_portal_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // left created channel and joins portal
				console.log('->dest: portal_list');

				if (old_user_channel.members.size === 0) {
					edtr.delete_voice_channel(old_user_channel, portal_guilds[newState.guild.id]['portal_list']);
				}
				edtr.create_voice_channel(newState, portal_guilds[newState.guild.id]['portal_list'], newState.user.id);
				mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
			} else if (edtr.included_in_voice_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // Left created channel and joins another created
				console.log('->dest: voice_list');

				if (old_user_channel.members.size === 0) {
					edtr.delete_voice_channel(old_user_channel, portal_guilds[newState.guild.id]['portal_list']);
				}
				mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
			} else { // Left created channel and joins another unknown
				console.log('->dest: unknown');

				if (old_user_channel.members.size === 0) {
					edtr.delete_voice_channel(old_user_channel, portal_guilds[newState.guild.id]['portal_list']);
				}
				mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
			}
		} else {
			console.log('->source: unknown voice');

			if (edtr.included_in_portal_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // Joined portal channel
				console.log('->dest: portal_list');

				edtr.create_voice_channel(newState, portal_guilds[newState.guild.id]['portal_list'], newState.user.id);
				mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
			}
			else if (edtr.included_in_voice_list(new_user_channel.id, portal_guilds[newState.guild.id]['portal_list'])) { // left created channel and joins another created
				console.log('->dest: voice_list');

				mngr.generate_channel_names(newState.guild, portal_guilds[newState.guild.id]['portal_list']);
			}
		}
	} else if (new_user_channel === undefined && old_user_channel === undefined) {
		console.log('undefined->undefined');
	} else {
		console.log('don\'t know how we got here');
	}
	console.log('');

	update_guild_json(true);
	return;
})
//#endregion
















//#region Message async reader
client.on('message', async message => {
	// runs on every single message received, from any channel or DM
	// Ignore other bots and also itself ('botception')
	if (message.author.bot) return;

	// Ignore any direct message
	if (message.channel.type === 'dm') return;

	// Check if something written in url channel
	for (i = 0; i < portal_guilds[message.guild.id]['url_list'].length; i++) {
		console.log(portal_guilds[message.guild.id]['url_list'][i] + ' === ' + message.channel.id);
		if (portal_guilds[message.guild.id]['url_list'][i] === message.channel.id) {
			is_url(message);
			return;
		}
	}

	// Ignore any message that does not start with prefix
	if (message.content.indexOf(config.prefix) !== 0) return;

	// Separate function name, and arguments of function
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();

	if (cmd === 'save') {
		console.log('SAVE: ' + JSON.stringify(portal_guilds));
		update_guild_json(true);
		return;
	}

	if (cmd === 'portal') {
		if (args.length === 2) {
			edtr.create_portal_channel(message.guild, args[0], args[1],
				portal_guilds[message.guild.id]['portal_list'], message.member.id);
			message.react('✔️');
		} else if (args.length === 1) {
			edtr.create_portal_channel(message.guild, args[0], null,
				portal_guilds[message.guild.id]['portal_list'], message.member.id);
			message.react('✔️');
		} else {
			message_reply(false, message, '**' + config.prefix + 'portal <channel_name> <category_name>**\n' +
				'*(channel_name: mandatory, category_name: optional)*');
		}

		update_guild_json(true);
		return;
	}

	if (cmd === 'regex_portal') {
		if (message.member.voiceChannel === undefined
			|| !edtr.included_in_voice_list(message.member.voiceChannel.id, portal_guilds[message.guild.id]['portal_list'])) {
			message_reply(false, message,
				'**You must be in portal\'s voice channel to change portal title**');
		} else if (args.length > 0) {
			//change portal regex
			for (i = 0; i < portal_guilds[message.guild.id]['portal_list'].length; i++) {
				for (j = 0; j < portal_guilds[message.guild.id]['portal_list'][i].voice_list.length; j++) {
					if (portal_guilds[message.guild.id]['portal_list'][i].voice_list[j].id === message.member.voiceChannel.id) {
						portal_guilds[message.guild.id]['portal_list'][i].regex_portal = args.join(' ');

						message.guild.channels.forEach((value) => {
							if (value.id === portal_guilds[message.guild.id]['portal_list'][i].id) {
								value.setName(
									regx.regex_interpreter(
										portal_guilds[message.guild.id]['portal_list'][i].regex_portal,
										portal_guilds[message.guild.id]['portal_list'][i].id,
										message.guild,
										portal_guilds[message.guild.id]['portal_list']
									)
								);
							}
						});
						message.react('✔️');
					}
				}
			}
			message_reply(false, message, 'You are not a portal controlled voice channel');
		} else {
			message_reply(false, message, 'You are not a portal controlled voice channel');
		}

		update_guild_json(true);
		return;
	}

	if (cmd === 'regex_voice') {
		if (message.member.voiceChannel === undefined
			|| !edtr.included_in_voice_list(message.member.voiceChannel.id, portal_guilds[message.guild.id]['portal_list'])) {
			message_reply(false, message,
				'**You must be in portal\'s voice channel to change voice title**');
		} else if (args.length > 0) {
			//change voice regex
			for (i = 0; i < portal_guilds[message.guild.id]['portal_list'].length; i++) {
				for (j = 0; j < portal_guilds[message.guild.id]['portal_list'][i].voice_list.length; j++) {
					if (portal_guilds[message.guild.id]['portal_list'][i].voice_list[j].id === message.member.voiceChannel.id) {
						portal_guilds[message.guild.id]['portal_list'][i].regex_voice = args.join(' ');
						message.member.voiceChannel.setName(
							regx.regex_interpreter(
								portal_guilds[message.guild.id]['portal_list'][i].regex_voice,
								portal_guilds[message.guild.id]['portal_list'][i].id,
								message.guild,
								portal_guilds[message.guild.id]['portal_list']
							)
						);
						message.react('✔️');
					}
				}
			}
			message.channel.send('You are not a portal controlled voice channel');
		} else {
			message.channel.send('You should enter a voice regex');
		}

		update_guild_json(true);
		return;
	}

	if (cmd === 'ping') {
		// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
		// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
		const m = await message.channel.send('Ping?');
		m.edit('Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.\n',
			'API Latency is ${Math.round(client.ping)}ms');
		return;
	}

	if (cmd === 'help') {
		const func_name = require('./assets/properties/function_list.json');
		const vrbl_name = require('./assets/properties/variable_list.json');
		const pipe_name = require('./assets/properties/pipe_list.json');
		const attr_name = require('./assets/properties/attribute_list.json');

		if (args.length === 0 || (args.length === 1 && (args[0] === 'func' ||
			args[0] === 'vrbl' || args[0] === 'pipe' || args[0] === 'attr'))) {
			let help_message_func = '';
			let help_message_pipe = '';
			let help_message_attr = '';
			let help_message_vrbl = '';

			if (args.length === 0 || args[0] === 'func') {
				// check if argument is function
				help_message_func +=
					'-\n`Functions (prefix ' + func_name.prefix + ')`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, func = func_name.functions[i]; i < func_name.functions.length; i++, func = func_name.functions[i]) {
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
					'-\n`Variable (prefix ' + vrbl_name.prefix + ')`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, vrbl = vrbl_name.variables[i]; i < vrbl_name.variables.length; i++, vrbl = vrbl_name.variables[i]) {
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
					'-\n`Pipe (prefix ' + pipe_name.prefix + ')`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, pipe = pipe_name.pipes[i]; i < pipe_name.pipes.length; i++, pipe = pipe_name.pipes[i]) {
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
					'-\n`Attribute (prefix ' + attr_name.prefix + ')`\n' +
					'**Name**\t - \t' +
					'**Description**\t - \t' +
					'**Arguments** \n'

				for (i = 0, attr = attr_name.attributes[i]; i < attr_name.attributes.length; i++, attr = attr_name.attributes[i]) {
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
			for (i = 0, func = func_name.functions[i]; i < func_name.functions.length; i++, func = func_name.functions[i]) {
				if (func.name === args[0]) {
					message.author.send(
						'>>> Name: **' + func.name + '** ' +
						'\nType: **function**' +
						'\nDescription\t-\t*' + func.value + '*' +
						'\nArguments \t-\t*' + func.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms ' + message.author);
					return;
				}
			}
			// check if argument is pipe
			for (i = 0, pipe = pipe_name.pipes[i]; i < pipe_name.pipes.length; i++, pipe = pipe_name.pipes[i]) {
				if (pipe.name === args[0]) {
					message.author.send(
						'>>> Name: **' + pipe.name + '** ' +
						'\nType: **pipe**' +
						'\nDescription\t-\t*' + pipe.value + '*' +
						'\nArguments \t-\t*' + pipe.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms ' + message.author);
					return;
				}
			}
			// check if argument is attribute
			for (i = 0, attr = attr_name.attributes[i]; i < attr_name.attributes.length; i++, attr = attr_name.attributes[i]) {
				if (attr.name === args[0]) {
					message.author.send(
						'>>> Name: **' + attr.name + '** ' +
						'\nType: **attribute**' +
						'\nDescription\t-\t*' + attr.value + '*' +
						'\nArguments \t-\t*' + attr.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms ' + message.author);
					return;
				}
			}
			// check if argument is variable
			for (i = 0, vrbl = vrbl_name.variables[i]; i < vrbl_name.variables.length; i++, vrbl = vrbl_name.variables[i]) {
				if (vrbl.name === args[0]) {
					message.author.send(
						'>>> Name: **' + vrbl.name + '** ' +
						'\nType: **variable**' +
						'\nDescription\t-\t*' + vrbl.value + '*' +
						'\nArguments \t-\t*' + vrbl.args + '*');

					message.author.send('-\n*symbol: ! indicates beginning of mandatory argument (should not be included)\n' +
						'symbol: @ indicates beginning of mandatory argument (should not be included)*');

					message.channel.send('Check your dms ' + message.author);
					return;
				}
			}
			message.author.send('**' + args[0] + '**, *does not exist in portal, you can always try **./help***');
		}
		message.channel.send('Check your dms ' + message.author);
		// Then we delete the cmd message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
		//message.delete();
		return;
	}

	if (cmd === 'run') {
		if (message.member.voiceChannel === undefined
			|| !edtr.included_in_voice_list(message.member.voiceChannel.id, portal_guilds[message.guild.id]['portal_list'])) {
			message_reply(false, message,
				'**You must be in portal\'s voice channel to run regexes**');
			return;
		}

		message.channel.send('executing: ' + args.join(' '))
			.then(sentMessage => {
				sentMessage.edit(regx.regex_interpreter(
					args.join(' '),
					message.member.voiceChannel.id,
					message.member.guild,
					portal_guilds[message.guild.id]['portal_list']
				));
			})
		// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
		// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))
		message.react('✔️');
		return;
	}

	if (cmd === 'set') { // set attributes
		if (message.member.voiceChannel === undefined
			|| !edtr.included_in_voice_list(message.member.voiceChannel.id, portal_guilds[message.guild.id]['portal_list'])) {
			message_reply(false, message,
				'**You must be in a portal\'s voice channel to set attributes**');
		} else if (args.length === 2) { //check for type accuracy and make better
			return_value = mngr.update_channel_attributes(
				message.guild,
				portal_guilds[message.guild.id]['portal_list'],
				args[0], args[1]
			);

			if (return_value == 0)
				message_reply(true, message, '**Attribute ' + args[0] + ' updated successfully**');
			else if (return_value == 1)
				message_reply(false, message, '**Attribute ' + args[0] + ' failed to updated**');
			else if (return_value == 2)
				message_reply(false, message, '**' + args[0] + ' is not an attribute**');
		} else if (args.length > 2) {
			message_reply(false, message, '**You can only set one attribute at a time\n'
				+ '***example: ./set no_bots true*');
		} else if (args.length < 2) {
			message_reply(false, message, '**You should name the argument with value\n'
				+ '***example: ./set no_bots true*');
		}
		message_reply(false, message,
			'**You must be in portal\'s voice channel to set attributes**');

		update_guild_json(true);
		return;
	}

	if (cmd === 'url') {
		if (args.length === 2) {
			edtr.create_url_channel(message.guild, args[0], args[1], portal_guilds[message.guild.id]['url_list']);
			message.react('✔️');
		} else if (args.length === 1) {
			edtr.create_url_channel(message.guild, args[0], null, portal_guilds[message.guild.id]['url_list']);
			message.react('✔️');
		} else {
			message_reply(false, message, '**' + config.prefix + 'url <channel_name> <category_name>**\n' +
				'*(channel_name: mandatory, category_name: optional)*');
		}

		console.log("url_list: ");
		for (let i = 0; i < portal_guilds[message.guild.id]['url_list']; i++)
			console.log('url_list[' + i + ']: ' + 
			portal_guilds[message.guild.id]['url_list'][i]);
		
		update_guild_json(true);
		return;
	}

	//testing processes
	if (cmd === 'purge') {
		message.guild.channels.forEach((value) => {
			if (value.deletable)
				value.delete()
					.then(g => console.log('Deleted the guild ' + g))
					.catch(console.error);
		})

		message.guild.createChannel('general voice', { type: 'voice' }, { bitrate: 8 })
			.then(
				message.guild.createChannel('general text', { type: 'text' })
					.then(value => {
						value.send('**PURGE DONE**')
					})
			)

		gmng.delete_guild(message.guild.id, portal_guilds);
		gmng.insert_guild(message.guild.id, portal_guilds, guild_json_path);
		
		update_guild_json(true);
		return;
	}
	
});
//#region 
client.login(config.token);