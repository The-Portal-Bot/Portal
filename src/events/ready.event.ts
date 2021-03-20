import { ActivityOptions, Client, Guild, GuildMember, PresenceData } from "discord.js";
import { logger } from "../libraries/help.library";
import { get_function } from "../libraries/localisation.library";
import { fetch_guild_members, guild_exists, insert_guild, insert_member, remove_member } from "../libraries/mongo.library";
import { MemberPrtl } from "../types/classes/MemberPrtl.class";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

function added_when_down(guild: Guild, member_list: MemberPrtl[]): void {
	const guild_members: GuildMember[] = guild.members.cache.array();

	for (let j = 0; j < guild_members.length; j++) {
		if (!guild_members[j].user.bot) {
			const already_in_db = member_list.find(m => m.id === guild_members[j].id);

			if (!already_in_db) { // if inside guild but not in portal db, add member
				insert_member(guild_members[j].id, guild.id)
					.then(r => {
						logger.log({
							level: 'info', type: 'none', message: (`member ${guild_members[j].id} has been ` +
								`late-inserted in guild ${guild.name} [${guild.id}]`)
						});
					})
					.catch(e => {
						logger.log({ level: 'error', type: 'none', message: (new Error(e)).toString() });
					});
			}
		}
	}
}

function removed_when_down(guild: Guild, member_list: MemberPrtl[]): void {
	for (let j = 0; j < member_list.length; j++) {

		const member_in_guild = guild.members.cache.array().find(m => m.id === member_list[j].id);
		if (!member_in_guild) {
			remove_member(member_list[j].id, guild.id)
				.then(r => {
					logger.log({
						level: 'info', type: 'none', message: (`member ${member_list[j].id} has been ` +
							`late-removed from guild ${guild.name} [${guild.id}]`)
					});
				})
				.catch(e => {
					logger.log({ level: 'error', type: 'none', message: (new Error(e)).toString() });
				});
		}
	}
}

function add_guild_again(
	guild: Guild, client: Client
): Promise<boolean> {
	return new Promise((resolve) => {
		guild_exists(guild.id)
			.then(exists => {
				if (!exists) {
					insert_guild(guild.id, client)
						.then(resposne => {
							return resolve(resposne);
						})
						.catch(() => {
							return resolve(false);
						});
				} else {
					fetch_guild_members(guild.id)
						.then(member_list => {
							if (member_list) {
								added_when_down(guild, member_list);
								removed_when_down(guild, member_list);
							} else {
								return resolve(false);
							}
						})
						.catch(() => {
							return resolve(false);
						});
				}
			})
			.catch(() => {
				return resolve(false);
			});
	});
}

module.exports = async (
	args: { client: Client }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!args.client.user) {
			return resolve({
				result: false,
				value: 'could not fetch user from client'
			});
		}

		const options: ActivityOptions = {
			name: './help', // `in ${args.client.guilds.cache.size} servers``
			type: 'LISTENING',
			url: 'https://github.com/keybraker'
		}

		const data: PresenceData = {
			status: 'online',
			afk: false,
			activity: options
		};

		args.client.user.setPresence(data);

		args.client.guilds.cache.forEach((guild: Guild) => {
			logger.log({ level: 'info', type: 'none', message: `${guild} | ${guild.id}` });

			add_guild_again(guild, args.client);
			// remove_deleted_channels(guild);
			// remove_empty_voice_channels(guild);
		});

		const func = get_function('console', 1, 'ready');
		return resolve({
			result: true,
			value: func
				? func(args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size)
				: 'error with localisation'
		});
	});
};
