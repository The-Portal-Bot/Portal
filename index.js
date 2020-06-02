const fs = require('file-system');
const portal_managed_guilds_path = "./server_storage/guild_list.json";

const regx = require('./functions/regex_interpreter');
const edtr = require('./functions/channel_manipulation');
const mngr = require('./functions/channel_manager');
const gmng = require('./functions/guild_state_manager');

const func_objct = require('./assets/properties/function_list');
const vrbl_objct = require('./assets/properties/variable_list');
const pipe_objct = require('./assets/properties/pipe_list');
const attr_objct = require('./assets/properties/attribute_list');
const strc_objct = require('./assets/properties/structure_list');

// List of all managed channels in servers
// let guilds = require('./server_storage/guild_list.json');
let portal_managed_guilds = fs.readFileSync(portal_managed_guilds_path);
let portal_guilds = JSON.parse(portal_managed_guilds);

// Load up the discord.js library
const Discord = require('discord.js');

// This is the client the Portal Bot. Some people call it bot, some people call
// it 'self', client.user is actually the presence of portal bot in the server
const client = new Discord.Client();

// config.token contains the bot's token
// config.prefix contains the message prefix.
const config = require('./config.json');

// FUNCTIONS ------------------------------------------------------------------------------------ \\

create_rich_embed = function (title, description, colour, field_array) {
	const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/portal-discord-bot/' +
		'master/assets/img/logo.png?token=AFS7NCWAA55MMT4PYBCJKOK62LPR2';
	const keybraker_url = 'https://github.com/keybraker';

	let rich_message = new Discord.MessageEmbed()
		.setURL()
		.setTitle(title)
		.setColor(colour)
		// .setAuthor('Portal', portal_icon_url, keybraker_url)
		.setDescription(description)
		.setTimestamp()
		.setFooter('Portal bot by Keybraker', portal_icon_url, keybraker_url);
			
	field_array.forEach(row => {
		if (row.emote === '') {
			// rich_message.addBlankField();
		} else {
			rich_message.addField(row.emote, row.role, row.inline);
		}
	});

	return rich_message;
}

channel_clean_up = function (channel, current_guild) {
	if (current_guild.channels.cache.some((guild_channel) => {
		if (guild_channel.id === channel.id && guild_channel.members.size === 0) {
			edtr.delete_voice_channel(guild_channel, portal_guilds[current_guild.id].portal_list);
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
	update_portal_managed_guilds(true);
}

// show_portal_state = function (guild_id) {
// 	console.log('Portal State: ', portal_guilds);
// }

update_portal_managed_guilds = function (force) {
	console.log('updating guild json');

	setTimeout(function () {
		if (force) fs.writeFileSync(portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8');
		else fs.writeFile(portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8');
	}, 1000);
}

message_reply = function (status, msg, str) {
	msg.channel.send(str);
	if (status)
		msg.react('✔️');
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
let previous_update = Date.now();

//#endregion Listeners

// This event will run if the bot starts, and logs in, successfully.
client.on('ready', () => {
	previous_update = Date.now();
	console.log('Bot has started, with ' + client.users.cache.size +
		' users, in ' + client.channels.cache.size +
		' channels of ' + client.guilds.cache.size + ' guilds.');
	// Changing Portal bots status
	client.user.setActivity('./help', {
		url: 'https://github.com/keybraker',
		type: 'LISTENING'
	});
	client.guilds.cache.forEach(guild => {
		portal_init(guild);
	})
});

client.on('shardReconnecting', id => 
	console.log(`Shard with ID ${id} reconnected.`)
);

client.on('guildCreate', guild => {
	// This event triggers when the bot joins a guild.

	// Inserting guild to portal's guild list if it does not exist
	if (!gmng.included_in_guild_list(guild.id, portal_guilds))
		gmng.insert_guild(guild.id, portal_guilds, portal_managed_guilds_path);
	update_portal_managed_guilds(true);

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
	update_portal_managed_guilds(true);

	console.log('Portal has been removed from: ${guild.name} (id: ${guild.id})');
	client.user.setActivity('Serving ${client.guilds.cache.size} servers');
});

// This event triggers when the status of a guild member has changed
client.on('presenceUpdate', (oldPresence, newPresence) => {
	if (!gmng.included_in_portal_guilds(newPresence.guild.id, portal_guilds)) {
		console.log(newPresence.member.displayName + ', who is a member of a handled server,' +
			' has changed presence, but is in another server (' + newPresence.guild.name + ').\n');
		return;
	}

	console.log(newPresence.member.displayName +
		', has changed presence, in controlled server (' +
		newPresence.guild.name + ').\n');

	let current_guild = newPresence.guild;
	let current_channel = newPresence.member.voice.channel;

	if (current_channel) { // if member is in a channel
		console.log('perasa 1')
		let current_portal_list = portal_guilds[current_guild.id].portal_list;
		for (let key in portal_guilds[current_guild.id].portal_list) {
			console.log('perasa 2')
			if (current_voice_channel = current_portal_list[key].voice_list[current_channel.id]) {
				console.log('perasa 3')
				if (((Date.now() - current_voice_channel.last_update)) >= 300) {
					console.log('perasa 4')
					// mngr.generate_channel_name(
					// 	current_guild,
					// 	portal_guilds[current_guild.id].portal_list,
					// 	current_channel
					// );
					mngr.generate_channel_name2(current_guild,
						portal_guilds[current_guild.id].portal_list,
						current_voice_channel,
						current_channel);
				}
			}
		}
	}

	return;
});

client.on('voiceStateUpdate', (oldState, newState) => {
	// This event triggers when a member joins or leaves a voice channel
	let newChannel = newState.channel; // join channel
	let oldChannel = oldState.channel; // left channel

	console.log('from: ' + oldChannel + ' to ' + newChannel);

	if (oldChannel === null && newChannel !== null) { // Joined from null
		console.log('null->existing');

		if (edtr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user joined portal channel
			edtr.create_voice_channel(newState, portal_guilds[newState.guild.id].portal_list[newChannel.id], newState.id);
			// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
			mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
		} else if (edtr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user joined voice channel
			// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
			mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
		}
	} else if (newChannel === null && oldChannel !== null) { // Left to null
		console.log('existing->null');

		if (edtr.included_in_portal_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user left portal channel this part is handled before
		} else if (edtr.included_in_voice_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user left voice channel
			if (oldChannel.members.size === 0) {
				edtr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
			}
		}
	} else if (newChannel !== null && oldChannel !== null) { // Moved from channel to channel
		console.log('existing->existing');

		if (edtr.included_in_portal_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) {
			console.log('->source: portal_list');

			if (edtr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // this should not happen
				console.log('->dest: portal_list');
				console.log('this should not happen error: portal_channel->portal_channel');
			} else if (edtr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // has been checked before
				console.log('->dest: voice_list');
				console.log('has been checked before');
				// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
				mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
			} else { // Left portal channel and joined another unknown
				console.log('->dest: unknown');
				// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
				mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
			}
		} else if (edtr.included_in_voice_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) {
			console.log('->source: voice_list');

			if (edtr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // left created channel and joins portal
				console.log('->dest: portal_list');

				if (oldChannel.members.size === 0) {
					edtr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
				}
				edtr.create_voice_channel(newState, portal_guilds[newState.guild.id].portal_list[newChannel.id], newState.id);
				// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
				mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
			} else if (edtr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // Left created channel and joins another created
				console.log('->dest: voice_list');

				if (oldChannel.members.size === 0) {
					edtr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
				}
				// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
				mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
			} else { // Left created channel and joins another unknown
				console.log('->dest: unknown');

				if (oldChannel.members.size === 0) {
					edtr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
				}
				// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
				mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
			}
		} else {
			console.log('->source: unknown voice');

			if (edtr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // Joined portal channel
				console.log('->dest: portal_list');

				edtr.create_voice_channel(newState, portal_guilds[newState.guild.id].portal_list[newChannel.id], newState.id);
				// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
				mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
			}
			else if (edtr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // left created channel and joins another created
				console.log('->dest: voice_list');

				// mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list);
				mngr.generate_channel_name(newState.guild, portal_guilds[newState.guild.id].portal_list, newChannel);
			}
		}
	} else if (newChannel === null && oldChannel === null) {
		console.log('null->null');
	} else {
		console.log('don\'t know how we got here');
	}
	update_portal_managed_guilds(true);
	console.log('');

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
	for (i = 0; i < portal_guilds[message.guild.id].url_list.length; i++) {
		if (portal_guilds[message.guild.id].url_list[i] === message.channel.id) {
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
				portal_guilds[message.guild.id].portal_list, message.member.id);
			message_reply(true, message, '*Keep in mind that after Discord\'s update* ' +
				'**channel names can be update twice per 10 minutes**');
		} else if (args.length === 1) {
			edtr.create_portal_channel(message.guild, args[0], null,
				portal_guilds[message.guild.id].portal_list, message.member.id);
			message_reply(true, message, '*Keep in mind that after Discord\'s update* ' +
				'**channel names can be update twice per 10 minutes**');
		} else {
			message_reply(false, message, '**' + config.prefix + 'portal <channel_name> <category_name>**\n' +
				'*(channel_name: mandatory, category_name: optional)*');
		}

		update_portal_managed_guilds(true);
		return;
	}

	if (cmd === 'ping') {
		// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
		// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
		const msg = await message.channel.send('Ping?');
		msg.edit(`Pong!\nLatency of rtt is ${msg.createdTimestamp - message.createdTimestamp}ms.\n` +
			`Latency to portal is ${client.ws.ping}ms`);
		return;
	}

	if (cmd === 'help') {
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
			if (args.length === 0 || args[0] === 'strc') {
				// check if argument is attribute
				let strc_array = [];
				for (i = 0; i < strc_objct.structures.length; i++) {
					strc_array.push({
						emote: strc_objct.structures[i].name,
						role: '**desc**: *' + strc_objct.structures[i].description + '*' +
							'\n**args**: *' + strc_objct.structures[i].args + '*',
						inline: true
					});
				}

				message.author.send(create_rich_embed('Structures',
					'Prefix: ' + strc_objct.prefix + '\nStructural data functions.' +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#FF7F00', strc_array));
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
							{emote: 'Description', role: '*' + func.super_description + '*', inline: false},
							{emote: 'Arguments', role: '*' + func.args + '*', inline: false}
						]
						));

					message.channel.send(`${message.author}, I sent you a message`);
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
							{emote: 'Description', role: '*' + pipe.super_description + '*', inline: false},
							{emote: 'Arguments', role: '*' + pipe.args + '*', inline: false}
						]
						));

					message.channel.send(`${message.author}, I sent you a message`);
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
							{emote: 'Description', role: '*' + attr.super_description + '*', inline: false},
							{emote: 'Arguments', role: '*' + attr.args + '*', inline: false}
						]
						));

					message.channel.send(`${message.author}, I sent you a message`);
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
							{ emote: 'Description', role: '*' + vrbl.super_description + '*', inline: false },
							{ emote: 'Arguments', role: '*' + vrbl.args + '*', inline: false }
						]
					));

					message.channel.send(`${message.author}, I sent you a message`);
					return;
				}
			}
			// check if argument is structure
			for (i = 0; i < strc_objct.structures.length; i++) {
				let strc = strc_objct.structures[i]
				if (strc.name === args[0]) {
					message.author.send(create_rich_embed(
						strc.name,
						'Type: Structure' +
						'\nPrefix: ' + strc_objct.prefix +
						'\n**!**: *mandatory*, **@**: *optional*',
						'#FF7F00',
						[
							{ emote: 'Description', role: '*' + strc.super_description + '*', inline: false },
							{ emote: 'Arguments', role: '*' + strc.args + '*', inline: false }
						]
					));

					message.channel.send(`${message.author}, I sent you a message`);
					return;
				}
			}
			message.author.send('**' + args[0] + '**, *does not exist in portal, you can always try **./help***');
		}
		message.channel.send(`${message.author}, I sent you a message`);
		// Then we delete the cmd message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
		//message.delete();
		return;
	}

	if (cmd === 'run') {
		let current_voice = message.member.voice;
		let current_portal_list = portal_guilds[message.guild.id].portal_list;

		if (current_voice === null || !edtr.included_in_voice_list(current_voice.channelID, current_portal_list)) {
			message_reply(false, message, '**You must be in portal\'s voice channel to run regexes**');
			return;
		}

		message.channel.send('executing: ' + args.join(' '))
			.then(sentMessage => {
				sentMessage.edit(
					regx.regex_interpreter(
						args.join(' '),
						current_voice.channelID,
						message.member.guild,
						current_portal_list
					)
				);
			});
		// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
		// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))
		message.react('✔️');
		return;
	}

	if (cmd === 'set') { // set attributes
		if (message.member.voice === null || !edtr.included_in_voice_list(message.member.voice.channelID,
				portal_guilds[message.guild.id].portal_list)) {
			message_reply(false, message, '**You must be in a portal\'s voice channel to set attributes**');
		} else if (args.length > 1) { // check for type accuracy and make better
			
			current_portal_list = portal_guilds[message.guild.id].portal_list;
			for (let portal_key in current_portal_list) {
				for (let voice_key in current_portal_list[portal_key].voice_list) {
					if (voice_key === message.member.voice.channelID) {
						let current_voice_channel = current_portal_list[portal_key].voice_list[voice_key]
						let current_portal_channel = current_portal_list[portal_key]
						if (message.member.id === current_voice_channel.creator_id) {
							let return_value = attr_objct.set(
								message.member.voice.channel, 
								current_voice_channel,
								current_portal_channel,
								args[0],
								args[1]
							);

							if (return_value === 1)
								message_reply(true, message, '**Attribute ' + args[0] + ' updated successfully**');
							else if (return_value === -1)
								message_reply(false, message, '**Attribute ' + args[0] + ' is read only**');
							else if (return_value === -2)
								message_reply(false, message, '**' + args[0] + ' is not an attribute**');
						} else {
							message_reply(false, message, '**Only the channel creator can change attributes**');
						}
					}
				}
			}

		}
		update_portal_managed_guilds(true);
		return;
	}

	if (cmd === 'url') {
		if (args.length === 2) {
			edtr.create_url_channel(message.guild, args[0], args[1], portal_guilds[message.guild.id].url_list);
			message.react('✔️');
		} else if (args.length === 1) {
			edtr.create_url_channel(message.guild, args[0], null, portal_guilds[message.guild.id].url_list);
			message.react('✔️');
		} else {
			message_reply(false, message, '**' + config.prefix + 'url <channel_name> <category_name>**\n' +
				'*(channel_name: mandatory, category_name: optional)*');
		}
		update_portal_managed_guilds(true);
	}

	if (cmd === 'role_giver') {
		let roles = [];
		message.guild.roles.cache.forEach(role => { roles.push({role}); });

		if (args.length > 0) {
			try {
				role_map = JSON.parse(args.join(' '));
			} catch(error) {
				message.channel.send('Roles must be in JSON format for more info ./help role_giver');
				return;
			}
			role_emb = [];
			role_emb_prnt = [];

			role_emb_prnt.push(
				{ emote: 'Get Role', role: 'react with one of the following emotes to get this role', inline: false }
			);
			for (let i = 0; i < role_map.length; i++) {
				role_emb_prnt.push(
					{ emote: role_map[i].emote_give, role: role_map[i].role, inline: true }
				);
				role_emb.push(
					{ emote: role_map[i].emote_give, role: role_map[i].role, inline: true }
				);
			}
			role_emb_prnt.push(
				{ emote: '', role: '', inline: false },
				{ emote: 'Strip Role', role: 'react with one of the following emotes to strip this role', inline: false }
			);
			for (let i = 0; i < role_map.length; i++) {
				role_emb_prnt.push(
					{ emote: role_map[i].emote_strip, role: role_map[i].role, inline: true }
				);
				role_emb.push(
					{ emote: role_map[i].emote_strip, role: role_map[i].role, inline: true }
				);
			}
			edtr.create_role_message(message, portal_guilds[message.guild.id]['role_list'],
				'Portal Role Assigner', '', '#FF7F00', role_emb_prnt);
			message.react('✔️');
		} else {
			message_reply(false, message, '**' + config.prefix + 'role !role1->:emote: !role2->:emote: ...**');
		}

		update_portal_managed_guilds(true);
		return;
	}

	//testing processes
	if (cmd === 'purge') {
		message.guild.channels.cache.forEach((value) => {
			if (value.deletable)
				value.delete()
					.then(channel => console.log('Deleted the channel: ' + channel))
					.catch(console.error);
		})

		message.guild.channels.create('general voice', { type: 'voice' }, { bitrate: 8 })
			.then(
				message.guild.channels.create('general text', { type: 'text' })
					.then(value => {
						value.send('**PURGE DONE**')
					})
			)

		gmng.delete_guild(message.guild.id, portal_guilds);
		gmng.insert_guild(message.guild.id, portal_guilds, portal_managed_guilds_path);

		update_portal_managed_guilds(true);
		return;
	}

	if (cmd === 'save') {
		console.log('SAVE: ', portal_guilds);
		update_portal_managed_guilds(true);
		return;
	}

	if (cmd === 'force_update')
	{

	}

});
//#region 
client.login(config.token);