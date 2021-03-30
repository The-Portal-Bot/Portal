import { ActivityOptions, Client, Guild, GuildMember, PresenceData } from "discord.js";
import { logger } from "../libraries/help.library";
import { get_function } from "../libraries/localisation.library";
import { fetch_guild_members, guild_exists, insert_guild, insert_member, remove_member } from "../libraries/mongo.library";
import { MemberPrtl } from "../types/classes/MemberPrtl.class";

function added_when_down(
	guild: Guild, member_list: MemberPrtl[]
): void {
	const guild_members: GuildMember[] = guild.members.cache.array();

	for (let j = 0; j < guild_members.length; j++) {
		if (!guild_members[j].user.bot) {
			const already_in_db = member_list
				.find(m => m.id === guild_members[j].id);

			if (!already_in_db) { // if inside guild but not in portal db, add member
				insert_member(guild_members[j].id, guild.id)
					.then(r => {
						logger.info(`late-insert ${guild_members[j].id} to ${guild.name} [${guild.id}]`);
					})
					.catch(e => {
						logger.error(new Error(`failed to late-insert member / ${e}`));
					});
			}
		}
	}
}

function removed_when_down(
	guild: Guild, member_list: MemberPrtl[]
): Promise<boolean> {
	return new Promise((resolve) => {
		for (let j = 0; j < member_list.length; j++) {
			const member_in_guild = guild.members.cache.array()
				.find(m => m.id === member_list[j].id);

			if (!member_in_guild) {
				remove_member(member_list[j].id, guild.id)
					.then(r => {
						logger.info(`late-remove ${member_list[j].id} to ${guild.name} [${guild.id}]`);
						return resolve(true);
					})
					.catch(e => {
						logger.error(new Error(`failed to late-remove member / ${e}`));
						return resolve(false);
					});
			}
		}
	});
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
								// added_when_down(guild, member_list);
								// removed_when_down(guild, member_list);

								return resolve(true);
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
): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (!args.client.user) {
			return reject('could not fetch user from client');
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

		args.client.user
			.setPresence(data)
			.catch(e => {
				return reject(`failed to set precense / ${e}`);
			});

		args.client.guilds.cache.forEach((guild: Guild) => {
			logger.info(`${guild} | ${guild.id}`);

			add_guild_again(guild, args.client)
				.catch(e => {
					return reject(`failed to add user again / ${e}`);
				});
			// remove_deleted_channels(guild);
			// remove_empty_voice_channels(guild);
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const func = get_function('console', 1, 'ready');

		return resolve(func
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			? func(args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size)
			: 'error with localisation'
		);
	});
};
