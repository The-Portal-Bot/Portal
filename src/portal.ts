// load up the discord.js library
import {
	Client, Guild, GuildChannel, GuildMember, Message, MessageReaction, PartialGuildMember,
	PartialMessage, PartialUser, Presence, TextChannel, User, VoiceState
} from "discord.js";
import { readFileSync } from "jsonfile";
import cooldown_list from './assets/jsons/cooldown_list.json';
import config from './config.json';
import { included_in_url_list } from './libraries/guildOps';
import {
	guildPrtl_to_object, is_authorised, is_url, message_reply, pad, time_elapsed,
	update_portal_managed_guilds
} from './libraries/helpOps';
import { client_talk } from './libraries/localizationOps';
import { isProfane } from "./libraries/modOps";
import { start } from './libraries/musicOps';
import { add_points_message } from './libraries/userOps';
import { GuildPrtl } from './types/classes/GuildPrtl';
import {
	ActiveCooldown, ActiveCooldowns, CommandOptions, ReturnPormise
} from "./types/interfaces/InterfacesPrtl";

const command_options_guild: CommandOptions[] = cooldown_list.guild;
const command_options_member: CommandOptions[] = cooldown_list.member;
const command_options_none: CommandOptions[] = cooldown_list.none;

const portal_managed_guilds_path = config.database_json;

const guild_list_json = readFileSync(config.database_json);
if (!guild_list_json) {
	console.log('could not read guild list');
	process.exit(1);
}
// list of all managed guilds
const guild_list: GuildPrtl[] = <GuildPrtl[]>guild_list_json;

if (guild_list === null) {
	console.log('guild json is corrupt');
	process.exit(1);
}

if (!Array.isArray(guild_list)) {
	console.log('guild_list must be an array');
	process.exit(1);
}

// guild_list.forEach(g => {
// 	console.log('g :>> ', g);
// 	if (!(g instanceof GuildPrtl)) {
// 		console.log('guild json is not GuildPrtl type');
// 		process.exit(1);
// 	}
// });

// this is the client the Portal Bot. Some people call it bot, some people call
// it 'self', client.user is actually the presence of portal bot in the server
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const active_cooldowns: ActiveCooldowns = { guild: [], member: [] };

// This event will run if the bot starts, and logs in, successfully.
client.on('ready', () =>
	event_loader('ready', {
		'client': client,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

// When bot connects to shard again ?
client.on('shardResume', (id: number) =>
	event_loader('shardResume', {
		'client': client,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path,
		'id': id
	})
);

// When bot connects to shard again ?
client.on('shardStart', (id: number) =>
	event_loader('shardStart', {
		'client': client,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path,
		'id': id
	})
);

// this event triggers when the bot is removed from a guild.
client.on('guildDelete', (guild: Guild) =>
	event_loader('guildDelete', {
		'guild': guild,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

// This event triggers when the bot joins a guild.
client.on('guildCreate', (guild: Guild) =>
	event_loader('guildCreate', {
		'client': client,
		'guild': guild,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

// This event triggers when the bot joins a guild.
client.on('channelDeleted', (channel: GuildChannel) =>
	event_loader('channelDelete', {
		'channel': channel,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path
	})
);

// This event triggers when a new member joins a guild.
client.on('guildMemberAdd', (member: GuildMember) =>
	event_loader('guildMemberAdd', {
		'member': member,
		'guild_list': guild_list
	})
);

// This event triggers when a new member leaves a guild.
client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) =>
	event_loader('guildMemberRemove', {
		'member': member,
		'guild_list': guild_list
	})
);

// This event triggers when the status of a guild member has changed
client.on('presenceUpdate', (oldPresence: Presence | undefined, newPresence: Presence | undefined) =>
	event_loader('presenceUpdate', {
		'client': client,
		'guild_list': guild_list,
		'newPresence': newPresence
	})
);

// This event triggers when a member reacts to a message
client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User | PartialUser) =>
	event_loader('messageReactionAdd', {
		'client': client,
		'guild_list': guild_list,
		'messageReaction': messageReaction,
		'user': user
	})
);

// This event triggers when a message is deleted
client.on('messageDelete', (message: Message | PartialMessage) =>
	event_loader('messageDelete', {
		'client': client,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path,
		'message': message
	})
);

// This event triggers when a member joins or leaves a voice channel
client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) =>
	event_loader('voiceStateUpdate', {
		'client': client,
		'guild_list': guild_list,
		'portal_managed_guilds_path': portal_managed_guilds_path,
		'oldState': oldState,
		'newState': newState
	})
);

// runs on every single message received, from any channel or DM
client.on('message', async (message: Message) => {
	// message has errors
	if (message === null) return;
	if (message.member === null) return;
	if (message.guild === null) return;

	// Ignore other bots and also itself ('botception')
	if (message.author.bot) return;

	// Ignore any direct message
	if (message.channel.type === 'dm') return;

	// check if something written in portal channels
	if (portal_channel_handler(message)) return;

	// ranking system
	ranking_system(message);

	// word check
	if (isProfane(message.content)) {
		message.react('🚩');
		message.author
			.send("try not to use profanities")
			.catch(console.error);
	}

	// Ignore any message that does not start with prefix
	if (message.content.indexOf(config.prefix) !== 0) return;

	// Separate function name, and arguments of function
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

	const cmd_only = args.shift();
	if (cmd_only === undefined) return;

	const cmd = cmd_only.toLowerCase();

	let command_options: CommandOptions | undefined;
	let type: string;
	let active_cooldown: ActiveCooldown[];

	if (command_options_guild.some(cmd_curr => cmd_curr.name === cmd)) {
		command_options = command_options_guild.find(cmd_curr => cmd_curr.name === cmd);
		active_cooldown = active_cooldowns.guild;
		type = 'guild';
	}
	else if (command_options_member.some(cmd_curr => cmd_curr.name === cmd)) {
		command_options = command_options_member.find(cmd_curr => cmd_curr.name === cmd);
		active_cooldown = active_cooldowns.member;
		type = 'member';
	}
	else if (command_options_none.some(cmd_curr => cmd_curr.name === cmd)) {
		command_options = command_options_none.find(cmd_curr => cmd_curr.name === cmd);
		active_cooldown = [];
		type = 'none';
	}
	else {
		return;
	}

	// not a portal command
	if (command_options === undefined) return;

	const guild_obejct = guildPrtl_to_object(guild_list, message.guild.id);
	if (!guild_obejct) {
		message_reply(false, message.channel, message, message.author,
			'this guild is not in database, please contact portal support', guild_list, client);
		return;
	}

	if (command_options.auth) {
		if (!is_authorised(guild_obejct, message.member)) {
			message_reply(false, message.channel, message, message.author,
				'you are not authorized to use this command', guild_list, client);
			return;
		}
	}

	if (command_options.premium && !guild_obejct.premium) {
		message_reply(false, message.channel, message, message.author,
			'this server is not premium', guild_list, client);
		return;
	}

	command_loader(message, cmd, args, type, command_options, active_cooldown);
});

function command_loader(
	message: Message, cmd: string, args: string[], type: string,
	command_options: CommandOptions, active_cooldown: ActiveCooldown[]
): boolean {
	if (type === 'none' && command_options.time === 0) {
		require(`./commands/${cmd}.js`)(client, message, args, guild_list, portal_managed_guilds_path)
			.then((response: ReturnPormise) => {
				message_reply(response.result, message.channel, message,
					message.author, response.value, guild_list, client, command_options ? command_options.auto_delete : true);
				if (command_options.save_after)
					update_portal_managed_guilds(portal_managed_guilds_path, guild_list);
			});
		return true;
	}

	const active = active_cooldown.find(active_current => {
		if (active_current.command === cmd) {
			if (type === 'member')
				if (active_current.member === message.author.id)
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
			`*you need to wait* **${pad(time.remaining_min)}:` +
			`${pad(time.remaining_sec)}/${pad(time.timeout_min)}:` +
			`${pad(time.timeout_sec)}** *to use* **${cmd}** *again${type_for_msg}`,
			guild_list, client);

		return false;
	}

	require(`./commands/${cmd}.js`)(client, message, args, guild_list, portal_managed_guilds_path)
		.then((response: ReturnPormise) => {
			if (response.result === true) {
				active_cooldown.push({
					member: message.author.id,
					command: cmd,
					timestamp: Date.now()
				});

				if (command_options !== undefined) {
					setTimeout(() => {
						active_cooldown = active_cooldown.filter(active => active.command !== cmd);
					}, command_options.time * 60 * 1000);
				}
			}
			if (command_options !== undefined) {
				message_reply(response.result, message.channel, message, message.author,
					response.value, guild_list, client, command_options.auto_delete);
			}
			if (command_options.save_after)
				update_portal_managed_guilds(portal_managed_guilds_path, guild_list);
		});

	return false;
}

function event_loader(event: string, args: any): void {
	// Ignore other bots and also itself ('botception')
	console.log(`event emitted: ${event}`);
	require(`./events/${event}.js`)(args)
		.then((response: ReturnPormise) => {
			if (response !== null && response !== undefined) {
				if (event === 'messageReactionAdd' && response) {
					// const messageReaction = <MessageReaction>args.messageReaction;
					// const guild_object = (<GuildPrtl[]>args.guild_list).find(g => g.id === args.messageReaction.message.guild.id);

					// if (guild_object) {
					// 	if (messageReaction.message.channel.id === guild_object.music_data.channel_id) {
					// 		const music_channel: TextChannel = args.messageReaction.message.guild.channels.cache
					// 			.find((channel: TextChannel) => channel.id === guild_object.music_data.channel_id);
					// 		// auto na trexei mono otan einai music reaction
					// 		music_channel
					// 			.send(`${args.user}, ${response.value}`)
					// 			.then(msg => { msg.delete({ timeout: 5000 }); })
					// 			.catch(error => console.log(error));
					// 	}
					// }
				}
				else {
					console.log(response.result, response.value);
				}
			}
		});
};

function portal_channel_handler(message: Message): boolean {
	let guild_obejct = guild_list.find((g: GuildPrtl) => g.id === message.guild?.id);
	if (!guild_obejct) return true;

	if (included_in_url_list(message.channel.id, guild_obejct)) {
		if (is_url(message.content)) {
			client_talk(client, guild_list, 'url');
		}
		else {
			client_talk(client, guild_list, 'read_only');
			message_reply(false, message.channel, message, message.author,
				'url-only channel', guild_list, client);
			message.delete();
		}
		return true;
	}
	else if (guild_obejct.music_data.channel_id === message.channel.id) {
		start(client, message, message.content, guild_list)
			.then(joined => {
				// message_reply(
				// 	joined.result, message.channel, message,
				// 	message.author, joined.value, guild_list, client, true
				// );
				message.delete();
			})
			.catch(error => {
				message_reply(
					false, message.channel, message,
					message.author, error, guild_list, client, true
				);
			});
		return true;
	}
	return false;
}

function ranking_system(message: Message): void {
	const level = add_points_message(message, guild_list);
	if (level) {
		message_reply(false, message.channel, message,
			message.author, `you reached level ${level}!`,
			guild_list, client);
	}
}

function log_portal() {
	client.login(config.token_dev);
}

log_portal();

exports.client = client;
exports.log_portal = log_portal;