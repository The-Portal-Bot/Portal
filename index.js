const file_system = require('file-system');
const say = require('say');
let say_voice = undefined;

const portal_managed_guilds_path = "./server_storage/guild_list.json";
const config = require('./config.json'); // config.token / config.prefix

const lclz_mngr = require('./functions/localization_manager');
const guld_mngr = require('./functions/guild_manager');

const func_objct = require('./assets/properties/function_list');
const vrbl_objct = require('./assets/properties/variable_list');
const pipe_objct = require('./assets/properties/pipe_list');
const attr_objct = require('./assets/properties/attribute_list');
const strc_objct = require('./assets/properties/structure_list');

// List of all managed channels in servers
// let guilds = require('./server_storage/guild_list.json');
let portal_managed_guilds = file_system.readFileSync(portal_managed_guilds_path);
let portal_guilds = JSON.parse(portal_managed_guilds);
// var polyglot = new Polyglot();

// Load up the discord.js library
const Discord = require('discord.js');

// This is the client the Portal Bot. Some people call it bot, some people call
// it 'self', client.user is actually the presence of portal bot in the server
const client = new Discord.Client();

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
			guld_mngr.delete_voice_channel(guild_channel, portal_guilds[current_guild.id].portal_list);
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
		if (force) file_system.writeFileSync(portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8');
		else file_system.writeFile(portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8');
	}, 1000);
}

message_reply = function (status, msg, user, str) {
	console.log('status: ',status);
	console.log('msg: ',msg);
	console.log('user: ',user);
	console.log('str: ',str);

	msg.channel.send(user, str)
		.then(msg => { msg.delete({ timeout: 5000 }) });
	if (say_voice !== undefined) {
		let dispatcher = say_voice.play(say.speak(str));
		dispatcher.on('error', console.log);
	}
	if (status === true) {
		msg.react('✔️');
	} else if (status === false) {
		msg.react('❌');
	}
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

// This event will run if the bot starts, and logs in, successfully.
client.on('ready', () => {
	console.log(lclz_mngr.text_localization.gr.hello(client.users.cache.size, client.channels.cache.size, client.guilds.cache.size));
	// Changing Portal bots status
	client.user.setActivity('./help', { url: 'https://github.com/keybraker', type: 'LISTENING' });
	client.guilds.cache.forEach(guild => { portal_init(guild); })
});

client.on('shardReconnecting', id =>
	console.log(`Shard with ID ${id} reconnected.`)
);

// This event triggers when the bot joins a guild.
client.on('guildCreate', guild => {

	// Inserting guild to portal's guild list if it does not exist
	if (!guld_mngr.included_in_guild_list(guild.id, portal_guilds))
		guld_mngr.insert_guild(guild.id, portal_guilds, portal_managed_guilds_path);
	update_portal_managed_guilds(true);

	console.log('Portal joined guild: ' + guild.name
		+ ' (id: + ' + guild.id
		+ ').\nThis guild has + '
		+ guild.memberCount + ' members!');
	// Changing Portal bots status 
	client.user.setActivity('./portal channel', { type: 'LISTENING' });
});

// this event triggers when the bot is removed from a guild.
client.on('guildDelete', guild => {
	guld_mngr.delete_guild(guild.id, portal_guilds);
	update_portal_managed_guilds(true);

	console.log('Portal has been removed from: ${guild.name} (id: ${guild.id})');
	client.user.setActivity('Serving ${client.guilds.cache.size} servers');
});

// This event triggers when the status of a guild member has changed
client.on('presenceUpdate', (oldPresence, newPresence) => {
	if (!guld_mngr.included_in_portal_guilds(newPresence.guild.id, portal_guilds)) {
		console.log(
			newPresence.member.displayName +
			', who is a member of a handled server,' +
			' has changed presence, but is in another server (' +
			newPresence.guild.name + ')');
		return;
	}

	console.log(
		newPresence.member.displayName +
		', has changed presence, in controlled server (' +
		newPresence.guild.name + ')');

	let current_guild = newPresence.guild;
	let current_channel = newPresence.member.voice.channel;

	if (current_channel) { // if member is in a channel
		let current_portal_list = portal_guilds[current_guild.id].portal_list;
		for (let key in portal_guilds[current_guild.id].portal_list) {
			if (current_voice_channel = current_portal_list[key].voice_list[current_channel.id]) {
				console.log(`${Math.round(((Date.now() - current_voice_channel.last_update) / 1000 / 60))}m` +
					`${Math.round(((Date.now() - current_voice_channel.last_update) / 1000) % 60)}s / 5m0s`);
				if ((Date.now() - current_voice_channel.last_update) >= 300000) {
					if (guld_mngr.generate_channel_name(current_channel, current_portal_list)){
						current_voice_channel.last_update = Date.now();
					}
				}
			}
		}
	}

	return;
});

// This event triggers when a member joins or leaves a voice channel
client.on('voiceStateUpdate', (oldState, newState) => {
	let newChannel = newState.channel; // join channel
	let oldChannel = oldState.channel; // left channel

	console.log('from: ' + oldChannel + ' to ' + newChannel);

	if (oldChannel === null && newChannel !== null) { // Joined from null
		console.log('null->existing');

		if (guld_mngr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user joined portal channel
			guld_mngr.create_voice_channel(newState, portal_guilds[newState.guild.id].portal_list[newChannel.id], newState.id);
			guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
		} else if (guld_mngr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user joined voice channel
			guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
		}
	} else if (newChannel === null && oldChannel !== null) { // Left to null
		console.log('existing->null');

		if (guld_mngr.included_in_portal_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user left portal channel this part is handled before
		} else if (guld_mngr.included_in_voice_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) { // user left voice channel
			if (oldChannel.members.size === 0) {
				guld_mngr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
			}
		}
	} else if (newChannel !== null && oldChannel !== null) { // Moved from channel to channel
		console.log('existing->existing');

		if (guld_mngr.included_in_portal_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) {
			console.log('->source: portal_list');

			if (guld_mngr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // this should not happen
				console.log('->dest: portal_list');
				console.log('this should not happen error: portal_channel->portal_channel');
			} else if (guld_mngr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // has been checked before
				console.log('->dest: voice_list');
				console.log('has been checked before');
				guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
			} else { // Left portal channel and joined another unknown
				console.log('->dest: unknown');
				guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
			}
		} else if (guld_mngr.included_in_voice_list(oldChannel.id, portal_guilds[newState.guild.id].portal_list)) {
			console.log('->source: voice_list');

			if (guld_mngr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // left created channel and joins portal
				console.log('->dest: portal_list');

				if (oldChannel.members.size === 0) {
					guld_mngr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
				}
				guld_mngr.create_voice_channel(newState, portal_guilds[newState.guild.id].portal_list[newChannel.id], newState.id);
				guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
			} else if (guld_mngr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // Left created channel and joins another created
				console.log('->dest: voice_list');

				if (oldChannel.members.size === 0) {
					guld_mngr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
				}
				guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
			} else { // Left created channel and joins another unknown
				console.log('->dest: unknown');

				if (oldChannel.members.size === 0) {
					guld_mngr.delete_voice_channel(oldChannel, portal_guilds[newState.guild.id].portal_list);
				}
				guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
			}
		} else {
			console.log('->source: unknown voice');

			if (guld_mngr.included_in_portal_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // Joined portal channel
				console.log('->dest: portal_list');

				guld_mngr.create_voice_channel(newState, portal_guilds[newState.guild.id].portal_list[newChannel.id], newState.id);
				guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
			}
			else if (guld_mngr.included_in_voice_list(newChannel.id, portal_guilds[newState.guild.id].portal_list)) { // left created channel and joins another created
				console.log('->dest: voice_list');

				guld_mngr.generate_channel_name(newChannel, portal_guilds[newState.guild.id].portal_list);
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

	if (cmd === 'join') {
		console.log(message.author.presence.member.voice);
		// check if he is in an portal channel and then connect
		message.author.presence.member.voice.channel.join()
			.then(connection => {
				say_voice = connection;
				say_voice.play(say.speak('The cavalry\'s here !', 'Alex', 1));
				console.log('connected to channel');
			})
			.catch(e => { console.log(e); });
		// message.channel.send("connected to the channel!", { tts: true})

		return;
	}

	if (cmd === 'leave') {
		message.author.presence.member.voice.channel.leave();
		return;
	}

	if (cmd === 'portal') {
		if (args.length === 2) {
			guld_mngr.create_portal_channel(message.guild, args[0], args[1],
				portal_guilds[message.guild.id].portal_list, message.member.id);
		} else if (args.length === 1) {
			guld_mngr.create_portal_channel(message.guild, args[0], null,
				portal_guilds[message.guild.id].portal_list, message.member.id);
		} else {
			message_reply(false, message, message.author, '**' + config.prefix + 'portal <channel_name> <category_name>**\n' +
				'*(channel_name: mandatory, category_name: optional)*');
		}

		message_reply(true, message, message.author, '*Keep in mind that after Discord\'s update*, ' +
			'**channel names can be update twice per 10 minutes**');
		update_portal_managed_guilds(true);
		return;
	}

	if (cmd === 'help') {
		if (args.length === 0) {
			message.author.send(func_objct.get_help()).catch(console.error);
			message.author.send(vrbl_objct.get_help()).catch(console.error);
			message.author.send(pipe_objct.get_help()).catch(console.error);
			message.author.send(attr_objct.get_help()).catch(console.error);
			message.author.send(strc_objct.get_help()).catch(console.error);
		} else if (args.length === 1) {
			if (args[0] === 'func') {
				message.author.send(func_objct.get_help()).catch(console.error);
			} else if (args[0] === 'vrbl') {
				message.author.send(vrbl_objct.get_help()).catch(console.error);
			} else if (args[0] === 'pipe') {
				message.author.send(pipe_objct.get_help()).catch(console.error);
			} else if (args[0] === 'attr') {
				message.author.send(attr_objct.get_help()).catch(console.error);
			} else if (args[0] === 'strc') {
				message.author.send(strc_objct.get_help()).catch(console.error);
			} else if (func_detailed = func_objct.get_help_super(args[0])) {
				message.author.send(func_detailed).catch(console.error);
			} else if (vrbl_detailed = vrbl_objct.get_help_super(args[0])) {
				message.author.send(vrbl_detailed).catch(console.error);
			} else if (pipe_detailed = pipe_objct.get_help_super(args[0])) {
				message.author.send(pipe_detailed).catch(console.error);
			} else if (attr_detailed = attr_objct.get_help_super(args[0])) {
				message.author.send(attr_detailed).catch(console.error);
			} else if (strc_detailed = strc_objct.get_help_super(args[0])) {
				message.author.send(strc_detailed).catch(console.error);
			} else {
				message_reply(false, message, message.author, `**${args[0]}**, *does not exist in Portal™,` +
					`you can always try **./help***`);
				return;
			}
		}
		
		message_reply(true, message, message.author, message.author.username + ', I sent you a private message');
		return;
	}

	if (cmd === 'run') {
		let current_voice = message.member.voice;
		let current_portal_list = portal_guilds[message.guild.id].portal_list;

		if (current_voice === null) {
			message_reply(false, message, message.author, '*You must be in a channel handled by* **Portal™** *to run commands*');
			return;
		} else if (!guld_mngr.included_in_voice_list(current_voice.channelID, current_portal_list)) {
			message_reply(false, message, message.author, '*The channel you are in is not handled by* **Portal™**');
			return;
		}

		for (let key in current_portal_list) {
			if (current_portal_list[key].voice_list[current_voice.channelID]) {
				message.channel.send('executing: ' + args.join(' '))
					.then(sentMessage => {
						sentMessage.edit(
							guld_mngr.regex_interpreter(
								args.join(' '),
								current_voice.channel,
								current_portal_list[key].voice_list[current_voice.channelID],
								current_portal_list[key]
							)
						);
					});
			}
		}

		message.react('✔️');
		return;
	}

	if (cmd === 'set') { // set attributes
		current_portal_list = portal_guilds[message.guild.id].portal_list;

		if (message.member.voice.channelID === undefined) {
			message_reply(false, message, message.author, '*You must be in a channel handled by* **Portal™** *to set attributes*');
		} else if (!guld_mngr.included_in_voice_list(message.member.voice.channelID, current_portal_list)) {
			message_reply(false, message, message.author, '*The channel you are in is not handled by* **Portal™**');
		} else if (args.length > 1) { // check for type accuracy and make better

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
								message_reply(true, message, message.author, '**Attribute ' + args[0] + ' updated successfully**');
							else if (return_value === -1)
								message_reply(false, message, message.author, '**Attribute ' + args[0] + ' is read only**');
							else if (return_value === -2)
								message_reply(false, message, message.author, '**' + args[0] + ' is not an attribute**');
						} else {
							message_reply(false, message, message.author, '**Only the channel creator can change attributes**');
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
			guld_mngr.create_url_channel(message.guild, args[0], args[1], portal_guilds[message.guild.id].url_list);
			message.react('✔️');
		} else if (args.length === 1) {
			guld_mngr.create_url_channel(message.guild, args[0], null, portal_guilds[message.guild.id].url_list);
			message.react('✔️');
		} else {
			message_reply(false, message, message.author, '**' + config.prefix + 'url <channel_name> <category_name>**\n' +
				'*(channel_name: mandatory, category_name: optional)*');
		}
		update_portal_managed_guilds(true);
	}

	if (cmd === 'role_giver') {
		let roles = [];
		message.guild.roles.cache.forEach(role => { roles.push({ role }); });

		if (args.length > 0) {
			try {
				role_map = JSON.parse(args.join(' '));
			} catch (error) {
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
			guld_mngr.create_role_message(message, portal_guilds[message.guild.id]['role_list'],
				'Portal Role Assigner', '', '#FF7F00', role_emb_prnt);
			message.react('✔️');
		} else {
			message_reply(false, message, message.author, '**' + config.prefix + 'role !role1->:emote: !role2->:emote: ...**');
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

		guld_mngr.delete_guild(message.guild.id, portal_guilds);
		guld_mngr.insert_guild(message.guild.id, portal_guilds, portal_managed_guilds_path);

		update_portal_managed_guilds(true);
		return;
	}

	if (cmd === 'ping') {
		const msg = await message.channel.send('Ping?');
		msg.edit(`Pong!\nLatency of rtt is ${msg.createdTimestamp - message.createdTimestamp}ms.\n` +
			`Latency to portal is ${client.ws.ping}ms`);
		return;
	}

	if (cmd === 'save') {
		console.log('SAVE: ', portal_guilds);
		update_portal_managed_guilds(true);
		return;
	}

	if (cmd === 'force_update') {

	}

});
//#region 
client.login(config.token);

		// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
		// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))