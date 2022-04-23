import { CacheFactory, Channel, Client, ClientOptions, Guild, GuildMember, Intents, Message, MessageReaction, Options, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from "discord.js";
import dotenv from 'dotenv';
import mongoose from "mongoose";
import { transports } from "winston";
import command_config_json from './config.command.json';
import { included_in_ignore_list, is_url_only_channel } from './libraries/guild.library';
import { isMessageDeleted, isUserAuthorised, isUserIgnored, logger, markMessageAsDeleted, messageReply as messageReply, pad, timeElapsed } from './libraries/help.library';
import { messageSpamCheck } from "./libraries/mod.library";
import { fetch_guild_predata, fetch_guild_rest, insert_member, remove_ignore, remove_url, set_music_data } from "./libraries/mongo.library";
// import { start } from './libraries/music.library';
import { add_points_message } from './libraries/user.library';
import { GuildPrtl, MusicData } from './types/classes/GuildPrtl.class';
import { ActiveCooldowns, CommandOptions, ReturnPormise, SpamCache } from "./types/classes/TypesPrtl.interface";

dotenv.config();

if (!process.env.MONGO_URL) {
	process.exit(3);
}

if (process.env.DEBUG) {
	logger.add(new transports.Console());
}

if (process.env.LOG) {
	logger.add(new transports.File({ filename: '/logs/portal-error.log.json', level: 'error' }));
	logger.add(new transports.File({ filename: '/logs/portal-info.log.json', level: 'info' }));
	logger.add(new transports.File({ filename: '/logs/portal-all.log.json' }));
}

const active_cooldowns: ActiveCooldowns = {
	guild: [],
	member: []
};

const spam_cache: SpamCache[] = [];

mongoose.connection.on('connecting', () => {
	console.log('[mongoose] connecting to mongo');
});

mongoose.connection.on('connected', () => {
	console.log('[mongoose] connected to mongo');
});

const connectOptions = {
	dbName: 'portal',
	autoCreate: false,
	connectTimeoutMS: 5000,
	compressors: 'zlib'
}

mongoose.connect(process.env.MONGO_URL, connectOptions)
	.catch((e: any) => {
		logger.error(new Error(`unable to connect to database / ${e}`));
		process.exit(2);
	});

const cacheFactory: CacheFactory = Options.cacheWithLimits({ MessageManager: 200 });
const intents = new Intents(32767);

const clientOptions: ClientOptions = {
	makeCache: cacheFactory,
	partials: [
		'USER',
		'CHANNEL',
		'GUILD_MEMBER',
		'MESSAGE',
		'REACTION'
	],
	intents: intents
}

const client = new Client(clientOptions);

// runs on every single message received, from any channel or DM
client.on('messageCreate', async (message: Message) => {
	``
	if (!message || !message.member || !message.guild) return;
	if (message.channel.type === 'DM' || message.author.bot) return;

	fetch_guild_predata(message.guild.id, message.author.id)
		.then(async guild_object => {
			if (!guild_object) {
				logger.error(new Error(`guild does not exist in Portal`));
				return false;
			}

			if (guild_object.member_list.length === 0 && message.guild) {
				insert_member(message.guild.id, message.author.id)
					.then(() => {
						if (message.guild) {
							logger.info(`late-insert ${message.author.id} to ${message.guild.name} [${message.guild.id}]`);
						}
					})
					.catch(e => {
						logger.error(new Error(`failed to late-insert member / ${e}`));
					});

				return true;
			}

			if (await portalPreprocessor(message, guild_object)) {
				// preprocessor has handled the message
				messageSpamCheck(message, guild_object, spam_cache);

				return true;
			} else {
				messageSpamCheck(message, guild_object, spam_cache);

				// Ignore any message that does not start with prefix
				if (message.content.indexOf(guild_object.prefix) !== 0) {
					if (message.content === 'prefix') {
						messageReply(true, message, `portal's prefix is \`${guild_object.prefix}\``)
							.catch((e: any) => {
								logger.error(new Error(`failed to send message / ${e}`));
							});

						if (isMessageDeleted(message)) {
							const deletedMessage = await message
								.delete()
								.catch((e: any) => {
									logger.error(new Error(`failed to delete message / ${e}`));
								});

							if (deletedMessage) {
								markMessageAsDeleted(deletedMessage);
							}
						}
					}

					return false;
				}

				const command = command_decypher(message, guild_object);

				if (!command.command_options) {
					return false;
				}

				if (command.command_options.auth && message.member) {
					if (!isUserAuthorised(message.member)) {
						messageReply(false, message, 'you are not authorised to use this command', true, true)
							.catch((e: any) => {
								logger.error(new Error(`failed to send message / ${e}`));
							});


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
							messageReply(false, message, 'server is not in database')
								.catch((e: any) => {
									logger.error(new Error(`failed to send message / ${e}`));
								});

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

						commandLoader(
							message,
							command.cmd,
							command.args,
							command.type,
							command.command_options,
							command.path_to_command,
							guild_object
						).catch();
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

async function commandLoader(
	message: Message, command: string, args: string[], type: string, command_options: CommandOptions,
	path_to_command: string, guild_object: GuildPrtl
): Promise<void> {
	if (process.env.DEBUG!) {
		logger.info(`[command-debug] ${command}`);
	}

	if (type === 'none' && command_options.time === 0) {
		const commandReturn: ReturnPormise = await require(`./commands/${path_to_command}/${command}.js`)(message, args, guild_object, client)
			.catch((e: string) => {
				messageReply(false, message, e, command_options.delete.source, command_options.delete.reply)
					.catch((e: any) => logger.error(new Error('failed to send message')));
			});

		if (commandReturn) {
			messageReply(commandReturn.result, message, commandReturn.value, command_options.delete.source, command_options.delete.reply)
				.catch((e: any) => logger.error(new Error('failed to send message')));
		}

		return;
	}

	const type_string = type === 'guild' ? 'guild' : 'member';

	const active = active_cooldowns[type_string]
		.find(active_current => {
			if (active_current.command === command) {
				if (type === 'member' && active_current.member === message.author.id) {
					if (message.guild && active_current.guild === message.guild.id) {
						return true;
					}
				}

				if (type === 'guild') {
					if (message.guild && active_current.guild === message.guild.id) {
						return true;
					}
				}
			}

			return false;
		});

	if (active) {
		const time = timeElapsed(active.timestamp, command_options.time);

		const type_for_msg = (type !== 'member')
			? `, as it was used again in* **${message.guild?.name}**`
			: `.*`;

		const must_wait_msg = `you need to wait **${pad(time.remaining_min)}:` +
			`${pad(time.remaining_sec)}/${pad(time.timeout_min)}:` +
			`${pad(time.timeout_sec)}** *to use* **${command}** *again${type_for_msg}`;

		messageReply(false, message, must_wait_msg, true, true)
			.catch((e: any) => logger.error(new Error(`failed to reply to message / ${e}`)));

		return;
	}

	const commandReturn: ReturnPormise = await require(`./commands/${path_to_command}/${command}.js`)(message, args, guild_object, client)
		.catch((e: any) => logger.error(new Error(`in ${command} got error ${e}`)));

	if (commandReturn) {
		if (commandReturn.result) {
			if (message.guild) {
				active_cooldowns[type_string]
					.push({
						member: message.author.id,
						guild: message.guild.id,
						command: command,
						timestamp: Date.now()
					});

				if (command_options) {
					setTimeout(() => {
						active_cooldowns[type_string] = active_cooldowns[type_string]
							.filter(active => active.command !== command);
					}, command_options.time * 60 * 1000);
				}
			}
		}

		messageReply(commandReturn.result, message, commandReturn.value,
			command_options.delete.source, command_options.delete.reply)
			.catch(e => {
				logger.error(new Error(`in ${command} got error ${e}`));
			});
	} else {
		logger.error(new Error(`did not get response from command: ${command}`));
	}
}

/*
* Returns: true/false if processing must continue
*/
async function portalPreprocessor(
	message: Message, guild_object: GuildPrtl
): Promise<boolean> {
	if (!message.member) {
		logger.error(new Error('could not get member'));
		return true;
	}

	if (isUserIgnored(message.member)) {
		if (!handle_url_channels(message, guild_object)) {
			if (guild_object.music_data.channel_id === message.channel.id) {
				message.member
					.send('you can\'t play music when ignored')
					.catch((e: any) => {
						logger.error(new Error(`failed to send message / ${e}`));
					});

				if (isMessageDeleted(message)) {
					const deletedMessage = await message
						.delete()
						.catch((e: any) => {
							logger.error(new Error(`failed to delete message / ${e}`));
						});

					if (deletedMessage) {
						markMessageAsDeleted(deletedMessage);
					}
				}
			}
		}

		return true;
	} else {
		if (await handle_url_channels(message, guild_object)) {
			return true;
		}
		else if (handle_ignored_channels(message, guild_object)) {
			handleRankingSystem(message, guild_object);
			return true;
		}
		else if (handleMusicChannels(message, guild_object)) {
			handleRankingSystem(message, guild_object);
			return true;
		} else {
			handleRankingSystem(message, guild_object);

			// if (guild_object.profanity_level !== ProfanityLevelEnum.none) {
			// 	// profanity check
			// 	const profanities = isProfane(message.content, guild_object.profanity_level);
			// 	if (profanities.length > 0) {
			// 		message
			// 			.react('🚩')
			// 			.catch((e: any) => {
			// 				logger.error(new Error(`failed to react message / ${e}`));
			// 			});

			// 		message.author
			// 			.send(`try not to use profanities (${profanities.join(',')})`)
			// 			.catch(e => {
			// 				logger.error(new Error(e));
			// 			});
			// 	}
			// }

			return false;
		}
	}
}

function handleRankingSystem(
	message: Message, guild_object: GuildPrtl
): void {
	add_points_message(message, guild_object.member_list[0], guild_object.rank_speed)
		.then(level => {
			if (level) {
				messageReply(true, message, `you reached level ${level}!`)
					.catch((e: any) => {
						logger.error(new Error(`failed to send message / ${e}`));
					});
			}
		})
		.catch(e => {
			logger.error(new Error(e));
		});
}

async function handle_url_channels(
	message: Message, guild_object: GuildPrtl
): Promise<boolean> {
	if (is_url_only_channel(message.channel.id, guild_object)) {
		if (message.content === './url') {
			remove_url(guild_object.id, message.channel.id)
				.then(r => {
					messageReply(true, message, `removed url channel ${r ? 'successfully' : 'unsuccessfully'}`)
						.catch((e: any) => {
							logger.error(new Error(`failed to send message / ${e}`));
						});
				})
				.catch(e => {
					logger.error(new Error(`failed to remove url channel / ${e}`));
				});
		}
		else {
			message.author
				.send(`${message.channel} is a url-only channel`)
				.catch(e => {
					logger.error(new Error(`failed to remove url channel / ${e}`));
				});

			if (isMessageDeleted(message)) {
				const deletedMessage = await message
					.delete()
					.catch((e: any) => {
						logger.error(new Error(`failed to delete message / ${e}`));
					});

				if (deletedMessage) {
					markMessageAsDeleted(deletedMessage);
				}
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
					messageReply(true, message, `removed from ignored channels ${r ? 'successfully' : 'unsuccessfully'}`)
						.catch((e: any) => {
							logger.error(new Error(`failed to send message / ${e}`));
						});
				})
				.catch(e => {
					logger.error(new Error(`failed to remove ignored channel / ${e}`));
				});
		}

		return true;
	}

	return false;
}

function handleMusicChannels(
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
					messageReply(true, message, `removed from ignored channels ${r ? 'successfully' : 'unsuccessfully'}`)
						.catch((e: any) => logger.error(new Error(`failed to send message / ${e}`)));
				})
				.catch(e => logger.error(new Error(`failed to remove music channel / ${e}`)));
		} else {
			// if (!message.guild || !message.member) {
			// 	if (message.deletable) {
			// 		message
			// 			.delete()
			// 			.catch((e: any) => logger.error(new Error(`failed to delete message / ${e}`)));
			// 	}

			// 	return false;
			// }

			// const portal_voice_connection = client.voice?.connections
			// 	.find(c => c.channel.guild.id === message.guild?.id);

			// if (portal_voice_connection) {
			// 	if (!portal_voice_connection.channel.members.has(message.member.id)) {
			// 		if (message.guild) {
			// 			const portal_voice_connection = client.voice?.connections
			// 				.find(c => c.channel.guild.id === message.guild?.id);

			// 			const animate = portal_voice_connection?.dispatcher
			// 				? !portal_voice_connection?.dispatcher.paused
			// 				: false;

			// 			update_music_message(
			// 				message.guild,
			// 				guild_object,
			// 				guild_object.music_queue.length > 0
			// 					? guild_object.music_queue[0]
			// 					: undefined,
			// 				'you must be in the same channel as Portal',
			// 				animate
			// 			).catch(e => {
			// 				logger.error(new Error(e));
			// 			});
			// 		}

			// 		if (message.deletable) {
			// 			message
			// 				.delete()
			// 				.catch((e: any) => {
			// 					logger.error(new Error(`failed to send message / ${e}`));
			// 				});
			// 		}

			// 		return false;
			// 	}
			// }

			// start(
			// 	voice_connection, client, message.member.user, message,
			// 	message.guild, guild_object, message.content
			// )
			// 	.then(r => {
			// 		if (message.guild) {
			// 			const portal_voice_connection = client.voice?.connections
			// 				.find(c => c.channel.guild.id === message.guild?.id);

			// 			const animate = portal_voice_connection?.dispatcher
			// 				? !portal_voice_connection?.dispatcher.paused
			// 				: false;

			// 			update_music_message(
			// 				message.guild,
			// 				guild_object,
			// 				guild_object.music_queue.length > 0
			// 					? guild_object.music_queue[0]
			// 					: undefined,
			// 				r,
			// 				animate
			// 			).catch(e => {
			// 				logger.error(new Error(e));
			// 			});
			// 		}

			// 		if (message.deletable) {
			// 			message
			// 				.delete()
			// 				.catch((e: any) => {
			// 					logger.error(new Error(`failed to send message / ${e}`));
			// 				});
			// 		}
			// 	})
			// 	.catch(e => {
			// 		if (message.guild) {
			// 			update_music_message(
			// 				message.guild,
			// 				guild_object,
			// 				guild_object.music_queue.length > 0
			// 					? guild_object.music_queue[0]
			// 					: undefined,
			// 				`error while starting playback / ${e}`
			// 			).catch(e => {
			// 				logger.error(new Error(e));
			// 			});
			// 		}

			// 		if (message.deletable) {
			// 			message
			// 				.delete()
			// 				.catch((e: any) => {
			// 					logger.error(new Error(`failed to send message / ${e}`));
			// 				});
			// 		}
			// 	});
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

	let path_to_command = '';
	let command_options: CommandOptions | undefined = undefined;
	let type = 'none';

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

function connect_to_discord() {
	client.login(process.env.TOKEN)
		.then(r => {
			logger.info(`login to discord successful / ${r}`);
		})
		.catch(e => {
			logger.error(new Error(`could not login to discord / ${e}`));
			process.exit(1);
		});
}

connect_to_discord();