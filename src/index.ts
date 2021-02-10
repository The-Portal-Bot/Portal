import {
	Channel, Client, Guild, GuildMember, Intents, Message, MessageReaction, PartialDMChannel,
	PartialGuildMember, PartialMessage, PartialUser, Presence, StreamDispatcher, TextChannel,
	User, VoiceState
} from "discord.js";
import mongoose from 'mongoose'; // we want to load an object not only functions
import command_config_json from './config.command.json';
import event_config_json from './config.event.json';
import config from './config.json';
import { included_in_ignore_list, included_in_url_list } from './libraries/guildOps';
import { is_authorised, is_url, message_reply, pad, time_elapsed } from './libraries/helpOps';
import { client_talk } from './libraries/localisationOps';
import { isProfane } from "./libraries/modOps";
import { fetch_guild, remove_ignore, remove_url, set_music_data } from "./libraries/mongoOps";
import { start, stop } from './libraries/musicOps';
import { add_points_message } from './libraries/userOps';
import { GuildPrtl, MusicData } from './types/classes/GuildPrtl';
import { ActiveCooldowns, CommandOptions, ReturnPormise } from "./types/interfaces/InterfacesPrtl";
const AntiSpam = require('discord-anti-spam');

// Connect to mongoose database
mongoose.connect(config.mongo_url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})
	.then(() => {
		console.log('> connected to the database');
	}).catch((err) => {
		console.log('> unable to connect to database: ' + err);
		process.exit(1);
	});

const anti_spam = new AntiSpam({
	warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
	kickThreshold: 50, // Amount of messages sent in a row that will cause a ban.
	banThreshold: 70, // Amount of messages sent in a row that will cause a ban.
	maxInterval: 2000, // Amount of time (in milliseconds) in which messages are considered spam.
	warnMessage: '{@user}, please stop spamming', // Message that will be sent in chat upon warning a user.
	kickMessage: '**{user_tag}** has been kicked for spamming', // Message that will be sent in chat upon kicking a user.
	banMessage: '**{user_tag}** has been banned for spamming', // Message that will be sent in chat upon banning a user.
	maxDuplicatesWarning: 7, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesKick: 50, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesBan: 70, // Amount of duplicate messages that trigger a warning.
	exemptPermissions: [], // Bypass users with any of these permissions. ('ADMINISTRATOR')
	ignoreBots: true, // Ignore bot messages.
	debug: false,
	verbose: true, // Extended Logs from module.
	ignoredUsers: [], // Array of User IDs that get ignored.
});

const dispatchers: { id: string, dispatcher: StreamDispatcher }[] = [];
const active_cooldowns: ActiveCooldowns = { guild: [], member: [] };

// this is the client the Portal Bot. Some people call it bot, some people call
// it 'self', client.user is actually the presence of portal bot in the server
const client = new Client(
	{
		partials: [
			'USER',
			'CHANNEL',
			'GUILD_MEMBER',
			'MESSAGE',
			'REACTION'
		],
		ws: {
			intents: Intents.ALL
			// [
			// 	'GUILDS',
			// 	'GUILD_MEMBERS',
			// 	'GUILD_BANS',
			// 	'GUILD_INVITES',
			// 	'GUILD_VOICE_STATES',
			// 	'GUILD_PRESENCES',
			// 	'GUILD_MESSAGES',
			// 	'GUILD_MESSAGE_REACTIONS',
			// 	'GUILD_MESSAGE_TYPING'
			// ]
		}
	}
);

// This event triggers when the bot joins a guild.
client.on('channelDelete', (channel: Channel | PartialDMChannel) => {
	event_loader('channelDelete', {
		'channel': channel,
		'dispatchers': dispatchers
	});
});

// This event triggers when the bot joins a guild
client.on('guildCreate', (guild: Guild) =>
	event_loader('guildCreate', {
		'client': client,
		'guild': guild
	})
);

// this event triggers when the bot is removed from a guild
client.on('guildDelete', (guild: Guild) =>
	event_loader('guildDelete', {
		'guild': guild
	})
);

// This event triggers when a new member joins a guild.
client.on('guildMemberAdd', (member: GuildMember) => {
	event_loader('guildMemberAdd', {
		'member': member
	})
});

// This event triggers when a new member leaves a guild.
client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
	event_loader('guildMemberRemove', {
		'member': member
	})
});

// This event triggers when a message is deleted
client.on('messageDelete', (message: Message | PartialMessage) =>
	event_loader('messageDelete', {
		'client': client,
		'message': message
	})
);

// This event triggers when a member reacts to a message
client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User | PartialUser) =>
	event_loader('messageReactionAdd', {
		'client': client,
		'messageReaction': messageReaction,
		'user': user,
		'dispatchers': dispatchers
	})
);

// This event triggers when the status of a guild member has changed
client.on('presenceUpdate', (oldPresence: Presence | undefined, newPresence: Presence | undefined) =>
	event_loader('presenceUpdate', {
		'client': client,
		'newPresence': newPresence
	})
);

// This event will run if the bot starts, and logs in, successfully.
client.on('ready', () =>
	event_loader('ready', {
		'client': client
	})
);

// This event triggers when a member joins or leaves a voice channel
client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) =>
	event_loader('voiceStateUpdate', {
		'client': client,
		'oldState': oldState,
		'newState': newState,
		'dispatchers': dispatchers
	})
);

// runs on every single message received, from any channel or DM
client.on('message', async (message: Message) => {
	// message has errors
	if (!message) return;
	if (!message.member) return;
	if (!message.guild) return;

	// Ignore other bots and also itself ('botception')
	if (message.author.bot) return;

	// Ignore any direct message
	if (message.channel.type === 'dm') return;

	// check if something written in portal channels
	portal_channel_handler(message)
		.then(r => {
			if (!r) {
				// ranking system
				ranking_system(message);

				anti_spam.message(message);

				// const spam = isSpam(message.content);
				// if (spam.length > 0) {
				// 	message.react('🚩');
				// 	message.author
				// 		.send(`try not to spam`)
				// 		.catch(console.error);
				// }

				// profanity check
				const profanities = isProfane(message.content);
				if (profanities.length > 0) {
					message.react('🚩');
					message.author
						.send(`try not to use profanities (${profanities.join(',')})`)
						.catch(console.error);
				}

				// Ignore any message that does not start with prefix
				if (message.content.indexOf(config.prefix) !== 0) return;

				// Separate function name, and arguments of function
				const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

				const cmd_only = args.shift();
				if (!cmd_only) return;

				const cmd = cmd_only.toLowerCase();

				let path_to_command: string = '';
				let command_options: CommandOptions | undefined;
				let type: string = 'none';

				const is_portal_command = command_config_json.some(category => {
					command_options = category.commands.find(command => command.name === cmd);
					if (command_options) {
						type = command_options.range;
						path_to_command = category.path;
						return true;
					}
					return false;
				});

				// is not a portal command
				if (!is_portal_command) {
					return false;
				}

				if (!command_options) {
					message_reply(false, message.channel, message, message.author,
						'could not get command option', undefined, client);
					return false;
				}

				if (!message) {
					return false;
				}

				if (!message.guild) {
					message_reply(false, message.channel, message, message.author,
						'could not fetch guild of message', undefined, client);
					return false;
				}

				fetch_guild(message.guild.id)
					.then(guild_object => {
						if (!guild_object) {
							message_reply(false, message.channel, message, message.author,
								'server is not in database, please contact portal support', undefined, client);
							return false;
						}

						if (guild_object.member_list.some(m => m.ignored))
							return;

						if (!command_options) {
							message_reply(false, message.channel, message, message.author,
								'could not get command option', guild_object, client);
							return false;
						}

						if (command_options.premium && !guild_object.premium) {
							message_reply(false, message.channel, message, message.author,
								'server is not premium', guild_object, client);
							return false;
						}

						if (command_options.auth && message.member) {
							if (!is_authorised(guild_object, message.member)) {
								message_reply(false, message.channel, message, message.author,
									'you are not authorised to use this command', guild_object, client);
								return false;
							}
						}

						command_loader(message, cmd, args, type, command_options, path_to_command, guild_object);
					})
					.catch(error => {
						console.log('could not fetch guild list' + error);
						return false;
					});
			}
			return;
		})
		.catch(e => {
			return;
		});
});

function command_loader(
	message: Message, cmd: string, args: string[], type: string, command_options: CommandOptions,
	path_to_command: string, guild_object: GuildPrtl
): boolean {
	if (type === 'none' && command_options.time === 0) {
		require(`./commands/${path_to_command}/${cmd}.js`)(message, args, guild_object, client)
			.then((response: ReturnPormise) => {
				if (response)
					if (command_options && response.value && response.value !== '' && (command_options.reply || response.result === false))
						message_reply(
							response.result, message.channel, message, message.author, response.value,
							guild_object, client, command_options ? command_options.auto_delete : true
						);
			});
		return true;
	}

	const active = active_cooldowns[type === 'guild' ? 'guild' : 'member'].find(active_current => {
		if (active_current.command === cmd) {
			if (type === 'member' && active_current.member === message.author.id)
				return true;
			if (type === 'guild')
				return true;
		}
		return false;
	});

	if (active) {
		const time = time_elapsed(active.timestamp, command_options.time);
		const type_for_msg = (type === 'member')
			? '.*'
			: `, as it was used again in* **${message.guild?.name}**`;

		message_reply(false, message.channel, message, message.author,
			`you need to wait **${pad(time.remaining_min)}:` +
			`${pad(time.remaining_sec)}/${pad(time.timeout_min)}:` +
			`${pad(time.timeout_sec)}** *to use* **${cmd}** *again${type_for_msg}`,
			guild_object, client);

		return false;
	}

	require(`./commands/${path_to_command}/${cmd}.js`)(message, args, guild_object, client, dispatchers)
		.then((response: ReturnPormise) => {
			if (response) {
				active_cooldowns[type === 'guild' ? 'guild' : 'member'].push({
					member: message.author.id,
					command: cmd,
					timestamp: Date.now()
				});

				if (command_options) {
					setTimeout(() => {
						active_cooldowns[type === 'guild' ? 'guild' : 'member'] =
							active_cooldowns[type === 'guild' ? 'guild' : 'member']
								.filter(active => active.command !== cmd);
					}, command_options.time * 60 * 1000);
				}
			}

			if (command_options && response.value && response.value !== '' && (command_options.reply || response.result === false))
				message_reply(
					response.result, message.channel, message, message.author, response.value,
					guild_object, client, command_options.auto_delete
				);
		});

	return false;
}

function event_loader(event: string, args: any): void {
	console.log(`├─ event-${event}`);
	require(`./events/${event}.js`)(args)
		.then((response: ReturnPormise) => {
			if (event === 'messageReactionAdd' && response && response.result === true) {
				const messageReaction = <MessageReaction>args.messageReaction;
				if (messageReaction && messageReaction.message && messageReaction.message.guild) {
					fetch_guild(messageReaction.message.guild.id)
						.then(guild_object => {
							if (guild_object) {
								if (messageReaction.message.channel.id === guild_object.music_data.channel_id) {
									const music_channel: TextChannel = args.messageReaction.message.guild.channels.cache
										.find((channel: TextChannel) => channel.id === guild_object.music_data.channel_id);

									music_channel
										.send(`${args.user}, ${response.value}`)
										.then(msg => { msg.delete({ timeout: 5000 }); })
										.catch(error => console.log(error));
								}
							}
						});
				}
			}

			const shouldReply = event_config_json.find(e => e.name === event);
			if (((config.debug || (shouldReply && shouldReply.reply)) && response) || response.result === false) {
				const colour = response.result ? '\x1b[32m' : '\x1b[31m';
				const reset = '\x1b[0m';
				const value_arr = response.value.split('\n');
				console.log(value_arr.map((s, i) => `${colour}├── ${s}${reset}`).join('\n'));
			}
		});
};

async function portal_channel_handler(
	message: Message
): Promise<boolean> {
	return new Promise((resolve) => {
		if (!message.guild) {
			return false;
		}

		fetch_guild(message.guild.id)
			.then(guild_object => {
				if (!guild_object)
					return resolve(true);

				if (included_in_ignore_list(message.channel.id, guild_object)) {
					if (message.content === './ignore') {
						remove_ignore(guild_object.id, message.channel.id)
							.then(r => {
								message_reply(true, message.channel, message, message.author,
									r ? 'successfully removed from ignored channels' : 'failed to remove from ignored channels',
									guild_object, client);
							})
							.catch(e => {
								message_reply(false, message.channel, message, message.author,
									'failed to remove from ignored channels', guild_object, client);
							});
					}

					return resolve(true);
				}
				else if (included_in_url_list(message.channel.id, guild_object)) {
					if (message.content === './url') {
						remove_url(guild_object.id, message.channel.id)
							.then(r => {
								message_reply(true, message.channel, message, message.author,
									r ? 'successfully removed url channel' : 'failed to remove url channel',
									guild_object, client);
							})
							.catch(e => {
								message_reply(false, message.channel, message, message.author,
									'failed to remove url channel', guild_object, client);
							});
					}
					else if (is_url(message.content)) {
						client_talk(client, guild_object, 'url');
					}
					else {
						client_talk(client, guild_object, 'read_only');
						message_reply(false, message.channel, message, message.author,
							'url-only channel', guild_object, client);
						message.delete();
					}

					return resolve(true);
				}
				else if (guild_object.music_data.channel_id === message.channel.id) {
					if (message.content === './music') {
						if (!message.guild) {
							return resolve(true);
						}

						const dispatcher_object = dispatchers.find(d => d.id === guild_object.id)
						const dispatcher = dispatcher_object ? dispatcher_object.dispatcher : undefined;

						stop(guild_object, message.guild, dispatcher);

						const music_data = new MusicData('null', 'null', []);
						set_music_data(guild_object.id, music_data)
							.then(r => {
								message_reply(true, message.channel, message, message.author,
									r ? 'successfully removed music channel' : 'failed to remove music channel',
									guild_object, client);
							})
							.catch(e => {
								message_reply(false, message.channel, message, message.author,
									'failed to remove music channel', guild_object, client);
							});
					} else {
						start(client, message, message.content, guild_object, dispatchers)
							.then(joined => {
								// will be replaces by information tab in message
								message_reply(
									joined.result, message.channel, message,
									message.author, joined.value, guild_object, client, true
								);
								message.delete();
							})
							.catch(error => {
								// will be replaces by information tab in message
								message_reply(
									false, message.channel, message,
									message.author, error, guild_object, client, true
								);
							});
					}

					return resolve(true);
				}

				return resolve(false);
			});
	});
}

function ranking_system(message: Message): void {
	if (!message.guild) return;
	fetch_guild(message.guild.id)
		.then(guild_object => {
			if (guild_object) {
				const level = add_points_message(message, guild_object);
				if (level)
					message_reply(true, message.channel, message, message.author,
						`you reached level ${level}!`, guild_object, client);
			}
		});
}

function log_portal() {
	client.login(config.token)
		.then(r => console.log('r :>> ', r))
		.catch(e => console.log('e :>> ', e))
}

log_portal();

exports.client = client;
exports.log_portal = log_portal;
