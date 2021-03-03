import { Channel, Client, Guild, GuildMember, Intents, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialUser, Presence, User, VoiceState } from "discord.js";
import mongoose from 'mongoose'; // we want to load an object not only functions
import command_config_json from './config.command.json';
import event_config_json from './config.event.json';
import config from './config.json';
import { included_in_ignore_list, included_in_url_list } from './libraries/guildOps';
import { is_authorised, is_url, message_reply, pad, time_elapsed } from './libraries/helpOps';
import { client_talk } from './libraries/localisationOps';
import { isProfane } from "./libraries/modOps";
import { fetch_guild, fetch_guild_authenticate, remove_ignore, remove_url, set_music_data } from "./libraries/mongoOps";
import { start } from './libraries/musicOps';
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
	.then(r => {
		console.log('> connected to the database');
	}).catch(e => {
		console.log('> unable to connect to database: ', e);
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
		'channel': channel
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
		'user': user
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
client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
	const new_channel = newState.channel; // join channel
	const old_channel = oldState.channel; // left channel

	if ((old_channel && new_channel) &&
		(new_channel.id === old_channel.id)) {
		return;
	}

	event_loader('voiceStateUpdate', {
		'client': client,
		'oldState': oldState,
		'newState': newState
	});
});

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
	portal_channel_handler(message, client)
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
				// const profanities = isProfane(message.content);
				// if (profanities.length > 0) {
				// 	message.react('🚩');
				// 	message.author
				// 		.send(`try not to use profanities (${profanities.join(',')})`)
				// 		.catch(console.error);
				// }

				if (!message) {
					return false;
				}

				if (!message.guild) {
					message_reply(false, message, message.author, 'could not fetch guild of message');
					return false;
				}

				if (!message.member) {
					message_reply(false, message, message.author, 'could not fetch member of message');
					return false;
				}

				fetch_guild_authenticate(message.guild.id, message.member.id)
					.then(authenticate => {
						if (!authenticate) {
							message_reply(false, message, message.author, 'server is not in database, please contact portal support');
							return false;
						}

						if (authenticate.member_list.length > 0 && authenticate.member_list[0].ignored) {
							return false;
						}

						// Ignore any message that does not start with prefix
						if (message.content.indexOf(authenticate.prefix) !== 0) {
							if (message.content === 'prefix') {
								message_reply(true, message, message.author,
									`portal's prefix is \`${authenticate.prefix}\``, false);
								if (message.deletable) {
									message.delete();
								}
							}
							return false;
						}

						// Separate command name and arguments
						const args = message.content.slice(authenticate.prefix.length).trim().split(/ +/g);

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
							message_reply(false, message, message.author,
								'could not get command option');
							return false;
						}

						// if (command_options.premium && !guild_object.premium) {
						// 	message_reply(false, message.channel, message, message.author,
						// 		'server is not premium', client);
						// 	return false;
						// }

						if (command_options.auth && message.member) {
							if (!is_authorised(authenticate.member_list, authenticate.auth_role, message.member)) {
								message_reply(false, message, message.author, 'you are not authorised to use this command');
								return false;
							}
						}

						if (!message.guild) {
							message_reply(false, message, message.author,
								'could not fetch guild from message');
							return false;
						}

						fetch_guild(message.guild.id)
							.then(guild_object => {
								if (!guild_object) {
									message_reply(false, message, message.author,
										'server is not in database, please contact portal support');
									return false;
								}

								if (!command_options) {
									message_reply(false, message, message.author,
										'could not get command option');
									return false;
								}

								command_loader(message, cmd, args, type, command_options, path_to_command, guild_object);
							})
							.catch(e => {
								message_reply(false, message, message.author,
									`could not get guild from message (${e})`);
								return false;
							});
					})
					.catch(e => {
						message_reply(false, message, message.author,
							`could not get authentication data from message (${e})`);
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
	if (config.debug === true) {
		console.log(`├─ cmd (${cmd})`);
	}

	if (type === 'none' && command_options.time === 0) {
		require(`./commands/${path_to_command}/${cmd}.js`)(message, args, guild_object, client)
			.then((response: ReturnPormise) => {
				if (response) {
					if ((command_options && response.value && response.value !== '') &&
						(command_options.reply || response.result === false)) {
						message_reply(
							response.result, message, message.author, response.value,
							command_options ? command_options.auto_delete : true
						);
					}
				}
			});
		return true;
	}

	const active = active_cooldowns[type === 'guild' ? 'guild' : 'member']
		.find(active_current => {
			if (active_current.command === cmd) {
				if (type === 'member' && active_current.member === message.author.id) {
					return true;
				}
				if (type === 'guild') {
					return true;
				}
			}
			return false;
		});

	if (active) {
		const time = time_elapsed(active.timestamp, command_options.time);
		const type_for_msg = (type === 'member')
			? '.*'
			: `, as it was used again in* **${message.guild?.name}**`;

		message_reply(false, message, message.author,
			`you need to wait **${pad(time.remaining_min)}:` +
			`${pad(time.remaining_sec)}/${pad(time.timeout_min)}:` +
			`${pad(time.timeout_sec)}** *to use* **${cmd}** *again${type_for_msg}`);

		return false;
	}

	require(`./commands/${path_to_command}/${cmd}.js`)(message, args, guild_object, client)
		.then((response: ReturnPormise) => {
			if (response && response.result) {
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
				message_reply(response.result, message, message.author, response.value, command_options.auto_delete);
		});

	return false;
}

function event_loader(event: string, args: any): void {
	if (event === 'presenceUpdate') {
		return;
	}

	if (config.debug === true) {
		console.log(`├─ event (${event})`);
	}

	require(`./events/${event}.js`)(args)
		.then((response: ReturnPormise) => {
			// if (event === 'messageReactionAdd' && response && response.result === true) {
			// 	const messageReaction = <MessageReaction>args.messageReaction;
			// 	if (messageReaction && messageReaction.message && messageReaction.message.guild) {
			// 		fetch_guild(messageReaction.message.guild.id)
			// 			.then(guild_object => {
			// 				if (guild_object) {
			// 					if (messageReaction.message.channel.id === guild_object.music_data.channel_id) {
			// 						const music_channel: TextChannel = args.messageReaction.message.guild.channels.cache
			// 							.find((channel: TextChannel) => channel.id === guild_object.music_data.channel_id);

			// 						music_channel
			// 							.send(`${args.user}, ${response.value}`)
			// 							.then(msg => { msg.delete({ timeout: 5000 }); })
			// 							.catch(error => console.log(error));
			// 					}
			// 				}
			// 			});
			// 	}
			// }

			const shouldReply = event_config_json.find(e => e.name === event);
			if ((config.debug) || (shouldReply && shouldReply.reply) &&
				(response && response.result === false)
			) {
				const colour = response.result ? '\x1b[32m' : '\x1b[31m';
				const reset = '\x1b[0m';

				if (response.value === '') {
					console.log(`${colour}├── (empty)${reset}`);
				} else {
					const value_arr = response.value.split('\n') ? response.value.split('\n') : [];
					console.log(value_arr.map((s, i) => `${colour}├── ${s}${reset}`).join('\n'));
				}
			}
		});
};

async function portal_channel_handler(
	message: Message, client: Client
): Promise<boolean> {
	return new Promise((resolve) => {
		if (!message.guild) {
			return false;
		}

		fetch_guild(message.guild.id)
			.then(guild_object => {
				if (!guild_object) {
					return resolve(true);
				}

				if (included_in_ignore_list(message.channel.id, guild_object)) {
					if (message.content === './ignore') {
						remove_ignore(guild_object.id, message.channel.id)
							.then(r => {
								const reply_message = r ? 'successfully removed from ignored channels'
									: 'failed to remove from ignored channels'
								message_reply(true, message, message.author,
									reply_message);
							})
							.catch(e => {
								message_reply(false, message, message.author,
									'failed to remove from ignored channels');
							});
					}

					return resolve(true);
				}
				else if (included_in_url_list(message.channel.id, guild_object)) {
					if (message.content === './url') {
						remove_url(guild_object.id, message.channel.id)
							.then(r => {
								message_reply(true, message, message.author,
									r ? 'successfully removed url channel' : 'failed to remove url channel');
							})
							.catch(e => {
								message_reply(false, message, message.author,
									'failed to remove url channel');
							});
					}
					else if (is_url(message.content)) {
						client_talk(client, guild_object, 'url');
					}
					else {
						// client_talk(client, guild_object, 'read_only');
						message.author
							.send(`${message.channel} is a url-only channel`)
							.catch(console.error);
						if (message.deletable) {
							message.delete();
						}
					}

					return resolve(true);
				}
				else if (guild_object.music_data.channel_id === message.channel.id) {
					if (message.content === './music') {
						if (!message.guild) {
							return resolve(true);
						}
						const voice_connection = client.voice?.connections.find(c =>
							c.channel.guild.id === message.guild?.id);

						const music_data = new MusicData('null', 'null', []);
						set_music_data(guild_object.id, music_data)
							.then(r => {
								message_reply(true, message, message.author,
									r
										? 'successfully removed music channel'
										: 'failed to remove music channel');
							})
							.catch(e => {
								message_reply(false, message, message.author,
									'failed to remove music channel');
							});
					} else {
						const voice_connection = client.voice?.connections.find(c =>
							c.channel.guild.id === message.guild?.id);

						if (!message.guild || !message.member) {
							if (message.deletable) {
								message.delete();
							}
							return resolve(false);
						}

						start(voice_connection, client, message.member.user, message.guild, guild_object, message.content)
							.then(joined => {
								// message_reply(
								// 	joined.result, message,
								// 	message.author, joined.value, guild_object, true
								// );

								if (message.deletable) {
									message.delete();
								}
							})
							.catch(error => {
								// message_reply(
								// 	false, message,
								// 	message.author, error, guild_object, true
								// );

								if (message.deletable) {
									message.delete();
								}
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
				if (level) {
					message_reply(true, message, message.author, `you reached level ${level}!`);
				}
			}
		})
		.catch(e => {
			message_reply(true, message, message.author, 'an error occured while accesing data');
		});
}

function log_portal() {
	client.login(config.token)
		.then(r => {
			console.log(`> logged into discord (${r})`)
		})
		.catch(e => {
			console.log(`> could not login to discord (${e})`)
			process.exit(1);
		});
}

log_portal();

exports.client = client;
exports.log_portal = log_portal;
