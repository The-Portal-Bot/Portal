/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const file_system = require('file-system');

const portal_managed_guilds_path = './server_storage/guild_list.json';
const config = require('./config.json'); // config.token / config.prefix

const guld_mngr = require('./functions/guild_manager');
const help_mngr = require('./functions/help_manager');

let guild_cooldowns = new Array();
let member_cooldowns = new Array();
let user_match = {};

const guild_cooldownable = [{ command: 'purge', timeout: 10 }, { command: 'save', timeout: 0.1 }];
const member_cooldownable = [{ command: 'force', timeout: 5 }, { command: 'join', timeout: 1 },
	{ command: 'leave', timeout: 1 }, { command: 'role', timeout: 1 }, { command: 'url', timeout: 1 }, 
	{ command: 'announce', timeout: 2 }];
const uncooldownable = ['help', 'ping', 'portal', 'run', 'set', 'spotify', 'announcement', 'focus', 'corona'];

// List of all managed channels in servers
// let guilds = require('./server_storage/guild_list.json');
let portal_managed_guilds = file_system.readFileSync(portal_managed_guilds_path);
let portal_guilds = JSON.parse(portal_managed_guilds);

// Load up the discord.js library
const Discord = require('discord.js');

// This is the client the Portal Bot. Some people call it bot, some people call
// it 'self', client.user is actually the presence of portal bot in the server
const client = new Discord.Client();

event_loader = function (event, args) {
	require(`./events/${event}.js`)(args)
		.then(rspns => { 
			if (rspns.result) {
				console.log(rspns.value);
			} else {
				console.log('error: ', rspns.value);
			}
		});
};

client.on('ready', () => // This event will run if the bot starts, and logs in, successfully.
	event_loader('ready', {
		'client': client, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

client.on('shardReconnecting', id =>
	event_loader('shardReconnecting', {
		'id': id
	})
);

client.on('guildDelete', guild => // This event triggers when the bot joins a guild.
	event_loader('guildDelete', {
		'guild': guild, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

client.on('channelDelete', channel => // This event triggers when the bot joins a guild.
	event_loader('channelDelete', {
		'channel': channel, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

client.on('guildCreate', guild => // this event triggers when the bot is removed from a guild.
	event_loader('guildCreate', {
		'guild': guild, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

client.on('presenceUpdate', (oldPresence, newPresence) => // This event triggers when the status of a guild member has changed
	event_loader('presenceUpdate', {
		'newPresence': newPresence, 'portal_guilds': portal_guilds
	})
);

client.on('voiceStateUpdate', (oldState, newState) => // This event triggers when a member joins or leaves a voice channel
	event_loader('voiceStateUpdate', {
		'client': client, 'oldState': oldState, 'newState': newState, 'portal_guilds': portal_guilds, 'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

client.on('message', async message => {
	// runs on every single message received, from any channel or DM
	// Ignore other bots and also itself ('botception')
	if (message.author.bot) return;

	// Ignore any direct message
	if (message.channel.type === 'dm') return;

	// Check if something written in url channel
	if (guld_mngr.included_in_url_list(message.channel.id, portal_guilds[message.guild.id])) {
		if (help_mngr.is_url(message)) {
			help_mngr.message_reply(
				null,
				message.author.presence.member.voice.channel,
				message,
				message.author,
				`${message.author}, the URL channels are read-only.`,
				portal_guilds,
				client);
			message.delete();
			return;
		}
	}
	if (portal_guilds[message.guild.id].spotify === message.channel.id) {
		help_mngr.message_reply(
			null,
			message.author.presence.member.voice.channel,
			message,
			message.author,
			`${message.author}, the Spotify channel is read-only.`,
			portal_guilds, 
			client);
		message.delete();
		return;
	}
	if (portal_guilds[message.guild.id].announcement === message.channel.id) {
		help_mngr.message_reply(
			null,
			message.author.presence.member.voice.channel,
			message,
			message.author,
			`${message.author}, the Announcement channel is read-only.`,
			portal_guilds, 
			client);
		message.delete();
		return;
	}

	// Ignore any message that does not start with prefix
	if (message.content.indexOf(config.prefix) !== 0) return;

	// Separate function name, and arguments of function
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();

	if (command_obj = guild_cooldownable.find(guild_cooldown => guild_cooldown.command === cmd)) {
		if (member_obj = guild_cooldowns.find(active_cooldown => active_cooldown.command === command_obj.command)) {

			const time_elapsed = Date.now() - member_obj.timestamp;
			const timeout_time = command_obj.timeout * 60 * 1000;
			const time_remaining = timeout_time - time_elapsed;

			const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0 ?
				Math.round((time_remaining / 1000 / 60)) : 0;
			const timeout_sec = Math.round((timeout_time / 1000) % 60);

			const remaining_min = Math.round((time_remaining / 1000 / 60) - 1) > 0 ?
				Math.round((time_remaining / 1000 / 60) - 1) : 0;
			const remaining_sec = Math.round((time_remaining / 1000) % 60);

			help_mngr.message_reply(
				false,
				message.author.presence.member.voice.channel,
				message,
				message.author,
				`${message.author} you need to wait ${remaining_min}:${remaining_sec}/${timeout_min}:${timeout_sec} `,
				portal_guilds, 
				client +
				`to use ${command_obj.command} again as it was used again in ${message.guild.name}.`);

		} else {
			await require(`./commands/${cmd}.js`)(client, message, args, portal_guilds, portal_managed_guilds_path)
				.then(rspns => {
					if (rspns === true) {
						guild_cooldowns.push({ command: command_obj.command, timestamp: Date.now() });
						setTimeout(() => {
							guild_cooldowns = guild_cooldowns.filter(active_cooldown =>
								active_cooldown.command !== 
								command_obj.command);
						}, command_obj.timeout * 60 * 1000);
					} else if (rspns !== false) {
						if (rspns.result === true) {
							guild_cooldowns.push({ command: command_obj.command, timestamp: Date.now() });
							setTimeout(() => {
								guild_cooldowns = guild_cooldowns.filter(active_cooldown =>
									active_cooldown.command !== cmd);
							}, command_obj.timeout * 60 * 1000);
						}
						help_mngr.message_reply(
							rspns.result,
							message.author.presence.member.voice.channel,
							message,
							message.author,
							rspns.value,
							portal_guilds, 
							client);
					}
				});
			help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds);
		}
	} else if (command_obj = member_cooldownable.find(member_cooldown => member_cooldown.command === cmd)) {
		if (member_obj = member_cooldowns.find(active_cooldown =>
			active_cooldown.member === message.author.id &&
			active_cooldown.command === command_obj.command)) {
				
			const time_elapsed = Date.now() - member_obj.timestamp;
			const timeout_time = command_obj.timeout * 60 * 1000;
			const time_remaining = timeout_time - time_elapsed;

			const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0 ?
				Math.round((time_remaining / 1000 / 60)) : 0;
			const timeout_sec = Math.round((timeout_time / 1000) % 60);

			const remaining_min = Math.round((time_remaining / 1000 / 60) - 1) > 0 ?
				Math.round((time_remaining / 1000 / 60) - 1) : 0;
			const remaining_sec = Math.round((time_remaining / 1000) % 60);

			help_mngr.message_reply(
				false,
				message.author.presence.member.voice.channel,
				message,
				message.author,
				`${message.author} you need to ${remaining_min}:${remaining_sec}/${timeout_min}:${timeout_sec} `,
				portal_guilds, 
				client +
				`to use ${command_obj.command} again.`);

		} else {
			await require(`./commands/${cmd}.js`)(client, message, args, portal_guilds, portal_managed_guilds_path)
				.then(rspns => {
					if (rspns === true) {
						member_cooldowns.push({ member: message.author.id, command: command_obj.command, timestamp: Date.now() });
						setTimeout(() => {
							member_cooldowns = member_cooldowns.filter(active_cooldown =>
								active_cooldown.member !== message.author.id &&
								active_cooldown.command !== cmd);
						}, command_obj.timeout * 60 * 1000);
					} else if (rspns !== false) {
						if (rspns.result === true) {
							member_cooldowns.push(
								{ member: message.author.id, command: command_obj.command, timestamp: Date.now() }
							);
							setTimeout(() => {
								member_cooldowns = member_cooldowns.filter(active_cooldown =>
									active_cooldown.member !== message.author.id &&
									active_cooldown.command !== cmd);
							}, command_obj.timeout * 60 * 1000);
						}
						help_mngr.message_reply(
							rspns.result,
							message.author.presence.member.voice.channel,
							message,
							message.author,
							rspns.value,
							portal_guilds, 
							client);
					}
				});
			help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds);
		}
	} else if (uncooldownable.includes(cmd)) {
		await require(`./commands/${cmd}.js`)(client, message, args, portal_guilds, portal_managed_guilds_path, user_match)
			.then(rspns => { 
				if(rspns) {
					help_mngr.message_reply(
						rspns.result,
						message.author.presence.member.voice.channel,
						message,
						message.author,
						rspns.value,
						portal_guilds, 
						client);
				}
			});
		help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds);
	}

});

client.login(config.token);

// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))