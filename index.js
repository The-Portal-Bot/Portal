/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const file_system = require('file-system');

const portal_managed_guilds_path = './server_storage/guild_list.json';
const config = require('./config.json'); // config.token / config.prefix

const guld_mngr = require('./functions/guild_manager');
const help_mngr = require('./functions/help_manager');
const lclz_mngr = require('./functions/localization_manager');

let user_match = {};

let active_cooldown = {
	guild: [], member: []
};

const command_cooldown = { 
	guild: {
		purge: 10, save: 5
	},
	member: {
		force: 5, join: 1, announce: 2
	},
	none: {
		portal: 0, help: 0, ping: 0, run: 0, set: 0, role: 0, spotify: 0,
		announcement: 0, url: 0, focus: 0, corona: 0, leave: 0, auth_role_add: 0, auth_role_rem: 0
	}
};

// Load up the discord.js library
const Discord = require('discord.js');

// This is the client the Portal Bot. Some people call it bot, some people call
// it 'self', client.user is actually the presence of portal bot in the server
const client = new Discord.Client();

// List of all managed channels in servers
// let guilds = require('./server_storage/guild_list.json');
let portal_managed_guilds = file_system.readFileSync(portal_managed_guilds_path);
let portal_guilds = JSON.parse(portal_managed_guilds);

event_loader = function (event, args) {
	require(`./events/${event}.js`)(args)
		.then(rspns => {
			if (rspns.result) {
				console.log(rspns.value);
			} else {
				console.log('ERROR: ', rspns.value);
			}
		});
};

// This event will run if the bot starts, and logs in, successfully.
client.on('ready', () =>
	event_loader('ready',
		{
			'client': client, 'portal_guilds': portal_guilds,
			'portal_managed_guilds_path': portal_managed_guilds_path
		}
	));

// When bot connects to shard again ?
client.on('shardReconnecting', id =>
	event_loader('shardReconnecting',
		{
			'id': id
		}
	));

// This event triggers when the bot joins a guild.
client.on('guildDelete', guild =>
	event_loader('guildDelete',
		{
			'guild': guild, 'portal_guilds': portal_guilds,
			'portal_managed_guilds_path': portal_managed_guilds_path
		}
	));

// This event triggers when the bot joins a guild.
client.on('channelDelete', channel =>
	event_loader('channelDelete',
		{
			'channel': channel, 'portal_guilds': portal_guilds,
			'portal_managed_guilds_path': portal_managed_guilds_path
		}
	));

// this event triggers when the bot is removed from a guild.
client.on('guildCreate', guild =>
	event_loader('guildCreate',
		{
			'guild': guild, 'portal_guilds': portal_guilds,
			'portal_managed_guilds_path': portal_managed_guilds_path
		}
	));

// This event triggers when the status of a guild member has changed
client.on('presenceUpdate', (oldPresence, newPresence) =>
	event_loader('presenceUpdate',
		{
			'client': client, 'portal_guilds': portal_guilds,
			'newPresence': newPresence
		}
	));

// This event triggers when a member joins or leaves a voice channel
client.on('voiceStateUpdate', (oldState, newState) =>
	event_loader('voiceStateUpdate',
		{
			'client': client, 'portal_guilds': portal_guilds,
			'portal_managed_guilds_path': portal_managed_guilds_path,
			'oldState': oldState, 'newState': newState
		}
	));

client.on('message', async message => {
	// runs on every single message received, from any channel or DM
	// Ignore other bots and also itself ('botception')
	if (message.author.bot) return;

	// Ignore any direct message
	if (message.channel.type === 'dm') return;

	// Check if something written in url channel
	let channel_type = null, channel_support = null;
	if (guld_mngr.included_in_url_list(message.channel.id, portal_guilds[message.guild.id])) {
		channel_type = 'URL'; channel_support = 'url';
	} else if (portal_guilds[message.guild.id].spotify === message.channel.id) {
		channel_type = 'Spotify'; channel_support = 'read';
	} else if (portal_guilds[message.guild.id].announcement === message.channel.id) {
		channel_type = 'Announcement'; channel_support = 'read';
	}

	if ((channel_type !== null && channel_type !== 'URL') || channel_type === 'URL' && !help_mngr.is_url(message.content)) {
		lclz_mngr.client_talk(client, portal_guilds, 'read_only');
		help_mngr.message_reply(
			null, message.author.presence.member.voice.channel, message, 
			message.author, `${channel_type} channel is ${channel_support}-only.`,
			portal_guilds, client);
		message.delete();
		return;
	} else if (channel_type === 'URL') {
		lclz_mngr.client_talk(client, portal_guilds, 'url');
	}

	// Ignore any message that does not start with prefix
	if (message.content.indexOf(config.prefix) !== 0) return;

	// Separate function name, and arguments of function
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();

	if (!help_mngr.is_authorized(portal_guilds[message.guild.id].auth_list, message.member)) {
		help_mngr.message_reply(false, message.author.presence.member.voice.channel, message, message.author,
			'you are not authorized to access this command', portal_guilds, client);
		return;
	} else {
		// help_mngr.message_reply(true, message.author.presence.member.voice.channel, message, message.author,
		// 	'you are authorized to access this command', portal_guilds, client);
	}

	let type = null;

	if (!(command_cooldown.guild[cmd] >= 0)) {
		if (!(command_cooldown.member[cmd] >= 0)) {
			if (command_cooldown.none[cmd] === 0) {
				await require(`./commands/${cmd}.js`)(client, message, args,
					portal_guilds, portal_managed_guilds_path, user_match)
					.then(rspns => {
						if (rspns) {
							help_mngr.message_reply(
								rspns.result, message.author.presence.member.voice.channel,
								message, message.author, rspns.value, portal_guilds, client);
						}
					});
				help_mngr.update_portal_managed_guilds(true, 
					portal_managed_guilds_path, portal_guilds);
			}
			return;
		} else {
			type = 'member';
		}
	} else {
		type = 'guild';
	}

	if (active = active_cooldown[type].find(active =>
		(type === 'member' && active.member === message.author.id && active.command === cmd)
			? true : (type === 'guild' && active.command === cmd))) {
		let time = help_mngr.time_elapsed(active.timestamp, command_cooldown[type][cmd]);

		help_mngr.message_reply( false, message.author.presence.member.voice.channel, message,
			message.author, `*you need to wait* **${help_mngr.pad(time.remaining_min)}:${help_mngr.pad(time.remaining_sec)}/`+
			`${help_mngr.pad(time.timeout_min)}:${help_mngr.pad(time.timeout_sec)}** *to use* **${cmd}** *again${type === 'member' 
				? '.*'
				: `, as it was used again in* **${message.guild.name}**.`}`,
			portal_guilds, client);

		return;
	}

	await require(`./commands/${cmd}.js`)(client, message, args, portal_guilds, portal_managed_guilds_path)
		.then(rspns => {
			console.log('vazo to ' + cmd + 'stoactive ooldown');
			if (rspns.result === true) {

				active_cooldown[type].push({
					member: message.author.id, command: cmd,
					timestamp: Date.now()
				});

				setTimeout(() => {
					active_cooldown[type] = active_cooldown[type].filter(
						active => active.command !== cmd);
				}, command_cooldown[type][cmd] * 60 * 1000);

				help_mngr.message_reply(
					true, message.author.presence.member.voice.channel,
					message, message.author, rspns === true ?
						'executed correctly' :
						rspns.value, portal_guilds, client);

				help_mngr.update_portal_managed_guilds(
					true, portal_managed_guilds_path, portal_guilds);
			}

			help_mngr.message_reply(
				rspns.result, message.author.presence.member.voice.channel,
				message, message.author, rspns.value, portal_guilds, client);
		});
});

client.login(config.token);

// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))