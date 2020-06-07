const file_system = require('file-system');

const portal_managed_guilds_path = "./server_storage/guild_list.json";
const config = require('./config.json'); // config.token / config.prefix

const lclz_mngr = require('./functions/localization_manager');
const guld_mngr = require('./functions/guild_manager');

let active_cooldowns = new Array();
const guild_cooldownable = [{ command: 'purge', timeout: 10 }, { command: 'save', timeout: 10 }];
const member_cooldownable = [{ command: 'force', timeout: 5 }, { command: 'join', timeout: 1 },
{ command: 'leave', timeout: 1 }, { command: 'role', timeout: 1 }, { command: 'url', timeout: 1 }];
const uncooldownable = ['help', 'ping', 'portal', 'run', 'set'];

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

message_reply = function (status, channel, msg, user, str) {
	msg.channel.send(str, user).then(msg => { msg.delete({ timeout: 5000 }) });


		// console.log('client.voice.connections : ', client.voice.connections);
	// console.log('client.voice.connections.size : ' + client.voice.connections.size);
	// client.voice.connections.forEach(element => {
	// 		console.log('element.channnel.id: ', element.channnel.id);
	// 	});
	// 	client.voice.connections.find(connection => connection.channel === channel)
	// 		.play(say.speak(str))
	// 		.catch(error.log);
	
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
client.on('ready', () => // This event will run if the bot starts, and logs in, successfully.
	require(`./events/ready.js`)(
		{ 'client': client, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path }
	)
		.then(rspns => {
			if (rspns.result) {
				console.log(rspns.value)
			}
		})
);

client.on('shardReconnecting', id =>
	require(`./events/shardReconnecting.js`)(
		{ 'id': id }
	)
		.then(rspns => {
			if (rspns.result) {
				console.log(rspns.value)
			}
		})
);

client.on('guildDelete', guild => // This event triggers when the bot joins a guild.
	require(`./events/guildCreate.js`)(
		{ 'guild': guild, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path }
	)
		.then(rspns => {
			if (rspns.result) {
				console.log(rspns.value)
			}
		})
);

client.on('guildCreate', guild => // this event triggers when the bot is removed from a guild.
	require(`./events/guildDelete.js`)(
		{ 'guild': guild, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path }
	)
		.then(rspns => {
			if (rspns.result) {
				console.log(rspns.value)
			}
		})
);

client.on('presenceUpdate', (oldPresence, newPresence) => // This event triggers when the status of a guild member has changed
	require(`./events/presenceUpdate.js`)(
		{ 'newPresence': newPresence, 'portal_guilds': portal_guilds }
	)
		.then(rspns => {
			if (rspns.result) {
				console.log(rspns.value)
			}
		})
);

client.on('voiceStateUpdate', (oldState, newState) => // This event triggers when a member joins or leaves a voice channel
	require(`./events/voiceStateUpdate.js`)(
		{ 'oldState': oldState, 'newState': newState, 'portal_guilds': portal_guilds }
	)
		.then(rspns => {
			if (rspns.result) {
				console.log(rspns.value)
			}
		})
);
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

	if (command_obj = guild_cooldownable.find(cool => cool.command === cmd)) {
		if (member_obj = active_cooldowns.find(cool => cool.member === message.guild.id && cool.command === command_obj.command)) {
			const time_elapsed = Date.now() - member_obj.timestamp;
			const timeout_time = command_obj.timeout * 60 * 1000;
			const time_remaining = timeout_time - time_elapsed;

			const remaining_min = Math.round((time_remaining / 1000 / 60) - 1);
			const remaining_sec = Math.round((time_remaining / 1000) % 60);

			message_reply(
				false,
				message.author.presence.member.voice.channel,
				message,
				message.author,
				`${message.author} you need to wait ${remaining_min}m${remaining_sec}s/${command_obj.timeout}m0s ` +
				`to use ${command_obj.command} again as it was used again in ${message.guild.name}.`);

		} else {
			await require(`./commands/${cmd}.js`)(client, message, args, portal_guilds, portal_managed_guilds_path)
				.then(rspns => {
					if (rspns === true) {
						active_cooldowns.push({ member: message.guild.id, command: command_obj.command, timestamp: Date.now() });
						setTimeout(() => {
							active_cooldowns = active_cooldowns.filter(cool =>
								cool.member !== message.guild.id && cool.command !== command_obj.command);
						}, command_obj.timeout * 60 * 1000);
					} else if (rspns !== false) {
						if (rspns.result === true) {
							active_cooldowns.push({ member: message.guild.id, command: command_obj.command, timestamp: Date.now() });
							setTimeout(() => {
								active_cooldowns = active_cooldowns.filter(cool =>
									cool.member !== message.guild.id && cool.command !== command_obj.command);
							}, command_obj.timeout * 60 * 1000);
						}
						message_reply(
							rspns.result,
							message.author.presence.member.voice.channel,
							message,
							message.author,
							rspns.value);
					}
				});
			update_portal_managed_guilds(true);
		}
	} else if (command_obj = member_cooldownable.find(cool => cool.command === cmd)) {
		if (member_obj = active_cooldowns.find(cool => cool.member === message.author.id && cool.command === command_obj.command)) {
			const time_elapsed = Date.now() - member_obj.timestamp;
			const timeout_time = command_obj.timeout * 60 * 1000;
			const time_remaining = timeout_time - time_elapsed;

			const remaining_min = Math.round((time_remaining / 1000 / 60) - 1);
			const remaining_sec = Math.round((time_remaining / 1000) % 60);

			message_reply(
				false,
				message.author.presence.member.voice.channel,
				message,
				message.author,
				`${message.author} you need to wait ${remaining_min}m${remaining_sec}s/${command_obj.timeout}m0s ` +
				`to use ${command_obj.command} again.`);

		} else {
			await require(`./commands/${cmd}.js`)(client, message, args, portal_guilds, portal_managed_guilds_path)
				.then(rspns => {
					if (rspns === true) {
						active_cooldowns.push({ member: message.author.id, command: command_obj.command, timestamp: Date.now() });
						setTimeout(() => {
							active_cooldowns = active_cooldowns.filter(cool =>
								cool.member !== message.author.id && cool.command !== command_obj.command);
						}, command_obj.timeout * 60 * 1000);
					} else if (rspns !== false) {
						if (rspns.result === true) {
							active_cooldowns.push({ member: message.author.id, command: command_obj.command, timestamp: Date.now() });
							setTimeout(() => {
								active_cooldowns = active_cooldowns.filter(cool =>
									cool.member !== message.author.id && cool.command !== command_obj.command);
							}, command_obj.timeout * 60 * 1000);
						}
						message_reply(
							rspns.result,
							message.author.presence.member.voice.channel,
							message,
							message.author,
							rspns.value);
					}
				});
			update_portal_managed_guilds(true);
		}
	} else if (uncooldownable.includes(cmd)) {
		await require(`./commands/${cmd}.js`)(client, message, args, portal_guilds, portal_managed_guilds_path)
			.then(rspns => { 
				if(rspns) {
					message_reply(
						rspns.result,
						message.author.presence.member.voice.channel,
						message,
						message.author,
						rspns.value);
				}
			});
		update_portal_managed_guilds(true);
	}

});
//#region 
client.login(config.token);

// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))