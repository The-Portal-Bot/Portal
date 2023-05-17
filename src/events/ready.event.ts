/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActivityOptions, ActivityType, Client, Guild, GuildMember, PresenceData } from "discord.js";
import { logger } from "../libraries/help.library";
import { get_function } from "../libraries/localisation.library";
import { fetch_guild_members, guildExists, insertGuild, insertMember, remove_member } from "../libraries/mongo.library";
import { PMember } from "../types/classes/PMember.class";

function added_when_down(
    guild: Guild, member_list: PMember[]
): Promise<string> {
    return new Promise((resolve) => {
        const guildMembers: GuildMember[] = guild.members.cache.map(m => m);

        for (let j = 0; j < guildMembers.length; j++) {
            if (!guildMembers[j].user.bot) {
                const already_in_db = member_list
                    .find(m => m.id === guildMembers[j].id);

                if (!already_in_db) { // if inside guild but not in portal db, add member
                    insertMember(guild.id, guildMembers[j].id)
                        .then(() => {
                            logger.info(`late-insert ${guildMembers[j].id} to ${guild.name} [${guild.id}]`);
                        })
                        .catch(e => {
                            logger.error(new Error(`failed to late-insert member: ${e}`));
                        });
                }
            }
        }

        return resolve('finished');
    });
}

function removed_when_down(
    guild: Guild, member_list: PMember[]
): Promise<string> {
    return new Promise((resolve) => {
        for (let j = 0; j < member_list.length; j++) {
            const member_in_guild = guild.members.cache
                .map(m => m)
                .find(m => m.id === member_list[j].id);

            if (!member_in_guild) {
                remove_member(member_list[j].id, guild.id)
                    .then(() => {
                        logger.info(`late-remove ${member_list[j].id} to ${guild.name} [${guild.id}]`);
                    })
                    .catch(e => {
                        logger.error(new Error(`failed to late-remove member: ${e}`));
                    });
            }
        }

        return resolve('finished');
    });
}

async function add_guild_again(
    guild: Guild, client: Client
): Promise<boolean> {
    return new Promise((resolve) => {
        guildExists(guild.id)
            .then(exists => {
                if (!exists) {
                    insertGuild(guild.id, client)
                        .then(response => {
                            return resolve(response);
                        })
                        .catch(() => {
                            return resolve(false);
                        });
                }
                else {
                    fetch_guild_members(guild.id)
                        .then(async member_list => {
                            if (member_list) {
                                await added_when_down(guild, member_list);
                                await removed_when_down(guild, member_list);

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

        const activitiesOptions: ActivityOptions = {
            name: './help', // `in ${args.client.guilds.cache.size} servers``
            type: ActivityType.Listening,
            url: 'https://github.com/keybraker'
        }

        const data: PresenceData = { activities: [activitiesOptions], status: 'online', afk: false };

        args.client.user.setPresence(data);

        args.client.guilds.cache.forEach((guild: Guild) => {
            logger.info(`${guild} | ${guild.id}`);

            add_guild_again(guild, args.client)
                .catch(e => {
                    return reject(`failed to add guild again: ${e}`);
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
