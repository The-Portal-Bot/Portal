import { Channel, Client, Guild, GuildMember, Intents, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialUser, User, VoiceState } from "discord.js";
import mongoose from 'mongoose'; // we want to load an object not only functions
import { format, transports } from "winston";
import command_config_json from './config.command.json';
import event_config_json from './config.event.json';
import config from './config.json';
import { ProfanityLevelEnum } from "./data/enums/ProfanityLevel.enum";
import { included_in_ignore_list, is_url_only_channel } from './libraries/guild.library';
import { is_authorised, is_ignored, is_url, logger, message_reply, pad, time_elapsed, update_music_message } from './libraries/help.library';
import { client_talk } from './libraries/localisation.library';
import { isProfane } from "./libraries/mod.library";
import { fetch_guild_predata, fetch_guild_rest, remove_ignore, remove_url, set_music_data } from "./libraries/mongo.library";
import { start } from './libraries/music.library';
import { add_points_message } from './libraries/user.library';
import { GuildPrtl, MusicData } from './types/classes/GuildPrtl.class';
import { ActiveCooldowns, CommandOptions, ReturnPormise } from "./types/classes/TypesPrtl.interface";

if (config.debug) {
	logger.add(new transports.Console());
}

if (config.log) {
	logger.add(new transports.File({ filename: '/logs/portal-error.log.json', level: 'error' }));
	logger.add(new transports.File({ filename: '/logs/portal-info.log.json', level: 'info' }));
	logger.add(new transports.File({ filename: '/logs/portal-all.log.json' }));
}

// const AntiSpam = require('discord-anti-spam');

const active_cooldowns: ActiveCooldowns = { guild: [], member: [] };

// Connect to mongoose database
mongoose.connect(config.mongo_url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})
	.then(r => {
		logger.info(`connected to the database`);
	}).catch(e => {
		logger.error(new Error(`unable to connect to database | ${e}`));
		process.exit(1);
	});

// const anti_spam = new AntiSpam({
// 	warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
// 	kickThreshold: 50, // Amount of messages sent in a row that will cause a ban.
// 	banThreshold: 70, // Amount of messages sent in a row that will cause a ban.
// 	maxInterval: 2000, // Amount of time (in milliseconds) in which messages are considered spam.
// 	warnMessage: '{@user}, please stop spamming', // Message that will be sent in chat upon warning a user.
// 	kickMessage: '**{user_tag}** has been kicked for spamming', // Message that will be sent in chat upon kicking a user.
// 	banMessage: '**{user_tag}** has been banned for spamming', // Message that will be sent in chat upon banning a user.
// 	maxDuplicatesWarning: 7, // Amount of duplicate messages that trigger a warning.
// 	maxDuplicatesKick: 50, // Amount of duplicate messages that trigger a warning.
// 	maxDuplicatesBan: 70, // Amount of duplicate messages that trigger a warning.
// 	exemptPermissions: ['ADMINISTRATOR'], // Bypass users with any of these permissions. ('ADMINISTRATOR')
// 	ignoreBots: true, // Ignore bot messages.
// 	debug: false,
// 	verbose: true, // Extended Logs from module.
// 	ignoredUsers: [], // Array of User IDs that get ignored.
// });

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
			intents: // Intents.ALL
				[
					Intents.FLAGS.GUILDS,
					Intents.FLAGS.GUILD_MEMBERS,
					Intents.FLAGS.GUILD_VOICE_STATES,
					Intents.FLAGS.GUILD_PRESENCES,
					Intents.FLAGS.GUILD_MESSAGES,
					Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
					Intents.FLAGS.DIRECT_MESSAGES,
					Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
				]
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

	// mute / unmute  defean user are ignored
	if ((old_channel && new_channel) && (new_channel.id === old_channel.id)) {
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
	if (!message) return;
	if (!message.member) return;
	if (!message.guild) return;
	if (message.author.bot) return; // ignore bots 'botception'
	if (message.channel.type === 'dm') return; // ignore DMs

	fetch_guild_predata(message.guild.id, message.author.id)
		.then(guild_object => {
			if (!guild_object) {
				logger.error(new Error(`guild does not exist in Portal`));
				return false;
			}

			if (portal_preprocessor(message, guild_object)) {
				// preprocessor has handled the message
				return true;
			} else {
				// Ignore any message that does not start with prefix
				if (message.content.indexOf(guild_object.prefix) !== 0) {
					if (message.content === 'prefix') {
						message_reply(true, message, message.author,
							`portal's prefix is \`${guild_object.prefix}\``, false);

						if (message.deletable) {
							message.delete();
						}
					}

					return false;
				}

				let command = command_decypher(message, guild_object);

				if (!command.command_options) {
					return false;
				}

				if (command.command_options.auth && message.member) {
					if (!is_authorised(message.member)) {
						message_reply(false, message, message.author,
							'you are not authorised to use this command');

						return false;
					}
				}

				if (!message.guild) {
					logger.error(new Error('could not fetch guild of message'));

					return false;
				}

				fetch_guild_rest(message.guild.id)
					.then(guild_object_rest => {
						if (!guild_object_rest) {
							logger.error(new Error('server is not in database'));
							message_reply(false, message, message.author,
								'server is not in database, please contact portal support');

							return false;
						}

						guild_object.member_list = guild_object_rest.member_list;
						guild_object.poll_list = guild_object_rest.poll_list;
						guild_object.ranks = guild_object_rest.ranks;
						guild_object.music_queue = guild_object_rest.music_queue;
						guild_object.announcement = guild_object_rest.announcement;
						guild_object.locale = guild_object_rest.locale;
						guild_object.announce = guild_object_rest.announce;
						guild_object.premium = guild_object_rest.premium;

						if (!command.command_options) {
							return false;
						}

						command_loader(
							message,
							command.cmd,
							command.args,
							command.type,
							command.command_options,
							command.path_to_command,
							guild_object
						);
					})
					.catch(e => {
						logger.error(new Error(`error while fetch guild restdata / ${e}`));
						return false;
					});
			}
		})
		.catch(e => {
			logger.error(new Error(`error while fetch guild predata / ${e}`));
			return false;
		});
});

function command_loader(
	message: Message, command: string, args: string[], type: string, command_options: CommandOptions,
	path_to_command: string, guild_object: GuildPrtl
): boolean {
	if (config.debug === true) {
		logger.info(`DEBUG: [command] ${command}`);
	}

	if (type === 'none' && command_options.time === 0) {
		require(`./commands/${path_to_command}/${command}.js`)(message, args, guild_object, client)
			.then((response: ReturnPormise) => {
				if (response) {
					if ((command_options && response.value && response.value !== '') &&
						(command_options.reply || response.result === false)) {
						message_reply(
							response.result, message, message.author, response.value,
							command_options ? command_options.auto_delete : true
						);
					}
				} else {
					logger.error(new Error(`did not get response from command: ${command}`));
				}
			})
			.catch((e: any) => {
				logger.error(new Error(`error in ${command} / ${e}`));
			});

		return true;
	}

	const active = active_cooldowns[type === 'guild' ? 'guild' : 'member']
		.find(active_current => {
			if (active_current.command === command) {
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
			? `.*`
			: `, as it was used again in* **${message.guild?.name}**`;

		message_reply(false, message, message.author,
			`you need to wait **${pad(time.remaining_min)}:` +
			`${pad(time.remaining_sec)}/${pad(time.timeout_min)}:` +
			`${pad(time.timeout_sec)}** *to use* **${command}** *again${type_for_msg}`);

		return false;
	}

	require(`./commands/${path_to_command}/${command}.js`)(message, args, guild_object, client)
		.then((response: ReturnPormise) => {
			if (response) {
				if (response.result) {
					active_cooldowns[type === 'guild' ? 'guild' : 'member'].push({
						member: message.author.id,
						command: command,
						timestamp: Date.now()
					});

					if (command_options) {
						setTimeout(() => {
							active_cooldowns[type === 'guild' ? 'guild' : 'member'] =
								active_cooldowns[type === 'guild' ? 'guild' : 'member']
									.filter(active => active.command !== command);
						}, command_options.time * 60 * 1000);
					}
				}

				if ((command_options && response.value && response.value !== '') && (command_options.reply || response.result === false)) {
					message_reply(response.result, message, message.author, response.value, command_options.auto_delete);
				}
			} else {
				logger.error(new Error(`did not get response from command: ${command}`));
			}
		})
		.catch((e: any) => {
			logger.error(new Error(`in ${command} got error ${e}`));
		});

	return false;
}

function event_loader(event: string, args: any): void {
	require(`./events/${event}.event.js`)(args)
		.then((response: string) => {
			if (config.debug || (event_config_json.find(e => e.name === event))) {
				logger.info(`[event-accepted] ${event} | ${response ? response : 'nothing'}`);
			} else if (config.debug) {
				logger.info(`DEBUG: [event-accepted] ${event} | ${response ? response : 'nothing'}`);
			}
		})
		.catch((e: string) => {
			logger.error(`[event-rejected] ${event} | ${e}`);
		});
}

function connect_to_discord() {
	client.login(config.token)
		.then(r => {
			logger.info(`login to discord successful / ${r}`);
		})
		.catch(e => {
			logger.error(new Error(`could not login to discord / ${e}`));
			process.exit(1);
		});
}

connect_to_discord();

/*
* Returns: true/false if processing must continue
*/
function portal_preprocessor(
	message: Message, guild_object: GuildPrtl
): boolean {
	if (!message.member) {
		logger.error(new Error('could not get member'));
		return true;
	}

	if (is_ignored(message.member)) {
		if (!handle_url_channels(message, guild_object)) {
			// anti_spam.message(message);
			if (guild_object.music_data.channel_id === message.channel.id) {
				message.member.send('you can\'t play music when ignored');
				if (message.deletable) {
					message.delete();
				}
			}
		}

		return true;
	} else {
		if (handle_url_channels(message, guild_object)) {
			// anti_spam.message(message);

			return true;
		}
		else if (handle_ignored_channels(message, guild_object)) {
			handle_ranking_system(message, guild_object);
			// anti_spam.message(message);

			return true;
		}
		else if (handle_music_channels(message, guild_object)) {
			handle_ranking_system(message, guild_object);
			// anti_spam.message(message);

			return true;
		} else {
			handle_ranking_system(message, guild_object);
			// anti_spam.message(message);

			if (guild_object.profanity_level !== ProfanityLevelEnum.none) {
				// profanity check
				const profanities = isProfane(message.content, guild_object.profanity_level);
				if (profanities.length > 0) {
					message.react('🚩');
					message.author
						.send(`try not to use profanities (${profanities.join(',')})`)
						.catch(e => {
							logger.error(new Error(e));
						});
				}
			}

			return false;
		}
	}
}

function handle_ranking_system(
	message: Message, guild_object: GuildPrtl
): void {
	const level = add_points_message(
		message, guild_object.member_list[0], guild_object.rank_speed
	);

	// store to db

	if (level) {
		message_reply(true, message, message.author,
			`you reached level ${level}!`);
	}
}

function handle_url_channels(
	message: Message, guild_object: GuildPrtl
): boolean {
	if (is_url_only_channel(message.channel.id, guild_object)) {
		if (message.content === './url') {
			remove_url(guild_object.id, message.channel.id)
				.then(r => {
					message_reply(true, message, message.author,
						r
							? 'successfully removed url channel'
							: 'failed to remove url channel'
					);
				})
				.catch(e => {
					logger.error(new Error(`failed to remove url channel / ${e}`));
				});
		}
		else if (is_url(message.content)) {
			client_talk(client, guild_object, 'url');
		}
		else {
			// client_talk(client, guild_object, 'read_only');
			message.author
				.send(`${message.channel} is a url-only channel`)
				.catch(e => {
					logger.error(new Error(`failed to remove url channel: ${e}`));
				});
			if (message.deletable) {
				message.delete();
			}
		}

		return true;
	}

	return false;
}

function handle_ignored_channels(
	message: Message, guild_object: GuildPrtl
): boolean {
	if (included_in_ignore_list(message.channel.id, guild_object)) {
		if (message.content === './ignore') {
			remove_ignore(guild_object.id, message.channel.id)
				.then(r => {
					const reply_message = r
						? 'successfully removed from ignored channels'
						: 'failed to remove from ignored channels';

					message_reply(true, message, message.author, reply_message);
				})
				.catch(e => {
					logger.error(new Error(`failed to remove ignored channel / ${e}`));
				});
		}

		return true;
	}

	return false;
}

function handle_music_channels(
	message: Message, guild_object: GuildPrtl
): boolean {
	if (guild_object.music_data.channel_id === message.channel.id) {
		if (message.content === './music') {
			if (!message.guild) {
				logger.error(new Error(`failed to get guild from message`));
				return true;
			}

			const music_data = new MusicData('null', 'null', 'null', [], false);
			set_music_data(guild_object.id, music_data)
				.then(r => {
					message_reply(true, message, message.author,
						r
							? 'successfully removed music channel'
							: 'failed to remove music channel');
				})
				.catch(e => {
					logger.error(new Error(`failed to remove music channel / ${e}`));
				});
		} else {
			const voice_connection = client.voice
				? client.voice.connections.find(c =>
					c.channel.guild.id === message.guild?.id)
				: undefined;

			if (!message.guild || !message.member) {
				if (message.deletable) {
					message.delete();
				}

				return false;
			}

			const portal_voice_connection = client.voice?.connections
				.find(c => c.channel.guild.id === message.guild?.id);

			if (portal_voice_connection) {
				if (!portal_voice_connection.channel.members.has(message.member.id)) {
					if (message.guild) {
						const portal_voice_connection = client.voice?.connections
							.find(c => c.channel.guild.id === message.guild?.id);

						const animate = portal_voice_connection?.dispatcher
							? !portal_voice_connection?.dispatcher.paused
							: false;

						update_music_message(
							message.guild,
							guild_object,
							guild_object.music_queue.length > 0
								? guild_object.music_queue[0]
								: undefined,
							'you must be in the same channel as Portal',
							animate
						);
					}

					if (message.deletable) {
						message.delete();
					}

					return false;
				}
			}

			start(
				voice_connection, client, message.member.user, message,
				message.guild, guild_object, message.content
			)
				.then(r => {
					if (message.guild) {
						const portal_voice_connection = client.voice?.connections
							.find(c => c.channel.guild.id === message.guild?.id);

						const animate = portal_voice_connection?.dispatcher
							? !portal_voice_connection?.dispatcher.paused
							: false;

						update_music_message(
							message.guild,
							guild_object,
							guild_object.music_queue.length > 0
								? guild_object.music_queue[0]
								: undefined,
							r.value,
							animate
						);
					}

					if (message.deletable) {
						message.delete();
					}
				})
				.catch(e => {
					if (message.guild) {
						update_music_message(
							message.guild,
							guild_object,
							guild_object.music_queue.length > 0
								? guild_object.music_queue[0]
								: undefined,
							`error while starting playback`
						);
					}

					if (message.deletable) {
						message.delete();
					}

					logger.error(new Error(`error while starting playback / ${e}`));
				});
		}

		return true;
	}

	return false;
}

function command_decypher(
	message: Message, guild_object: GuildPrtl
): {
	args: string[],
	cmd: string,
	path_to_command: string,
	command_options: CommandOptions | undefined,
	type: string
} {
	// separate command name and arguments
	const args = message.content.slice(guild_object.prefix.length).trim().split(/ +/g);

	const cmd_only = args.shift();
	if (!cmd_only) {
		return {
			args: [],
			cmd: '',
			path_to_command: '',
			command_options: undefined,
			type: ''
		};
	}
	const cmd = cmd_only.toLowerCase();

	let path_to_command: string = '';
	let command_options: CommandOptions | undefined = undefined;
	let type: string = 'none';

	command_config_json.some(category => {
		command_options = category.commands.
			find(command => command.name === cmd);

		if (command_options) {
			type = command_options.range;
			path_to_command = category.path;

			return true;
		}

		return false;
	});

	return {
		args: args,
		cmd: cmd,
		path_to_command: path_to_command,
		command_options: command_options,
		type: type
	};
}