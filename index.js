/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/PortalDB', { useNewUrlParser: true })
// 	.catch(error => {
// 		console.error.bind(console, 'PortallDB connection error:');
// 		console.log('Could not connect to PortalDB (mongo) with error:\n', error);
// 		return -1;
// 	});

// const PortalDB = mongoose.connection;
// PortalDB.once('open', function() { console.log('we\'re connected!'); });

const file_system = require('file-system');

const portal_managed_guilds_path = './server_storage/guild_list.json';
const config = require('./config.json'); // config.token / config.prefix

const guld_mngr = require('./functions/guild_manager');
const help_mngr = require('./functions/help_manager');
const lclz_mngr = require('./functions/localization_manager');
const user_mngr = require('./functions/user_manager');
const play_mngr = require('./functions/music_manager');

const active_cooldown = { guild: [], member: [] };

const command_cooldown = {
	guild: {
		purge: { time: 10, auth: true, premium: true }, save: { time: 5, auth: true, premium: true },
		setup: { time: 10, auth: true, premium: true }, set_ranks: { time: 10, auth: true, premium: true },
	},
	member: {
		join: { time: 1, auth: false, premium: true }, announce: { time: 2, auth: false, premium: true },
		force: { time: 5, auth: true, premium: true },
	},
	none: {
		leaderboard: { time: 0, auth: false, premium: false }, ranks: { time: 0, auth: false, premium: true },
		level: { time: 0, auth: false, premium: false }, about: { time: 0, auth: false, premium: false },
		portal: { time: 0, auth: true, premium: false }, help: { time: 0, auth: false, premium: false },
		ping: { time: 0, auth: false, premium: false }, set: { time: 0, auth: false, premium: true },
		role: { time: 0, auth: false, premium: true }, spotify: { time: 0, auth: true, premium: true },
		music: { time: 0, auth: true, premium: true }, announcement: { time: 0, auth: true, premium: true },
		url: { time: 0, auth: true, premium: true }, leave: { time: 0, auth: false, premium: true },
		focus: { time: 0, auth: false, premium: true }, corona: { time: 0, auth: false, premium: false },
		run: { time: 0, auth: false, premium: true }, auth_roles: { time: 0, auth: true, premium: true },
		auth_role_add: { time: 0, auth: true, premium: true }, auth_role_rem: { time: 0, auth: true, premium: true },
	},
};

// Load up the discord.js library
const Discord = require('discord.js');

// This is the client the Portal Bot. Some people call it bot, some people call
// it 'self', client.user is actually the presence of portal bot in the server
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

// List of all managed channels in servers
// let guilds = require('./server_storage/guild_list.json');
const portal_managed_guilds = file_system.readFileSync(portal_managed_guilds_path);
const guild_list = help_mngr.getJSON(portal_managed_guilds);

if(guild_list === null) {
	console.log('guild json is corrupt');
	return;
}

event_loader = function(event, args) {
	console.log(`event emitted: ${event}`);
	require(`./events/${event}.js`)(args)
		.then(rspns => {
			if(rspns !== null && rspns !== undefined) {
				if(event === 'messageReactionAdd') {
					const music_channel_id = args.guild_list[args.messageReaction.message.guild.id]
						.music_data.channel_id;
					const music_channel = args.messageReaction.message.guild.channels.cache
						.find(channel => channel.id === music_channel_id);

					music_channel
						.send(`${args.user}, ${rspns.value.toString()}`)
						.then(msg => { msg.delete({ timeout: 5000 }); })
						.catch(error => console.log(error));
				}
				else {
					console.log(rspns.result, rspns.value);
				}
			}
		});
};

// This event will run if the bot starts, and logs in, successfully.
client.on('ready', () =>
	event_loader('ready',
		{
			'client': client, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
		},
	));

// When bot connects to shard again ?
client.on('shardReconnecting', id =>
	event_loader('shardReconnecting',
		{
			'id': id,
		},
	));

// This event triggers when the bot joins a guild.
client.on('guildDelete', guild =>
	event_loader('guildDelete',
		{
			'guild': guild, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
		},
	));

// this event triggers when the bot is removed from a guild.
client.on('guildCreate', guild =>
	event_loader('guildCreate',
		{
			'client': client, 'guild': guild, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
		},
	));

// This event triggers when the bot joins a guild.
client.on('channelDelete', channel =>
	event_loader('channelDelete',
		{
			'channel': channel, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
		},
	));

// This event triggers when a new member joins a guild.
client.on('guildMemberAdd', member =>
	event_loader('guildMemberAdd',
		{
			'member': member, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
		},
	));

// This event triggers when a new member leaves a guild.
client.on('guildMemberRemove', member =>
	event_loader('guildMemberRemove',
		{
			'member': member, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
		},
	));

// This event triggers when the status of a guild member has changed
client.on('presenceUpdate', (oldPresence, newPresence) =>
	event_loader('presenceUpdate',
		{
			'client': client, 'guild_list': guild_list,
			'newPresence': newPresence,
		},
	));

// This event triggers when a member reacts to a message
client.on('messageReactionAdd', (messageReaction, user) =>
	event_loader('messageReactionAdd',
		{
			'client': client, 'guild_list': guild_list,
			'messageReaction': messageReaction, 'user': user,
		},
	));

// This event triggers when a message is deleted
client.on('messageDelete', (message) =>
	event_loader('messageDelete',
		{
			'client': client, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
			'message': message,
		},
	));

// This event triggers when a member joins or leaves a voice channel
client.on('voiceStateUpdate', (oldState, newState) =>
	event_loader('voiceStateUpdate',
		{
			'client': client, 'guild_list': guild_list,
			'portal_managed_guilds_path': portal_managed_guilds_path,
			'oldState': oldState, 'newState': newState,
		},
	));

client.on('message', async message => {
	// runs on every single message received, from any channel or DM
	// Ignore other bots and also itself ('botception')
	if (message.author.bot) return;

	// Ignore any direct message
	if (message.channel.type === 'dm') return;

	// Check if something written in url channel
	let channel_type = null, channel_support = null, channel_talk = null;

	if (guld_mngr.included_in_url_list(message.channel.id, guild_list[message.guild.id])) {
		if(help_mngr.is_url(message.content)) {
			lclz_mngr.client_talk(client, guild_list, 'url');
			return;
		}
		else {
			channel_type = 'URL';
			channel_support = 'url';
			channel_talk = 'read_only';
		}
	}
	// else if (guild_list[message.guild.id].spotify === message.channel.id) {
	// 	channel_type = 'Spotify';
	// 	channel_support = 'read';
	// 	channel_talk = 'read_only';
	// }
	else if (guild_list[message.guild.id].music_data.channel_id === message.channel.id) { // tsiakkas
		play_mngr.start(client, message, message.content.toString(), guild_list)
			.then(joined => {
				help_mngr.message_reply(
					joined.result, message.author.presence.member.voice.channel,
					message, message.author, joined.value, guild_list, client, true);
			})
			.catch(error => {
				console.log(error);
				message.delete();
			});
		return;
	}
	// else if (guild_list[message.guild.id].announcement === message.channel.id) {
	// 	channel_type = 'Announcement';
	// 	channel_support = 'read';
	// 	channel_talk = 'read_only';
	// }

	if (channel_type !== null && channel_support !== null && channel_talk !== null) {
		lclz_mngr.client_talk(client, guild_list, channel_talk);
		help_mngr.message_reply(
			null, message.author.presence.member.voice.channel, message,
			message.author, `${channel_type} channel is ${channel_support}-only.`,
			guild_list, client);
		message.delete();
		return;
	}

	// ranking system
	const level = user_mngr.add_points_message(message, guild_list);
	if(level) {
		help_mngr.message_reply(
			null, message.author.presence.member.voice.channel, message,
			message.author, `You reached level ${level}!`,
			guild_list, client);
	}
	help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, guild_list);

	// require('./moderation/bad_word_check.js')(message.content.trim().split(/ +/g))
	// 	.then(rspns => {
	// 		message.react('🚩');
	// 		if (rspns) {
	// 			help_mngr.message_reply(
	// 				rspns.result, message.author.presence.member.voice.channel, message, message.author,
	// 				rspns.value, guild_list, client, false, '✔️', '🚩');
	// 		}
	// 	});

	// Ignore any message that does not start with prefix
	if (message.content.indexOf(config.prefix) !== 0) return;

	// Separate function name, and arguments of function
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	let type = null;

	if (command_cooldown.guild[cmd]) {
		type = 'guild';
	}
	else if (command_cooldown.member[cmd]) {
		type = 'member';
	}
	else if (command_cooldown.none[cmd]) {
		type = 'none';
	}
	else {
		return;
	}

	if (command_cooldown[type][cmd].auth) {
		const is_user_authorized = help_mngr.is_authorized(guild_list[message.guild.id].auth_role, message.member);

		if (!is_user_authorized) {
			help_mngr.message_reply(false, message.author.presence.member.voice.channel, message, message.author,
				'you are not authorized to access this command', guild_list, client);
			return;
		}
	}

	if (command_cooldown[type][cmd].premium && !guild_list[message.guild.id].premium) {
		help_mngr.message_reply(
			false, message.author.presence.member.voice.channel, message,
			message.author, 'this server is not premium', guild_list, client);
		return;
	}
	// else {
	// 	help_mngr.message_reply(true, message.author.presence.member.voice.channel, message, message.author,
	// 		'you are authorized to access this command', guild_list, client);
	// }

	if (type === 'none' && command_cooldown.none[cmd].time === 0) {
		require(`./commands/${cmd}.js`)(client, message, args, guild_list, portal_managed_guilds_path)
			.then(rspns => {
				if(rspns) {
					if (rspns.result === true) {
						help_mngr.message_reply(true, message.author.presence.member.voice.channel, message,
							message.author, rspns.value, guild_list, client);
					}
					else if (rspns.result === false) {
						help_mngr.message_reply(rspns.result, message.author.presence.member.voice.channel, message,
							message.author, rspns.value, guild_list, client);
					}
				}
				help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, guild_list);

				// help_mngr.message_reply(rspns, message.author.presence.member.voice.channel, message,
				// 	message.author, rspns ? 'executed correctly' : 'executed falsely', guild_list, client);
			});


		return;
	}

	if (active = active_cooldown[type].find(active =>
		(type === 'member' && active.member === message.author.id && active.command === cmd)
			? true : (type === 'guild' && active.command === cmd))) {
		const time = help_mngr.time_elapsed(active.timestamp, command_cooldown[type][cmd].time);

		help_mngr.message_reply(
			false, message.author.presence.member.voice.channel, message,
			message.author, `*you need to wait* **${help_mngr.pad(time.remaining_min)}:` +
			`${help_mngr.pad(time.remaining_sec)}/${help_mngr.pad(time.timeout_min)}:` +
			`${help_mngr.pad(time.timeout_sec)}** *to use* **${cmd}** *again${type === 'member'
				? '.*'
				: `, as it was used again in* **${message.guild.name}**.`}`,
			guild_list, client);

		return;
	}

	require(`./commands/${cmd}.js`)(client, message, args, guild_list, portal_managed_guilds_path)
		.then(rspns => {
			if (rspns.result === true) {
				active_cooldown[type].push({
					member: message.author.id, command: cmd,
					timestamp: Date.now(),
				});

				setTimeout(() => {
					active_cooldown[type] = active_cooldown[type].filter(
						active => active.command !== cmd);
				}, command_cooldown[type][cmd].time * 60 * 1000);

				help_mngr.message_reply(true, message.author.presence.member.voice.channel, message,
					message.author, rspns ? 'executed correctly' : rspns.value, guild_list, client);
			}
			else if (rspns.result === false) {
				help_mngr.message_reply(rspns.result, message.author.presence.member.voice.channel, message,
					message.author, rspns.value, guild_list, client);
			}

			help_mngr.update_portal_managed_guilds(true, portal_managed_guilds_path, guild_list);

			help_mngr.message_reply(rspns, message.author.presence.member.voice.channel, message,
				message.author, rspns ? 'executed correctly' : 'executed falsely', guild_list, client);
		});
});

client.login(config.token);

// console.log('Object.getOwnPropertyNames(message)= ', Object.getOwnPropertyNames(message))
// console.log('Object.getOwnPropertyNames(message.author)= ', Object.getOwnPropertyNames(message.author))