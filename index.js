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
console.log('PORTAL GUILDS JSON: ', portal_guilds);

// Load up the discord.js library
const Discord = require('discord.js');

// This is the client the Portal Bot. Some people call it 'bot', some people call it 'self',
// client.user is actually the presence of portal bot in the server
const client = new Discord.Client();

// config.token contains the bot's token
// config.prefix contains the message prefix.
const config = require('./config.json');

// FUNCTIONS ------------------------------------------------------------------------------------ \\

create_rich_embed = function (title, description, colour, field_array) {
	const exampleEmbed = new Discord.RichEmbed()
		.setColor(colour)
		.setAuthor(title)
		.setDescription(description)
		.setTimestamp()
		.setFooter('Portal bot by Keybraker',
			'https://raw.githubusercontent.com/keybraker/portal-discord-bot/'+
			'master/assets/img/logo.png?token=AFS7NCWAA55MMT4PYBCJKOK62LPR2');

	field_array.forEach(row => {
		if (row.emote === '') {
			exampleEmbed.addBlankField();
		} else {
			exampleEmbed.addField(row.emote, row.role, row.inline);
		}
	});

	return exampleEmbed;
}

channel_clean_up = function (channel, current_guild) {
	if (current_guild.channels.some((guild_channel) => {
		if (guild_channel.id === channel.id && guild_channel.members.size === 0) {
			console.log('yes');
			edtr.delete_voice_channel(guild_channel, portal_guilds[current_guild.id]['portal_list']);
			return true;
		}
	}));
}

portal_init = function (current_guild) {
	const keys = Object.keys(portal_guilds);
	const servers = keys.map(key => ({ key: key, value: portal_guilds[key] }));

	for (let l = 0; l < servers.length; l++)
		for (let i = 0; i < servers[l].value.portal_list.length; i++)
			for (let j = 0; j < servers[l].value.portal_list[i].voice_list.length; j++)
				channel_clean_up(servers[l].value.portal_list[i].voice_list[j], current_guild);
	update_guild_json(true);
}

show_portal_state = function (guild_id) {
	// console.log(guild_id + '\n.portal_list\n[');
	// for (i = 0; i < portal_guilds[guild_id]['portal_list'].length; i++) {
	// 	console.log('\t' + i + '. ' + portal_guilds[guild_id]['portal_list'][i].id
	// 		+ '.voice_list\n\t[');

	// 	for (j = 0; j < portal_guilds[guild_id]['portal_list'][i].voice_list.length; j++) {
	// 		console.log('\t\t' + j + '. {'
	// 			+ portal_guilds[guild_id]['portal_list'][i].voice_list[j].id + '}');
	// 	}
	// 	console.log('\t],\n');
	// }
	// console.log('],');
	// console.log(guild_id + '\n.url_list\n[');
	// for (i = 0; i < portal_guilds[guild_id]['url_list'].length; i++) {
	// 	console.log('\t' + i + '. ' + portal_guilds[guild_id]['url_list'][i].id);
	// }
	// console.log(']');
	console.log('PORTAL GUILDS JSON: ', portal_guilds[guild_id]);
}

update_guild_json = function (force) {
	console.log('updating guild json');

	portal_guilds_json = JSON.stringify(portal_guilds);
	if (force)
		try {
			fs.writeFileSync(guild_json_path, portal_guilds_json);
		} catch(error) {
			console.log('ERROR: could not save to file.')
		}
	else
		try {
			fs.writeFile(guild_json_path, portal_guilds_json);
		} catch(error) {
			console.log('ERROR: could not save to file.')
		}
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

// LISTENERS ------------------------------------------------------------------------------------ \\

//#endregion Listeners
client.on('ready', () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log('Bot has started, with ' + client.users.size +
		' users, in ' + client.channels.size +
		' channels of ' + client.guilds.size + ' guilds.');
	// Changing Portal bots status
	client.user.setActivity('./help', { type: 'LISTENING' });
	client.guilds.forEach(guild => {
		portal_init(guild);
	})
});

client.on('guildCreate', guild => {
	// This event triggers when the bot joins a guild.

	// Inserting guild to portal's guild list if it does not exist
	if (!gmng.included_in_guild_list(guild.id, portal_guilds))
		gmng.insert_guild(guild.id, portal_guilds, guild_json_path);
	update_guild_json(true);

	console.log('Portal joined guild: ' + guild.name
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

	console.log('Portal has been removed from: ${guild.name} (id: ${guild.id})');
	client.user.setActivity('Serving ${client.guilds.size} servers');
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
	// This event triggers when the status of a guild member has changed

	if (!gmng.included_in_portal_guilds(newPresence.guild.id, portal_guilds)) {
		console.log('Member (' + newPresence.displayName + ') who is a member of a handled server,' +
			' has changed presence, but is in another server (' + newPresence.guild.id + ').\n');
		return;
	} else {
		console.log('Member (' + newPresence.displayName + ') has changed presence,' +
			' and is controlled server (' + newPresence.guild.id + ').\n');
	}

	mngr.generate_channel_names(newPresence.guild,
		portal_guilds[newPresence.guild.id]['portal_list']);

	show_portal_state(newPresence.guild.id);

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

// MESSAGE LISTENER ----------------------------------------------------------------------------- \\

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
		const func_objct = require('./assets/properties/function_list');
		const vrbl_objct = require('./assets/properties/variable_list');
		const pipe_objct = require('./assets/properties/pipe_list');
		const attr_objct = require('./assets/properties/attribute_list');

		if (args.length === 0 || (args.length === 1 && (args[0] === 'func' ||
			args[0] === 'vrbl' || args[0] === 'pipe' || args[0] === 'attr'))) {
			let help_message_func = '';
			let help_message_pipe = '';
			let help_message_attr = '';
			let help_message_vrbl = '';

			if (args.length === 0 || args[0] === 'func') {
				// check if argument is function
				let func_array = [];
				for (i = 0; i < func_objct.functions.length; i++) {
					func_array.push({ 
						emote: func_objct.functions[i].name, 
						role: '**desc**: *' + func_objct.functions[i].description + '*' +
							'\n**args**: *' + func_objct.functions[i].args + '*', 
						inline: true });
				}
				
				message.author.send(create_rich_embed('Functions',
					'Prefix: ' + func_objct.prefix + '\nCommands to access portal bot.' +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF7F00', func_array));
			}
			if (args.length === 0 || args[0] === 'vrbl') {
				// check if argument is variable
				let vrbl_array = [];
				for (i = 0; i < vrbl_objct.variables.length; i++) {
					vrbl_array.push({
						emote: vrbl_objct.variables[i].name,
						role: '**desc**: *' + vrbl_objct.variables[i].description + '*' +
							'\n**args**: *' + vrbl_objct.variables[i].args + '*',
						inline: true
					});
				}

				message.author.send(create_rich_embed('Variables',
					'Prefix: ' + vrbl_objct.prefix + '\nChannel data that changes automatically.' +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF7F00', vrbl_array));
			}
			if (args.length === 0 || args[0] === 'pipe') {
				// check if argument is pipe
				let pipe_array = [];
				for (i = 0; i < pipe_objct.pipes.length; i++) {
					pipe_array.push({
						emote: pipe_objct.pipes[i].name,
						role: '**desc**: *' + pipe_objct.pipes[i].description + '*' +
							'\n**args**: *' + pipe_objct.pipes[i].args + '*',
						inline: true
					});
				}

				message.author.send(create_rich_embed('Pipes',
					'Prefix: ' + pipe_objct.prefix + '\nGive input of sort to get an output.' +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF7F00', pipe_array));
			}
			if (args.length === 0 || args[0] === 'attr') {
				// check if argument is attribute
				let attr_array = [];
				for (i = 0; i < attr_objct.attributes.length; i++) {
					attr_array.push({
						emote: attr_objct.attributes[i].name,
						role: '**desc**: *' + attr_objct.attributes[i].description + '*' +
							'\n**args**: *' + attr_objct.attributes[i].args + '*',
						inline: true
					});
				}

				message.author.send(create_rich_embed('Attributes',
					'Prefix: ' + attr_objct.prefix + '\nData of channel that can be set.' +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF7F00', attr_array));
			}
		}
		else if (args.length === 1) {
			// check if argument is function
			for (i = 0; i < func_objct.functions.length; i++) {
				let func = func_objct.functions[i]
				if (func.name === args[0]) {
					message.author.send(create_rich_embed(
						func.name,
						'Type: Function' + 
						'\nPrefix: ' + func_objct.prefix +
						'\n**!**: *mandatory*, **@**: *optional*',
						'#FF7F00',
						[
							{emote: 'Description', role: '*' + func.description + '*', inline: false},
							{emote: 'Arguments', role: '*' + func.args + '*', inline: false}
						]
						));

					message.channel.send('Check your dms ' + message.author);
					return;
				}
			}
			// check if argument is pipe
			for (i = 0; i < pipe_objct.pipes.length; i++) {
				let pipe = pipe_objct.pipes[i]
				if (pipe.name === args[0]) {
					message.author.send(create_rich_embed(
						pipe.name,
						'Type: Pipe' + 
						'\nPrefix: ' + pipe_objct.prefix +
						'\n**!**: *mandatory*, **@**: *optional*',
						'#FF7F00',
						[
							{emote: 'Description', role: '*' + pipe.description + '*', inline: false},
							{emote: 'Arguments', role: '*' + pipe.args + '*', inline: false}
						]
						));

					message.channel.send('Check your dms ' + message.author);
					return;
				}
			}
			// check if argument is attribute
			for (i = 0; i < attr_objct.attributes.length; i++) {
				let attr = attr_objct.attributes[i]
				if (attr.name === args[0]) {
					message.author.send(create_rich_embed(
						attr.name,
						'Type: Attribute' + 
						'\nPrefix: ' + attr_objct.prefix +
						'\n**!**: *mandatory*, **@**: *optional*',
						'#FF7F00',
						[
							{emote: 'Description', role: '*' + attr.description + '*', inline: false},
							{emote: 'Arguments', role: '*' + attr.args + '*', inline: false}
						]
						));

					message.channel.send('Check your dms ' + message.author);
					return;
				}
			}
			// check if argument is variable
			for (i = 0; i < vrbl_objct.variables.length; i++) {
				let vrbl = vrbl_objct.variables[i]
				if (vrbl.name === args[0]) {
					message.author.send(create_rich_embed(
						vrbl.name,
						'Type: Variable' + 
						'\nPrefix: ' + vrbl_objct.prefix +
						'\n**!**: *mandatory*, **@**: *optional*',
						'#FF7F00',
						[
							{emote: 'Description', role: '*' + vrbl.description + '*', inline: false},
							{emote: 'Arguments', role: '*' + vrbl.args + '*', inline: false}
						]
						));

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
			|| !edtr.included_in_voice_list(message.member.voiceChannel.id,
				portal_guilds[message.guild.id]['portal_list'])) {
			message_reply(false, message,
				'**You must be in a portal\'s voice channel to set attributes**');
		} else if (args.length > 1) { // check for type accuracy and make better
			return_value = mngr.update_channel_attributes(
				message,
				portal_guilds[message.guild.id]['portal_list'],
				args
			);

			if (return_value === 1) {
				mngr.generate_channel_names(message.guild, portal_guilds[message.guild.id]['portal_list']);
				message_reply(true, message, '**Attribute ' + args[0] + ' updated successfully**');
			} else if (return_value === -3) {
				message_reply(false, message, '**Only the channel creator can change attributes**');
			} else if (return_value === -2) {
				message_reply(false, message, '**Attribute ' + args[0] + ' is read only**');
			} else if (return_value === -1) {
				message_reply(false, message, '**' + args[0] + ' is not an attribute**');
			}
		} else {
			message_reply(false, message, '**Error with set, ***example: ./set no_bots true*');
		}

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
		update_guild_json(true);
	}

	if (cmd === 'role') {
		let roles = [];
		message.guild.roles.forEach(role => {
			roles.push({role})});
		console.log('roles: ', roles);

		if (args.length === 1) {
			// edtr.create_role_giver(message.guild, args[0], null, portal_guilds[message.guild.id]['url_list']);
			message.channel.send(create_rich_embed('Portal Role Assigner',
				'by reacting to this comment you can get or strip roles', '#FF7F00',
				[
					{ emote: 'Get Role', role: 'react with one of the following emotes to get this role', inline: false },
					{ emote: ':gun:', role: 'Fps', inline: true },
					{ emote: ':clown:', role: 'Moba', inline: true },
					{ emote: ':gun:', role: 'Fps', inline: true },
					{ emote: ':clown:', role: 'Moba', inline: true },
					{ emote: ':gun:', role: 'Fps', inline: true },
					{ emote: ':clown:', role: 'Moba', inline: true },

					{ emote: '', role: '', inline: false },
					{ emote: 'Strip Role', role: 'react with one of the following emotes to strip this role', inline: false },
					{ emote: ':gun:', role: 'Fps', inline: true },
					{ emote: ':clown:', role: 'Moba', inline: true },
					{ emote: ':gun:', role: 'Fps', inline: true },
					{ emote: ':clown:', role: 'Moba', inline: true },
					{ emote: ':gun:', role: 'Fps', inline: true },
					{ emote: ':clown:', role: 'Moba', inline: true },
				]));
			message.react('✔️');
		} else {
			message_reply(false, message, '**' + config.prefix + 'role !role1->:emote: !role2->:emote: ...**');
		}

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

	if (cmd === 'save') {
		console.log('SAVE: ' + JSON.stringify(portal_guilds));
		update_guild_json(true);
		return;
	}

});
//#region 
client.login(config.token);